import { z } from "zod";

import type { AgentTask } from "../../lib/agents/types";
import { FastResponseAgent } from "../../lib/agents/fast-response-agent";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

const fastResponseAgent = new FastResponseAgent();

export const fastResponseRouter = createTRPCRouter({
  analyze: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        userId: z.string(),
        messageId: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Создаем задачу для агента
        const task: AgentTask = {
          id: `tg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "chat",
          input: input.text,
          context: {
            userId: input.userId,
            messageId: input.messageId,
            channel: "telegram",
            metadata: {
              channel: "telegram",
              userId: input.userId,
              messageId: input.messageId,
              timestamp: new Date().toISOString(),
            },
          },
          priority: 1,
          createdAt: new Date(),
        };

        // Проверяем, может ли агент обработать задачу
        const canHandle = await fastResponseAgent.canHandle(task);
        if (!canHandle) {
          return {
            shouldSendFast: false,
            fastResponse: "",
            needsFullProcessing: true,
            confidence: 0,
            processingType: "full" as const,
          };
        }

        // Обрабатываем через FastResponseAgent
        const result = await fastResponseAgent.process(task);

        if (result.success && result.data) {
          return {
            shouldSendFast: true,
            fastResponse: result.data as string,
            needsFullProcessing: false,
            confidence: result.confidence,
            processingType: "fast" as const,
          };
        }
          // Если агент не смог дать быстрый ответ, отправляем на полную обработку
          return {
            shouldSendFast: false,
            fastResponse: "",
            needsFullProcessing: true,
            confidence: result.confidence,
            processingType: "full" as const,
          };
      } catch (error) {
        console.error("Ошибка в FastResponseRouter:", error);

        // В случае ошибки отправляем на полную обработку
        return {
          shouldSendFast: false,
          fastResponse: "",
          needsFullProcessing: true,
          confidence: 0,
          processingType: "full" as const,
        };
      }
    }),

  stats: protectedProcedure.query(() => {
    return {
      agentStats: fastResponseAgent.getStats(),
      serviceName: "FastResponseRouter",
      version: "1.0.0",
    };
  }),

  clearCache: protectedProcedure.mutation(() => {
    fastResponseAgent.clearCache();
    return { success: true };
  }),
});
