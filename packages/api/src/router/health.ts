/**
 * Health check endpoints для мониторинга системы
 */

import { z } from "zod";

import { EventLogService } from "../lib/services/event-log-service";
import { publicProcedure } from "../trpc";

export const healthRouter = {
  /**
   * Проверка здоровья системы логирования событий
   */
  checkEventLogs: publicProcedure
    .output(
      z.object({
        status: z.enum(["healthy", "unhealthy"]),
        totalLogs: z.number().optional(),
        timestamp: z.string(),
        error: z.string().optional(),
      }),
    )
    .query(async () => {
      try {
        const service = new EventLogService();
        const stats = await service.getEventLogStats();

        return {
          status: "healthy" as const,
          totalLogs: stats.total,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          status: "unhealthy" as const,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        };
      }
    }),

  /**
   * Общая проверка здоровья API
   */
  ping: publicProcedure
    .output(
      z.object({
        status: z.literal("ok"),
        timestamp: z.string(),
        uptime: z.number(),
      }),
    )
    .query(() => {
      return {
        status: "ok" as const,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    }),
};
