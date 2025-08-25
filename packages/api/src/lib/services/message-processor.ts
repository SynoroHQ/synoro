import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "../../trpc";
import { classifyMessage } from "../ai";
import { MESSAGE_PROCESSING_CONFIG } from "../constants/message-processing";
import {
  getConversationContext,
  saveMessageToConversation,
  trimContextByTokens,
} from "../context-manager";
import { processClassifiedMessage } from "../message-processor";
import {
  createCommonMetadata,
  determineMaxTokens,
  formatExecutionTime,
  safeTruncateForLogging,
} from "../utils/message-utils";

export interface ProcessMessageParams {
  text: string;
  channel: "telegram" | "web" | "mobile";
  userId: string;
  ctx: TRPCContext;
  chatId?: string;
  messageId?: string;
  metadata?: Record<string, unknown>;
}

export interface ProcessMessageResult {
  success: true;
  response: string;
  messageType: {
    type: string;
    subtype: string;
    confidence: number;
    need_logging: boolean;
  };
  relevance: {
    relevant: boolean;
    score: number;
    category: string;
  };
  parsed: any;
}

/**
 * Общая логика обработки сообщения
 */
export async function processMessageInternal(
  params: ProcessMessageParams,
): Promise<ProcessMessageResult> {
  const { text, channel, userId, ctx, chatId, messageId, metadata } = params;

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
        maxMessages: MESSAGE_PROCESSING_CONFIG.CONTEXT.MAX_MESSAGES,
        includeSystemMessages:
          MESSAGE_PROCESSING_CONFIG.CONTEXT.INCLUDE_SYSTEM_MESSAGES,
        maxAgeHours: MESSAGE_PROCESSING_CONFIG.CONTEXT.MAX_AGE_HOURS,
      },
    );

    // Умная обрезка контекста с использованием утилиты
    const maxTokens = determineMaxTokens(text);
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

    // Создаем общие метаданные с использованием утилиты
    const commonMetadata = createCommonMetadata({
      channel,
      userId,
      conversationId: conversationContext.conversationId,
      context: JSON.stringify(trimmedContext),
      chatId,
      messageId,
      metadata,
    });

    // Используем оптимизированную комбинированную классификацию
    const classificationStartTime = Date.now();

    console.log(
      "🚀 Используется унифицированная классификация сообщений с контекстом",
    );
    const classification = await classifyMessage(text, {
      functionId: MESSAGE_PROCESSING_CONFIG.FUNCTION_IDS.CLASSIFIER,
      metadata: commonMetadata,
    });

    const { messageType, relevance } = classification;

    const classificationTime = formatExecutionTime(classificationStartTime);
    console.log(`⏱️ Classification took ${classificationTime}`);

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
        questionFunctionId: MESSAGE_PROCESSING_CONFIG.FUNCTION_IDS.QUESTION,
        chatFunctionId: MESSAGE_PROCESSING_CONFIG.FUNCTION_IDS.CHAT,
        parseFunctionId: MESSAGE_PROCESSING_CONFIG.FUNCTION_IDS.PARSE,
        adviseFunctionId: MESSAGE_PROCESSING_CONFIG.FUNCTION_IDS.ADVISE,
        fallbackParseFunctionId:
          MESSAGE_PROCESSING_CONFIG.FUNCTION_IDS.FALLBACK_PARSE,
        fallbackAdviseFunctionId:
          MESSAGE_PROCESSING_CONFIG.FUNCTION_IDS.FALLBACK_ADVISE,
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
        subtype: messageType.subtype ?? "",
        confidence: messageType.confidence,
        need_logging: messageType.need_logging,
      },
      relevance: {
        relevant: relevance.relevant,
        score: relevance.score ?? 0,
        category: relevance.category ?? "",
      },
      parsed: result.parsed,
    };
  } catch (error) {
    console.error("Ошибка обработки сообщения:", {
      error,
      text: safeTruncateForLogging(text),
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
