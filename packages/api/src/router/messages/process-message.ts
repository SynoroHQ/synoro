import { z } from "zod";

import { classifyMessageType, classifyRelevance } from "../../lib/ai";
import { processClassifiedMessage } from "../../lib/message-processor";
import { botProcedure, protectedProcedure, publicProcedure } from "../../trpc";

// Схема для входящего сообщения
const ProcessMessageInput = z.object({
  text: z.string().min(1).max(5000),
  channel: z.enum(["telegram", "web", "mobile"]),
  userId: z.string(),
  chatId: z.string().optional(),
  messageId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Схема для ответа
const ProcessMessageResponse = z.object({
  success: z.boolean(),
  response: z.string(),
  messageType: z.object({
    type: z.string(),
    subtype: z.string().nullable().optional(),
    confidence: z.number(),
    need_logging: z.boolean(),
  }),
  relevance: z.object({
    relevant: z.boolean(),
    score: z.number().optional(),
    category: z.string().optional(),
  }),
  parsed: z
    .object({
      action: z.string(),
      object: z.string(),
      confidence: z.number().optional(),
    })
    .nullable(),
});

export const processMessageRouter = {
  // Универсальный эндпоинт для обработки сообщений (для веб/мобайл клиентов)
  processMessage: protectedProcedure
    .input(ProcessMessageInput)
    .output(ProcessMessageResponse)
    .mutation(async ({ ctx, input }) => {
      try {
        // Проверяем релевантность сообщения с помощью AI
        const relevance = await classifyRelevance(input.text, {
          functionId: "api-classify-relevance",
          metadata: {
            channel: input.channel,
            userId: input.userId,
            ...(input.chatId && { chatId: input.chatId }),
            ...(input.messageId && { messageId: input.messageId }),
          },
        });

        // Классифицируем тип сообщения
        const messageType = await classifyMessageType(input.text, {
          functionId: "api-classify-message-type",
          metadata: {
            channel: input.channel,
            userId: input.userId,
            ...(input.chatId && { chatId: input.chatId }),
            ...(input.messageId && { messageId: input.messageId }),
          },
        });

        // Обрабатываем сообщение
        const result = await processClassifiedMessage(
          input.text,
          messageType,
          {
            channel: input.channel,
            userId: input.userId,
            chatId: input.chatId,
            messageId: input.messageId,
            metadata: input.metadata,
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

        return {
          success: true,
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
        console.error("Ошибка обработки сообщения:", error);
        throw new Error(
          error instanceof Error ? error.message : "Неизвестная ошибка",
        );
      }
    }),

  // Публичный эндпоинт для Telegram бота
  processMessageFromTelegram: botProcedure
    .input(ProcessMessageInput)
    .output(ProcessMessageResponse)
    .mutation(async ({ ctx, input }) => {
      try {
        // Проверяем релевантность сообщения с помощью AI
        const relevance = await classifyRelevance(input.text, {
          functionId: "api-classify-relevance",
          metadata: {
            channel: input.channel,
            userId: input.userId,
            ...(input.chatId && { chatId: input.chatId }),
            ...(input.messageId && { messageId: input.messageId }),
          },
        });

        // Классифицируем тип сообщения
        const messageType = await classifyMessageType(input.text, {
          functionId: "api-classify-message-type",
          metadata: {
            channel: input.channel,
            userId: input.userId,
            ...(input.chatId && { chatId: input.chatId }),
            ...(input.messageId && { messageId: input.messageId }),
          },
        });

        // Обрабатываем сообщение
        const result = await processClassifiedMessage(
          input.text,
          messageType,
          {
            channel: input.channel,
            userId: input.userId,
            chatId: input.chatId,
            messageId: input.messageId,
            metadata: input.metadata,
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

        return {
          success: true,
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
        console.error("Ошибка обработки сообщения:", error);
        throw new Error(
          error instanceof Error ? error.message : "Неизвестная ошибка",
        );
      }
    }),
};
