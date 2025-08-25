import { and, desc, eq } from "drizzle-orm";

import { conversations, messages } from "@synoro/db/schema";

import type { TRPCContext } from "../trpc";

/**
 * Интерфейс для сообщения в контексте
 */
export interface ContextMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: {
    text: string;
  };
  createdAt: Date;
}

/**
 * Настройки для получения контекста
 */
export interface ContextOptions {
  // Максимальное количество сообщений в контексте
  maxMessages?: number;
  // Включать ли системные сообщения
  includeSystemMessages?: boolean;
  // Максимальный возраст сообщений в часах
  maxAgeHours?: number;
}

/**
 * Результат получения контекста
 */
export interface ConversationContext {
  conversationId: string;
  messages: ContextMessage[];
  totalMessages: number;
  hasMoreMessages: boolean;
}

/**
 * Получает контекст беседы для пользователя и канала связи
 *
 * @param ctx - Контекст TRPC
 * @param userId - ID пользователя
 * @param channel - Канал связи (telegram, web, mobile)
 * @param chatId - ID чата (для Telegram)
 * @param options - Настройки контекста
 * @returns Контекст беседы
 */
export async function getConversationContext(
  ctx: TRPCContext,
  userId: string | null, // userId может быть null для анонимных пользователей
  channel: "telegram" | "web" | "mobile",
  chatId?: string,
  options: ContextOptions = {},
): Promise<ConversationContext> {
  const {
    maxMessages = 10,
    includeSystemMessages = false,
    maxAgeHours = 24,
  } = options;

  let conversation: typeof conversations.$inferSelect | null = null;

  if (userId) {
    // Для зарегистрированных пользователей
    const conditions = [
      eq(conversations.ownerUserId, userId),
      eq(conversations.channel, channel),
    ];

    if (chatId) {
      conditions.push(eq(conversations.title, chatId));
    }

    conversation =
      (await ctx.db.query.conversations.findFirst({
        where: conditions.length === 1 ? conditions[0] : and(...conditions),
      })) ?? null;
  } else if (channel === "telegram" && chatId) {
    // Для анонимных пользователей Telegram
    conversation =
      (await ctx.db.query.conversations.findFirst({
        where: and(
          eq(conversations.telegramChatId, chatId),
          eq(conversations.channel, "telegram"),
        ),
      })) ?? null;
  }

  // Если беседа не найдена, создаем новую
  if (!conversation) {
    const conversationData: typeof conversations.$inferInsert = {
      channel,
      title: chatId ?? `${channel}_conversation`,
      status: "active",
      lastMessageAt: new Date(),
    };

    if (userId) {
      conversationData.ownerUserId = userId;
    } else if (channel === "telegram" && chatId) {
      conversationData.telegramChatId = chatId;
    }
    const [newConversation] = await ctx.db
      .insert(conversations)
      .values(conversationData)
      .returning();

    conversation = newConversation!;
  }

  // Вычисляем время отсечки для старых сообщений
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - maxAgeHours);

  // Получаем сообщения из беседы
  const allMessages = await ctx.db.query.messages.findMany({
    where: eq(messages.conversationId, conversation.id),
    orderBy: [desc(messages.createdAt)],
    limit: maxMessages + 1, // +1 для проверки наличия еще сообщений
  });

  // Фильтруем сообщения по роли если нужно
  const filteredMessages = allMessages.filter((msg) => {
    if (!includeSystemMessages && msg.role === "system") {
      return false;
    }
    return true;
  });

  // Проверяем есть ли еще сообщения
  const hasMoreMessages = filteredMessages.length > maxMessages;
  const contextMessages = filteredMessages
    .slice(0, maxMessages)
    .reverse() // Возвращаем в хронологическом порядке
    .map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: {
        text:
          typeof msg.content === "object" &&
          msg.content &&
          "text" in msg.content
            ? String(msg.content.text)
            : String(msg.content),
      },
      createdAt: msg.createdAt,
    }));

  return {
    conversationId: conversation.id,
    messages: contextMessages,
    totalMessages: filteredMessages.length,
    hasMoreMessages,
  };
}

/**
 * Сохраняет новое сообщение в беседу
 *
 * @param ctx - Контекст TRPC
 * @param conversationId - ID беседы
 * @param role - Роль отправителя
 * @param content - Содержимое сообщения
 * @param model - Модель AI (для ассистента)
 * @returns ID созданного сообщения
 */
export async function saveMessageToConversation(
  ctx: TRPCContext,
  conversationId: string,
  role: "user" | "assistant" | "system" | "tool",
  content: { text: string },
  model?: string,
): Promise<string> {
  const [message] = await ctx.db
    .insert(messages)
    .values({
      conversationId,
      role,
      content,
      model,
      status: "completed",
    })
    .returning();

  // Обновляем время последнего сообщения в беседе
  await ctx.db
    .update(conversations)
    .set({
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));

  return message!.id;
}

/**
 * Оценивает количество токенов в контексте (приблизительно)
 * Простая эвристика: 1 токен ≈ 4 символа для русского текста
 *
 * @param messages - Массив сообщений
 * @returns Приблизительное количество токенов
 */
export function estimateTokenCount(messages: ContextMessage[]): number {
  const totalChars = messages.reduce((sum, msg) => {
    return sum + msg.content.text.length;
  }, 0);

  // Добавляем overhead для структуры сообщений (роли, метаданные)
  const overhead = messages.length * 50; // примерно 50 символов на сообщение для метаданных

  return Math.ceil((totalChars + overhead) / 4);
}

/**
 * Обрезает контекст до указанного лимита токенов
 * Использует умную стратегию сохранения важных сообщений
 *
 * @param messages - Массив сообщений
 * @param maxTokens - Максимальное количество токенов
 * @returns Обрезанный массив сообщений
 */
export function trimContextByTokens(
  messages: ContextMessage[],
  maxTokens: number,
): ContextMessage[] {
  if (estimateTokenCount(messages) <= maxTokens) {
    return messages;
  }

  // Стратегия обрезки:
  // 1. Всегда сохраняем последние 2 сообщения (текущий контекст)
  // 2. Сохраняем важные сообщения (вопросы, длинные ответы)
  // 3. Заполняем оставшееся место последними сообщениями

  const result: ContextMessage[] = [];
  let currentTokens = 0;

  // Всегда сохраняем последние 2 сообщения
  const lastMessages = messages.slice(-2);
  for (const msg of lastMessages) {
    const tokens = Math.ceil((msg.content.text.length + 50) / 4);
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
      msg.content.text.includes("?") ||
      msg.content.text.length > 100 ||
      /\b(как|что|где|когда|почему|зачем|помоги|покажи|объясни)\b/i.test(
        msg.content.text,
      )
    );
  });

  // Добавляем важные сообщения, если есть место
  for (const msg of importantMessages.reverse()) {
    // Начинаем с самых новых важных
    const tokens = Math.ceil((msg.content.text.length + 50) / 4);
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

    const tokens = Math.ceil((msg.content.text.length + 50) / 4);
    if (currentTokens + tokens <= maxTokens) {
      result.unshift(msg);
      currentTokens += tokens;
    } else {
      break;
    }
  }

  // Сортируем по времени создания
  return result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
