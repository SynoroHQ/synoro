import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  ProcessMessageInput,
  ProcessMessageResponse,
} from "@synoro/validators";

import type { AgentTask } from "../../lib/agents/types";
import { AgentManager } from "../../lib/agents/agent-manager";
import { saveMessageToConversation } from "../../lib/context-manager";
import { enhancedBotProcedure, protectedProcedure } from "../../trpc";

// Схема для агентных опций
const AgentOptionsSchema = z.object({
  forceAgentMode: z.boolean().optional(),
  useQualityControl: z.boolean().optional(),
  maxQualityIterations: z.number().min(1).max(5).optional(),
  targetQuality: z.number().min(0).max(1).optional(),
});

// Глобальный экземпляр менеджера агентов
const agentManager = new AgentManager();

/**
 * Обработка сообщения через систему агентов
 */
async function processMessageWithAgents({
  text,
  channel,
  userId,
  ctx,
  messageId,
  metadata,
  options,
}: {
  text: string;
  channel: string;
  userId: string;
  ctx: any;
  messageId?: string;
  metadata?: any;
  options?: any;
}) {
  const startTime = Date.now();

  try {
    // Создаем задачу для агента
    const task: AgentTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      input: text,
      type: "general",
      context: {
        userId,
        channel,
        messageId,
        householdId: metadata?.householdId,
        timezone: metadata?.timezone || "Europe/Moscow", // Добавляем timezone
        db: ctx.db, // Передаем базу данных для получения истории
        conversationId: metadata?.conversationId,
        ...metadata,
      },
      priority: 1,
      createdAt: new Date(),
    };

    // Обрабатываем через менеджер агентов
    const result = await agentManager.processRequest(text, task.context);

    const processingTime = Date.now() - startTime;

    // Сохраняем сообщения в базу данных для истории
    try {
      if (metadata?.conversationId) {
        // Сохраняем пользовательское сообщение
        await saveMessageToConversation(ctx, metadata.conversationId, "user", {
          text,
        });

        // Сохраняем ответ ассистента
        if (result.success && result.data) {
          await saveMessageToConversation(
            ctx,
            metadata.conversationId,
            "assistant",
            { text: result.data },
          );
        }
      }
    } catch (error) {
      console.error("Failed to save messages to conversation:", error);
      // Не прерываем выполнение, только логируем ошибку
    }

    return {
      success: result.success,
      response:
        result.data ||
        result.error ||
        "Извините, произошла ошибка при обработке запроса.",
      messageType: {
        type: "text",
        confidence: result.confidence || 0.8,
        need_logging: true,
      },
      relevance: {
        relevant: true,
        score: result.confidence || 0.8,
        category: "general",
      },
      parsed: null,
      agentMetadata: {
        agentsUsed: ["ai-agent"],
        totalSteps: 1,
        qualityScore: result.confidence || 0.8,
        processingTime,
        processingMode: "agents" as const,
        shouldLogEvent: false,
      },
    };
  } catch (error) {
    console.error("Error in processMessageWithAgents:", error);
    const processingTime = Date.now() - startTime;

    return {
      success: false,
      response:
        "Извините, произошла ошибка при обработке запроса. Попробуйте еще раз.",
      messageType: {
        type: "text",
        confidence: 0,
        need_logging: false,
      },
      relevance: {
        relevant: false,
        score: 0,
        category: "error",
      },
      parsed: null,
      agentMetadata: {
        agentsUsed: [],
        totalSteps: 0,
        qualityScore: 0,
        processingTime,
        processingMode: "agents" as const,
        shouldLogEvent: false,
      },
    };
  }
}

/**
 * Получение статистики системы агентов
 */
function getAgentSystemStats() {
  const agents = agentManager.getAgentsForStats();

  return {
    agents: {
      totalAgents: agents.length,
      agentList: agents.map((agent) => agent.name),
    },
    availableAgents: agents.map((agent) => ({
      key: agent.name.toLowerCase().replace(/\s+/g, "-"),
      name: agent.name,
      description: agent.description,
      capabilities: agent.capabilities,
    })),
  };
}

// Расширенная схема для агентной обработки
const ProcessMessageWithAgentsInput = ProcessMessageInput.safeExtend({
  agentOptions: AgentOptionsSchema.optional(),
});

// Расширенная схема ответа с метаданными агентов
const ProcessMessageWithAgentsResponse = ProcessMessageResponse.safeExtend({
  agentMetadata: z
    .object({
      agentsUsed: z.array(z.string()),
      totalSteps: z.number(),
      qualityScore: z.number(),
      processingTime: z.number(),
      processingMode: z.enum(["agents"]),
      shouldLogEvent: z.boolean().optional(), // Флаг для автоматического логирования событий
    })
    .optional(),
});

export const processMessageAgentsRouter = {
  // Обработка сообщений с агентами для веб/мобильных клиентов
  processMessageWithAgents: protectedProcedure
    .input(ProcessMessageWithAgentsInput)
    .output(ProcessMessageWithAgentsResponse)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Пользователь не зарегистрирован в системе",
        });
      }
      return processMessageWithAgents({
        text: input.text,
        channel: input.channel,
        userId: userId,
        ctx,
        messageId: input.messageId,
        metadata: input.metadata,
        options: input.agentOptions,
      });
    }),

  // Обработка сообщений с агентами для Telegram бота
  processMessageFromTelegramWithAgents: enhancedBotProcedure
    .input(ProcessMessageWithAgentsInput)
    .mutation(async ({ ctx, input }) => {
      return processMessageWithAgents({
        text: input.text,
        channel: input.channel,
        userId: ctx.userId,
        ctx,
        messageId: input.messageId,
        metadata: {
          ...input.metadata,
          telegramUserId: ctx.telegramUserId,
          conversationId: ctx.conversationId,
        },
        options: input.agentOptions,
      });
    }),

  // Получение статистики агентной системы
  getAgentStats: protectedProcedure
    .output(
      z.object({
        agents: z.object({
          totalAgents: z.number(),
          agentList: z.array(z.string()),
        }),
        availableAgents: z.array(
          z.object({
            key: z.string(),
            name: z.string(),
            description: z.string(),
            capabilities: z.array(
              z.object({
                name: z.string(),
                description: z.string(),
                category: z.string(),
                confidence: z.number(),
              }),
            ),
          }),
        ),
      }),
    )
    .query(() => {
      return getAgentSystemStats();
    }),

  // Публичное получение статистики для бота
  getAgentStatsForBot: enhancedBotProcedure
    .output(
      z.object({
        totalAgents: z.number(),
        agentList: z.array(z.string()),
      }),
    )
    .query(() => {
      const stats = getAgentSystemStats();
      return stats.agents;
    }),
};
