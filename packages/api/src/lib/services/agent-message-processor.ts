import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "../../trpc";
import { AgentMessageProcessor } from "../agents/agent-processor";
import { classifyMessage } from "../ai";
import { MESSAGE_PROCESSING_CONFIG } from "../constants/message-processing";
import {
  getConversationContext,
  saveMessageToConversation,
  trimContextByTokens,
} from "../context-manager";
import {
  createCommonMetadata,
  determineMaxTokens,
  formatExecutionTime,
  safeTruncateForLogging,
} from "../utils/message-utils";

export interface ProcessAgentMessageParams {
  text: string;
  channel: "telegram" | "web" | "mobile";
  userId: string | null;
  ctx: TRPCContext;
  chatId?: string;
  messageId?: string;
  metadata?: Record<string, unknown>;
  options?: {
    forceAgentMode?: boolean;
    useQualityControl?: boolean;
    maxQualityIterations?: number;
    targetQuality?: number;
  };
}

export interface ProcessAgentMessageResult {
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
  agentMetadata?: {
    agentsUsed: string[];
    totalSteps: number;
    qualityScore: number;
    processingTime: number;
    processingMode: "agents" | "legacy";
  };
}

// Singleton instance агентного процессора
let agentProcessor: AgentMessageProcessor | null = null;

function getAgentProcessor(): AgentMessageProcessor {
  if (!agentProcessor) {
    agentProcessor = new AgentMessageProcessor();
  }
  return agentProcessor;
}

/**
 * Обработка сообщения с использованием мультиагентной системы
 */
export async function processMessageWithAgents(
  params: ProcessAgentMessageParams,
): Promise<ProcessAgentMessageResult> {
  const {
    text,
    channel,
    userId,
    ctx,
    chatId,
    messageId,
    metadata,
    options = {},
  } = params;

  // Валидация входных данных
  if (!text.trim()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Текст сообщения не может быть пустым",
    });
  }

  if (channel !== "telegram" && !userId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "ID пользователя не указан",
    });
  }

  try {
    const processingStartTime = Date.now();

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

    // Умная обрезка контекста
    const maxTokens = determineMaxTokens(text);
    const trimmedContext = trimContextByTokens(
      conversationContext.messages,
      maxTokens,
    );

    console.log(
      `🤖 [AGENTS] Контекст беседы: ${trimmedContext.length} сообщений (ID: ${conversationContext.conversationId})`,
    );

    // Сохраняем пользовательское сообщение
    await saveMessageToConversation(
      ctx,
      conversationContext.conversationId,
      "user",
      { text },
    );

    // Создаем общие метаданные
    const commonMetadata = createCommonMetadata({
      channel,
      userId,
      conversationId: conversationContext.conversationId,
      chatId,
      messageId,
      metadata: {
        ...metadata,
        contextMessageCount: trimmedContext.length,
        agentMode: true,
      },
    });

    // Классифицируем сообщение
    const classificationStartTime = Date.now();
    console.log("🔍 [AGENTS] Классификация сообщения с контекстом...");

    const classification = await classifyMessage(text, {
      functionId: MESSAGE_PROCESSING_CONFIG.FUNCTION_IDS.CLASSIFIER,
      metadata: commonMetadata,
    });

    const { messageType, relevance } = classification;
    const classificationTime = formatExecutionTime(classificationStartTime);
    console.log(
      `⏱️ [AGENTS] Классификация: ${classificationTime} → ${messageType.type} (${messageType.confidence.toFixed(2)})`,
    );

    // Обрабатываем сообщение через агентную систему
    const agentProcessingStartTime = Date.now();
    const processor = getAgentProcessor();

    const result = await processor.processHybrid(
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
        ...options,
        questionFunctionId: MESSAGE_PROCESSING_CONFIG.FUNCTION_IDS.QUESTION,
        chatFunctionId: MESSAGE_PROCESSING_CONFIG.FUNCTION_IDS.CHAT,
        parseFunctionId: MESSAGE_PROCESSING_CONFIG.FUNCTION_IDS.PARSE,
        adviseFunctionId: MESSAGE_PROCESSING_CONFIG.FUNCTION_IDS.ADVISE,
        fallbackParseFunctionId:
          MESSAGE_PROCESSING_CONFIG.FUNCTION_IDS.FALLBACK_PARSE,
        fallbackAdviseFunctionId:
          MESSAGE_PROCESSING_CONFIG.FUNCTION_IDS.FALLBACK_ADVISE,
        useQualityControl: options.useQualityControl ?? true,
      },
    );

    const agentProcessingTime = formatExecutionTime(agentProcessingStartTime);
    console.log(
      `🚀 [AGENTS] Обработка агентами: ${agentProcessingTime} (режим: ${result.processingMode})`,
    );

    // Логируем информацию об агентах
    if (result.agentMetadata) {
      console.log(
        `🤖 [AGENTS] Использованы агенты: ${result.agentMetadata.agentsUsed.join(" → ")}`,
      );
      console.log(
        `📊 [AGENTS] Качество: ${result.agentMetadata.qualityScore.toFixed(2)}, шагов: ${result.agentMetadata.totalSteps}`,
      );
    }

    // Сохраняем ответ ассистента
    await saveMessageToConversation(
      ctx,
      conversationContext.conversationId,
      "assistant",
      { text: result.response },
      result.model,
    );

    const totalProcessingTime = Date.now() - processingStartTime;

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
      agentMetadata: result.agentMetadata
        ? {
            ...result.agentMetadata,
            processingMode: result.processingMode,
          }
        : {
            agentsUsed: ["legacy-processor"],
            totalSteps: 1,
            qualityScore: 0.7,
            processingTime: totalProcessingTime,
            processingMode: result.processingMode,
          },
    };
  } catch (error) {
    console.error("❌ [AGENTS] Ошибка агентной обработки:", {
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
      message:
        error instanceof Error
          ? error.message
          : "Неизвестная ошибка в агентной системе",
      cause: error,
    });
  }
}

/**
 * Получение статистики агентной системы
 */
export function getAgentSystemStats() {
  const processor = getAgentProcessor();
  return {
    agents: processor.getAgentStats(),
    availableAgents: processor.getAvailableAgents(),
  };
}
