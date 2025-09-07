import { and, desc, eq, gte } from "drizzle-orm";

import { conversations, messages } from "@synoro/db/schema";

import type { TRPCContext } from "../../trpc";
import type { MessageHistoryItem } from "../agents/types";

/**
 * Сервис для работы с историей сообщений агентов
 * Предоставляет удобный интерфейс для получения и форматирования истории
 */
export class AgentMessageHistoryService {
  /**
   * Получает историю сообщений для агентов
   * @param ctx - Контекст TRPC
   * @param userId - ID пользователя
   * @param channel - Канал связи
   * @param options - Настройки получения истории
   * @returns Массив сообщений в формате для агентов
   */
  static async getMessageHistory(
    ctx: TRPCContext,
    userId: string,
    channel: "telegram" | "web" | "mobile",
    options: {
      maxMessages?: number;
      includeSystemMessages?: boolean;
      maxAgeHours?: number;
    } = {},
  ): Promise<MessageHistoryItem[]> {
    const {
      maxMessages = 10,
      includeSystemMessages = false,
      maxAgeHours = 24,
    } = options;

    // Ищем беседу пользователя
    const conversation = await ctx.db.query.conversations.findFirst({
      where: and(
        eq(conversations.ownerUserId, userId),
        eq(conversations.channel, channel),
      ),
    });

    if (!conversation) {
      return [];
    }

    // Вычисляем время отсечки для старых сообщений
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - maxAgeHours);

    // Получаем сообщения из беседы
    const dbMessages = await ctx.db.query.messages.findMany({
      where: and(
        eq(messages.conversationId, conversation.id),
        // Фильтр по времени, если указан
        maxAgeHours > 0 ? gte(messages.createdAt, cutoffTime) : undefined,
      ),
      orderBy: [desc(messages.createdAt)],
      limit: maxMessages,
    });

    // Фильтруем системные сообщения если нужно
    const filteredMessages = dbMessages.filter((msg) => {
      if (!includeSystemMessages && msg.role === "system") {
        return false;
      }
      return true;
    });

    // Преобразуем в формат для агентов
    return filteredMessages
      .reverse() // Возвращаем в хронологическом порядке
      .map(
        (msg): MessageHistoryItem => ({
          id: msg.id,
          role: msg.role,
          content: this.extractTextContent(msg.content),
          timestamp: msg.createdAt,
          metadata: {
            model: msg.model || undefined,
            ...(msg.content &&
            typeof msg.content === "object" &&
            "metadata" in msg.content
              ? (msg.content.metadata as Record<string, unknown>)
              : {}),
          },
        }),
      );
  }

  /**
   * Получает историю сообщений с умной обрезкой по токенам
   * @param ctx - Контекст TRPC
   * @param userId - ID пользователя
   * @param channel - Канал связи
   * @param maxTokens - Максимальное количество токенов
   * @returns Массив сообщений с умной обрезкой
   */
  static async getMessageHistoryWithTokenLimit(
    ctx: TRPCContext,
    userId: string,
    channel: "telegram" | "web" | "mobile",
    maxTokens: number,
  ): Promise<MessageHistoryItem[]> {
    // Получаем больше сообщений для умной обрезки
    const allMessages = await this.getMessageHistory(ctx, userId, channel, {
      maxMessages: 50, // Больше сообщений для анализа
      includeSystemMessages: false,
      maxAgeHours: 24,
    });

    return this.trimHistoryByTokens(allMessages, maxTokens);
  }

  /**
   * Извлекает текстовое содержимое из контента сообщения
   * @param content - Контент сообщения из БД
   * @returns Текстовое содержимое
   */
  private static extractTextContent(content: any): string {
    if (typeof content === "string") {
      return content;
    }

    if (content && typeof content === "object") {
      if ("text" in content) {
        return String(content.text);
      }
      if ("content" in content) {
        return String(content.content);
      }
    }

    return String(content);
  }

  /**
   * Умная обрезка истории по токенам
   * Сохраняет важные сообщения и последние сообщения
   * @param messages - Массив сообщений
   * @param maxTokens - Максимальное количество токенов
   * @returns Обрезанный массив сообщений
   */
  private static trimHistoryByTokens(
    messages: MessageHistoryItem[],
    maxTokens: number,
  ): MessageHistoryItem[] {
    if (this.estimateTokenCount(messages) <= maxTokens) {
      return messages;
    }

    const result: MessageHistoryItem[] = [];
    let currentTokens = 0;

    // Всегда сохраняем последние 2 сообщения
    const lastMessages = messages.slice(-2);
    for (const msg of lastMessages) {
      const tokens = this.estimateMessageTokens(msg);
      result.push(msg);
      currentTokens += tokens;
    }

    // Если места больше нет, возвращаем последние сообщения
    if (currentTokens >= maxTokens) {
      return result;
    }

    // Ищем важные сообщения из оставшихся
    const remainingMessages = messages.slice(0, -2);
    const importantMessages = remainingMessages.filter((msg) => {
      // Важные: вопросы, длинные ответы, сообщения с ключевыми словами
      return (
        msg.content.includes("?") ||
        msg.content.length > 100 ||
        /\b(как|что|где|когда|почему|зачем|помоги|покажи|объясни)\b/i.test(
          msg.content,
        ) ||
        msg.role === "system" // Системные сообщения важны
      );
    });

    // Добавляем важные сообщения, если есть место
    for (const msg of importantMessages.reverse()) {
      const tokens = this.estimateMessageTokens(msg);
      if (currentTokens + tokens <= maxTokens) {
        result.unshift(msg);
        currentTokens += tokens;
      }
    }

    // Заполняем оставшееся место обычными сообщениями (с конца)
    for (let i = remainingMessages.length - 1; i >= 0; i--) {
      const msg = remainingMessages[i]!;

      // Пропускаем уже добавленные важные сообщения
      if (result.find((r) => r.id === msg.id)) {
        continue;
      }

      const tokens = this.estimateMessageTokens(msg);
      if (currentTokens + tokens <= maxTokens) {
        result.unshift(msg);
        currentTokens += tokens;
      } else {
        break;
      }
    }

    // Сортируем по времени создания
    return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Оценивает количество токенов в сообщении
   * @param message - Сообщение
   * @returns Приблизительное количество токенов
   */
  private static estimateMessageTokens(message: MessageHistoryItem): number {
    // Базовые токены для структуры сообщения
    const baseTokens = 10;
    // Токены для контента (приблизительно 1 токен = 4 символа для русского)
    const contentTokens = Math.ceil(message.content.length / 4);
    // Токены для метаданных
    const metadataTokens = message.metadata ? 5 : 0;

    return baseTokens + contentTokens + metadataTokens;
  }

  /**
   * Оценивает общее количество токенов в массиве сообщений
   * @param messages - Массив сообщений
   * @returns Приблизительное количество токенов
   */
  private static estimateTokenCount(messages: MessageHistoryItem[]): number {
    return messages.reduce(
      (sum, msg) => sum + this.estimateMessageTokens(msg),
      0,
    );
  }

  /**
   * Форматирует историю сообщений для передачи в AI промпт
   * @param messages - Массив сообщений
   * @param maxLength - Максимальная длина форматированного текста
   * @returns Форматированная строка с историей
   */
  static formatHistoryForPrompt(
    messages: MessageHistoryItem[],
    maxLength = 2000,
  ): string {
    if (messages.length === 0) {
      return "";
    }

    const formattedMessages = messages.map((msg) => {
      const timestamp = msg.timestamp.toLocaleString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const role =
        msg.role === "user"
          ? "Пользователь"
          : msg.role === "assistant"
            ? "Ассистент"
            : msg.role === "system"
              ? "Система"
              : "Инструмент";

      return `[${timestamp}] ${role}: ${msg.content}`;
    });

    let result = formattedMessages.join("\n");

    // Обрезаем если слишком длинно
    if (result.length > maxLength) {
      result = result.substring(0, maxLength - 3) + "...";
    }

    return result;
  }

  /**
   * Получает краткую сводку истории для контекста
   * @param messages - Массив сообщений
   * @param maxMessages - Максимальное количество сообщений для сводки
   * @returns Краткая сводка истории
   */
  static getHistorySummary(
    messages: MessageHistoryItem[],
    maxMessages = 3,
  ): string {
    if (messages.length === 0) {
      return "История диалога пуста";
    }

    const recentMessages = messages.slice(-maxMessages);
    const summary = recentMessages
      .map((msg, index) => {
        const role = msg.role === "user" ? "Пользователь" : "Ассистент";
        const content =
          msg.content.length > 100
            ? msg.content.substring(0, 100) + "..."
            : msg.content;
        return `${index + 1}. ${role}: ${content}`;
      })
      .join("\n");

    return `Последние ${recentMessages.length} сообщений:\n${summary}`;
  }
}
