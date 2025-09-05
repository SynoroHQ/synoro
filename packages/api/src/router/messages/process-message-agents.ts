import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  ProcessMessageInput,
  ProcessMessageResponse,
} from "@synoro/validators";

import {
  getAgentSystemStats,
  processMessageWithAgents,
} from "../../lib/services/agent-message-processor";
import { enhancedBotProcedure, protectedProcedure } from "../../trpc";

// Схема для агентных опций
const AgentOptionsSchema = z.object({
  forceAgentMode: z.boolean().optional(),
  useQualityControl: z.boolean().optional(),
  maxQualityIterations: z.number().min(1).max(5).optional(),
  targetQuality: z.number().min(0).max(1).optional(),
});

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
