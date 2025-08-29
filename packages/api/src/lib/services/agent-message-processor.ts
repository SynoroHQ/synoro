import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "../../trpc";
import { AgentMessageProcessor } from "../agents/agent-processor";
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
import { AgentContext } from "../agents/agent-context";

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
    processingMode: "agents";
    shouldLogEvent: boolean;
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

    // Создаем контекст для агентов с включением истории беседы
    const agentContext: AgentContext = {
      userId: userId ?? undefined,
      chatId,
      messageId,
      channel,
      metadata: {
        ...commonMetadata,
        // Добавляем контекст разговора для трейсинга
        conversationContext: {
          conversationId: conversationContext.conversationId,
          totalMessages: conversationContext.totalMessages,
          contextMessages: trimmedContext.length,
          hasMoreMessages: conversationContext.hasMoreMessages,
        },
        // Добавляем историю сообщений для трейсинга
        conversationHistory: trimmedContext.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content.text,
          createdAt: msg.createdAt,
        })),
      },
    };

    // Обрабатываем сообщение через агентную систему
    const agentProcessingStartTime = Date.now();
    const processor = getAgentProcessor();

    const result = await processor.processMessage(
      text,
      agentContext,
      {
        useQualityControl: options.useQualityControl ?? true,
        maxQualityIterations: options.maxQualityIterations ?? 2,
        targetQuality: options.targetQuality ?? 0.8,
      },
    );

    const agentProcessingTime = formatExecutionTime(agentProcessingStartTime);
    console.log(`🚀 [AGENTS] Обработка агентами: ${agentProcessingTime}`);

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
        type: "processed",
        subtype: "",
        confidence: 0.9,
        need_logging: false,
      },
      relevance: {
        relevant: true,
        score: 0.9,
        category: "agent-processed",
      },
      parsed: result.parsed,
      agentMetadata: result.agentMetadata
        ? {
            ...result.agentMetadata,
            processingMode: "agents",
          }
        : {
            agentsUsed: ["agent-processor"],
            totalSteps: 1,
            qualityScore: 0.7,
            processingTime: totalProcessingTime,
            processingMode: "agents",
            shouldLogEvent: false,
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
