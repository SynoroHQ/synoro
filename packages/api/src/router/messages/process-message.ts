import { TRPCError } from "@trpc/server";

import {
  ProcessMessageInput,
  ProcessMessageResponse,
} from "@synoro/validators";

import type { TRPCContext } from "../../trpc";
import { classifyMessage } from "../../lib/ai";
import {
  getConversationContext,
  saveMessageToConversation,
  trimContextByTokens,
} from "../../lib/context-manager";
import { processClassifiedMessage } from "../../lib/message-processor";
import { botProcedure, protectedProcedure } from "../../trpc";

/**
 * Общая логика обработки сообщения
 */
async function processMessageInternal(
  text: string,
  channel: "telegram" | "web" | "mobile",
  userId: string,
  ctx: TRPCContext,
  chatId?: string,
  messageId?: string,
  metadata?: Record<string, unknown>,
) {
  // Валидация входных данных
  if (!text.trim()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Текст сообщения не может быть пустым",
    });
  }

  if (!userId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "ID пользователя не указан",
    });
  }

  try {
    // Получаем контекст беседы
    const conversationContext = await getConversationContext(
      ctx,
      userId,
      channel,
      chatId,
      {
        maxMessages: 20, // Берем больше сообщений
        includeSystemMessages: false,
        maxAgeHours: 48, // Увеличиваем время
      },
    );

    // Умная обрезка контекста:
    // - До 2000 токенов для вопросов и чата (больше контекста)
    // - До 1000 токенов для событий (меньше контекста нужен)
    const maxTokens = text.includes("?") || text.length < 50 ? 2000 : 1000;
    const trimmedContext = trimContextByTokens(
      conversationContext.messages,
      maxTokens,
    );

    console.log(
      `📚 Контекст беседы: ${trimmedContext.length} сообщений (ID: ${conversationContext.conversationId})`,
    );

    // Сохраняем пользовательское сообщение в беседу
    await saveMessageToConversation(
      ctx,
      conversationContext.conversationId,
      "user",
      { text },
    );

    const commonMetadata = {
      channel,
      userId,
      conversationId: conversationContext.conversationId,
      context: JSON.stringify(trimmedContext),
      ...(chatId && { chatId }),
      ...(messageId && { messageId }),
      ...metadata,
    };

    // Используем оптимизированную комбинированную классификацию
    const classificationStartTime = Date.now();

    console.log("🚀 Используется унифицированная классификация сообщений с контекстом");
    const classification = await classifyMessage(text, {
      functionId: "api-message-classifier",
      metadata: commonMetadata,
    });

    const { messageType, relevance } = classification;

    const classificationTime = Date.now() - classificationStartTime;
    console.log(`⏱️ Classification took ${classificationTime}ms`);

    // Обрабатываем сообщение с контекстом
    const result = await processClassifiedMessage(
      text,
      messageType,
      {
        channel,
        userId,
        chatId,
        messageId,
        metadata: commonMetadata,
        conversationId: conversationContext.conversationId,
        context: trimmedContext,
      },
      {
        questionFunctionId: "api-answer-question",
        chatFunctionId: "api-chat-response",
        parseFunctionId: "api-parse-text",
        adviseFunctionId: "api-advise",
        fallbackParseFunctionId: "api-parse-text-fallback",
        fallbackAdviseFunctionId: "api-advise-fallback",
      },
    );

    // Сохраняем ответ ассистента в беседу
    await saveMessageToConversation(
      ctx,
      conversationContext.conversationId,
      "assistant",
      { text: result.response },
      result.model, // Используем модель из результата вместо хардкода
    );

    return {
      success: true as const,
      response: result.response,
      messageType: {
        type: messageType.type,
        subtype: messageType.subtype,
        confidence: messageType.confidence,
        need_logging: messageType.need_logging,
      },
      relevance: {
        relevant: relevance.relevant,
        score: relevance.score,
        category: relevance.category,
      },
      parsed: result.parsed,
    };
  } catch (error) {
    console.error("Ошибка обработки сообщения:", {
      error,
      text: text.substring(0, 100), // Логируем только первые 100 символов для безопасности
      channel,
      userId,
      chatId,
      messageId,
    });

    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "Неизвестная ошибка",
      cause: error,
    });
  }
}

export const processMessageRouter = {
  // Универсальный эндпоинт для обработки сообщений (для веб/мобайл клиентов)
  processMessage: protectedProcedure
    .input(ProcessMessageInput)
    .output(ProcessMessageResponse)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return processMessageInternal(
        input.text,
        input.channel,
        userId,
        ctx,
        input.chatId,
        input.messageId,
        input.metadata,
      );
    }),

  // Публичный эндпоинт для Telegram бота
  processMessageFromTelegram: botProcedure
    .input(ProcessMessageInput)
    .output(ProcessMessageResponse)
    .mutation(async ({ ctx, input }) => {
      // Для bot запросов используем botUserId из контекста
      const userId = ctx.botUserId;
      if (!userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID пользователя бота не указан в контексте",
        });
      }

      return processMessageInternal(
        input.text,
        input.channel,
        userId,
        ctx,
        input.chatId,
        input.messageId,
        input.metadata,
      );
    }),
};
