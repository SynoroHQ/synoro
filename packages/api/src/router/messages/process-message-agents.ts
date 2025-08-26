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
import { TelegramUserService } from "../../lib/services/telegram-user-service";
import { botProcedure, protectedProcedure } from "../../trpc";

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
    })
    .optional(),
});

export const processMessageAgentsRouter = {
  // Обработка сообщений с агентами для веб/мобильных клиентов
  processMessageWithAgents: protectedProcedure
    .input(ProcessMessageWithAgentsInput)
    .output(ProcessMessageWithAgentsResponse)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return processMessageWithAgents({
        text: input.text,
        channel: input.channel,
        userId,
        ctx,
        chatId: input.chatId,
        messageId: input.messageId,
        metadata: input.metadata,
        options: input.agentOptions,
      });
    }),

  // Обработка сообщений с агентами для Telegram бота
  processMessageFromTelegramWithAgents: botProcedure
    .input(ProcessMessageWithAgentsInput)
    .output(ProcessMessageWithAgentsResponse)
    .mutation(async ({ ctx, input }) => {
      const telegramUserId = input.telegramUserId;
      if (!telegramUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID пользователя Telegram не указан в запросе",
        });
      }

      const chatId = input.chatId;
      if (!chatId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID чата Telegram не указан в запросе",
        });
      }

      // Получаем контекст пользователя
      const userContext = await TelegramUserService.getUserContext(
        telegramUserId,
        chatId,
        input.messageId,
      );

      return processMessageWithAgents({
        text: input.text,
        channel: input.channel,
        userId: userContext.userId ?? null,
        ctx,
        chatId: chatId,
        messageId: input.messageId,
        metadata: {
          ...input.metadata,
          telegramUserId,
          telegramChatId: chatId,
          isAnonymous: userContext.isAnonymous,
          conversationId: userContext.conversationId,
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
  getAgentStatsForBot: botProcedure
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
