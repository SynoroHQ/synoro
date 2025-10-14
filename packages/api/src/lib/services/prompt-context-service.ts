import type { AgentTask, MessageHistoryItem } from "../agents/types";

/**
 * Опции для обработки промпта
 */
export interface PromptContextOptions {
  /** Максимальная длина истории в символах */
  maxHistoryLength?: number;
  /** Максимальное количество сообщений в истории */
  maxHistoryMessages?: number;
  /** Включать ли системные сообщения */
  includeSystemMessages?: boolean;
  /** Часовой пояс для форматирования времени */
  timezone?: string;
  /** Максимальное количество токенов для истории */
  maxHistoryTokens?: number;
}

/**
 * Результат обработки промпта
 */
export interface ProcessedPrompt {
  /** Обработанный промпт с замененными плейсхолдерами */
  prompt: string;
  /** Метаданные обработки */
  metadata: {
    /** Количество сообщений в истории */
    historyMessagesCount: number;
    /** Была ли обрезана история */
    historyTruncated: boolean;
    /** Список замененных плейсхолдеров */
    placeholdersReplaced: string[];
    /** Приблизительное количество токенов */
    estimatedTokens: number;
    /** Предупреждения (если есть) */
    warnings?: string[];
  };
}

/**
 * Значения по умолчанию для плейсхолдеров
 */
const DEFAULT_VALUES = {
  userId: "anonymous",
  householdId: "none",
  currentTime: () => new Date().toISOString(),
  timezone: "UTC",
  messageHistory: "История диалога пуста",
  eventContext: "События пользователя не загружены",
};

/**
 * Сервис для обработки промптов и замены плейсхолдеров
 */
export class PromptContextService {
  /**
   * Обрабатывает промпт, заменяя все плейсхолдеры на реальные значения
   */
  processPrompt(
    promptTemplate: string,
    task: AgentTask,
    options: PromptContextOptions = {},
  ): ProcessedPrompt {
    const warnings: string[] = [];
    const placeholdersReplaced: string[] = [];

    try {
      // Заменяем историю сообщений
      const historyResult = this.replaceMessageHistory(
        promptTemplate,
        task.messageHistory ?? [],
        {
          maxHistoryLength: options.maxHistoryLength ?? 1500,
          maxHistoryMessages: options.maxHistoryMessages ?? 10,
          includeSystemMessages: options.includeSystemMessages ?? false,
          timezone: options.timezone ?? "UTC",
          maxHistoryTokens: options.maxHistoryTokens ?? 500,
        },
      );

      let processedPrompt = historyResult.prompt;
      warnings.push(...(historyResult.metadata.warnings ?? []));

      if (historyResult.metadata.replaced) {
        placeholdersReplaced.push("messageHistory");
      }

      // Заменяем контекстные плейсхолдеры
      const contextResult = this.replaceContextPlaceholders(
        processedPrompt,
        task.context,
      );

      processedPrompt = contextResult.prompt;
      placeholdersReplaced.push(...contextResult.replaced);

      // Оцениваем количество токенов
      const estimatedTokens = this.estimateTokens(processedPrompt);

      // Логируем метаданные
      if (process.env.DEBUG_PROMPTS === "true") {
        console.log("Prompt processing completed:", {
          historyMessagesCount: historyResult.metadata.historyMessagesCount,
          historyTruncated: historyResult.metadata.historyTruncated,
          placeholdersReplaced,
          estimatedTokens,
          warnings,
        });
      }

      return {
        prompt: processedPrompt,
        metadata: {
          historyMessagesCount: historyResult.metadata.historyMessagesCount,
          historyTruncated: historyResult.metadata.historyTruncated,
          placeholdersReplaced,
          estimatedTokens,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
      };
    } catch (error) {
      console.error("Failed to process prompt:", error);
      // Возвращаем промпт без обработки при ошибке
      return {
        prompt: promptTemplate,
        metadata: {
          historyMessagesCount: 0,
          historyTruncated: false,
          placeholdersReplaced: [],
          estimatedTokens: this.estimateTokens(promptTemplate),
          warnings: [
            `Ошибка обработки промпта: ${error instanceof Error ? error.message : String(error)}`,
          ],
        },
      };
    }
  }

  /**
   * Заменяет плейсхолдер {{messageHistory}} на форматированную историю
   */
  private replaceMessageHistory(
    prompt: string,
    messageHistory: AgentTask["messageHistory"],
    options: Required<PromptContextOptions>,
  ): {
    prompt: string;
    metadata: {
      historyMessagesCount: number;
      historyTruncated: boolean;
      replaced: boolean;
      warnings?: string[];
    };
  } {
    const warnings: string[] = [];

    // Проверяем наличие плейсхолдера
    if (!prompt.includes("{{messageHistory}}")) {
      return {
        prompt,
        metadata: {
          historyMessagesCount: 0,
          historyTruncated: false,
          replaced: false,
        },
      };
    }

    // Если история пуста
    if (!messageHistory || messageHistory.length === 0) {
      console.info("Message history is empty");
      return {
        prompt: prompt.replace(
          "{{messageHistory}}",
          DEFAULT_VALUES.messageHistory,
        ),
        metadata: {
          historyMessagesCount: 0,
          historyTruncated: false,
          replaced: true,
        },
      };
    }

    // Оптимизируем историю по размеру
    const optimizedHistory = this.optimizeHistorySize(
      messageHistory,
      options.maxHistoryTokens,
    );

    // Ограничиваем количество сообщений
    let finalHistory = optimizedHistory;
    if (optimizedHistory.length > options.maxHistoryMessages) {
      finalHistory = optimizedHistory.slice(-options.maxHistoryMessages);
      warnings.push(
        `История обрезана с ${optimizedHistory.length} до ${options.maxHistoryMessages} сообщений`,
      );
    }

    // Фильтруем системные сообщения если нужно
    if (!options.includeSystemMessages) {
      finalHistory = finalHistory.filter((msg) => msg.role !== "system");
    }

    const historyTruncated = finalHistory.length < messageHistory.length;

    if (historyTruncated) {
      console.info(
        `Message history truncated from ${messageHistory.length} to ${finalHistory.length} messages`,
      );
    }

    // Форматируем историю
    const formattedHistory = this.formatMessageHistory(
      finalHistory,
      options.maxHistoryLength,
    );

    return {
      prompt: prompt.replace("{{messageHistory}}", formattedHistory),
      metadata: {
        historyMessagesCount: finalHistory.length,
        historyTruncated,
        replaced: true,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    };
  }

  /**
   * Заменяет контекстные плейсхолдеры (userId, currentTime, timezone, householdId)
   */
  private replaceContextPlaceholders(
    prompt: string,
    context: AgentTask["context"],
  ): { prompt: string; replaced: string[] } {
    let processedPrompt = prompt;
    const replaced: string[] = [];

    // Заменяем userId
    if (processedPrompt.includes("{{userId}}")) {
      const userId = context.userId ?? DEFAULT_VALUES.userId;
      if (!context.userId) {
        console.warn("userId not found in context, using default value");
      }
      processedPrompt = processedPrompt.replace(/\{\{userId\}\}/g, userId);
      replaced.push("userId");
    }

    // Заменяем currentTime
    if (processedPrompt.includes("{{currentTime}}")) {
      const currentTime = DEFAULT_VALUES.currentTime();
      processedPrompt = processedPrompt.replace(
        /\{\{currentTime\}\}/g,
        currentTime,
      );
      replaced.push("currentTime");
    }

    // Заменяем timezone
    if (processedPrompt.includes("{{timezone}}")) {
      const timezone = context.timezone ?? DEFAULT_VALUES.timezone;
      if (!context.timezone) {
        console.warn("timezone not found in context, using default value");
      }
      processedPrompt = processedPrompt.replace(/\{\{timezone\}\}/g, timezone);
      replaced.push("timezone");
    }

    // Заменяем householdId
    if (processedPrompt.includes("{{householdId}}")) {
      const householdId = context.householdId ?? DEFAULT_VALUES.householdId;
      if (!context.householdId) {
        console.warn("householdId not found in context, using default value");
      }
      processedPrompt = processedPrompt.replace(
        /\{\{householdId\}\}/g,
        householdId,
      );
      replaced.push("householdId");
    }

    // Заменяем eventContext
    if (processedPrompt.includes("{{eventContext}}")) {
      const eventContext =
        context.eventContext ?? "События пользователя не загружены";
      processedPrompt = processedPrompt.replace(
        /\{\{eventContext\}\}/g,
        eventContext,
      );
      replaced.push("eventContext");
    }

    return { prompt: processedPrompt, replaced };
  }

  /**
   * Форматирует историю сообщений для промпта
   */
  private formatMessageHistory(
    messages: MessageHistoryItem[],
    maxLength: number,
  ): string {
    if (messages.length === 0) {
      return DEFAULT_VALUES.messageHistory;
    }

    // Объединяем последовательные сообщения от одного пользователя
    const mergedMessages: MessageHistoryItem[] = [];
    let currentMessage: MessageHistoryItem | null = null;

    for (const msg of messages) {
      if (currentMessage && currentMessage.role === msg.role) {
        // Объединяем с предыдущим сообщением
        currentMessage = {
          id: currentMessage.id,
          role: currentMessage.role,
          content: `${currentMessage.content}\n${msg.content}`,
          timestamp: currentMessage.timestamp,
          metadata: currentMessage.metadata,
        };
      } else {
        if (currentMessage) {
          mergedMessages.push(currentMessage);
        }
        currentMessage = {
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          metadata: msg.metadata,
        };
      }
    }

    if (currentMessage) {
      mergedMessages.push(currentMessage);
    }

    // Форматируем сообщения
    const formattedMessages = mergedMessages.map((msg) => {
      const timestamp = msg.timestamp.toLocaleString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const roleMap: Record<MessageHistoryItem["role"], string> = {
        user: "Пользователь",
        assistant: "Ассистент",
        system: "Система",
        tool: "Инструмент",
      };

      const role = roleMap[msg.role];
      return `[${timestamp}] ${role}: ${msg.content}`;
    });

    const historyText = formattedMessages.join("\n");

    // Обрезаем если слишком длинно
    if (historyText.length > maxLength) {
      return historyText.substring(0, maxLength - 3) + "...";
    }

    return historyText;
  }

  /**
   * Оптимизирует историю по размеру токенов
   */
  private optimizeHistorySize(
    messages: MessageHistoryItem[],
    maxTokens: number,
  ): MessageHistoryItem[] {
    if (messages.length === 0) {
      return messages;
    }

    const result: MessageHistoryItem[] = [];
    let currentTokens = 0;

    // Берем сообщения с конца (самые свежие)
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (!msg) continue;

      const msgTokens = this.estimateTokens(msg.content);

      if (currentTokens + msgTokens <= maxTokens) {
        result.unshift(msg);
        currentTokens += msgTokens;
      } else {
        // Достигли лимита токенов
        break;
      }
    }

    return result;
  }

  /**
   * Оценивает количество токенов в тексте
   * Приблизительная оценка: 1 токен ≈ 4 символа для русского языка
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
