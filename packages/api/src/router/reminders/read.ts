import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { ReminderFilters, ReminderSortOptions } from "@synoro/db";

import { ReminderService } from "../../lib/services/reminder-service";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

// Инициализируем сервис
const reminderService = new ReminderService();

// Схемы валидации
const filtersSchema = z.object({
  status: z
    .array(z.enum(["pending", "active", "completed", "cancelled", "snoozed"]))
    .optional(),
  type: z
    .array(
      z.enum([
        "task",
        "event",
        "deadline",
        "meeting",
        "call",
        "follow_up",
        "custom",
      ]),
    )
    .optional(),
  priority: z.array(z.enum(["low", "medium", "high", "urgent"])).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  tags: z.array(z.string()).optional(),
  aiGenerated: z.boolean().optional(),
  search: z.string().optional(),
});

const sortSchema = z.object({
  field: z
    .enum(["reminderTime", "createdAt", "priority", "title"])
    .default("reminderTime"),
  direction: z.enum(["asc", "desc"]).default("asc"),
});

export const readRemindersRouter = createTRPCRouter({
  /**
   * Получить список напоминаний пользователя
   */
  list: protectedProcedure
    .input(
      z.object({
        filters: filtersSchema.optional(),
        sort: sortSchema.optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const {
          filters = {},
          sort = { field: "reminderTime", direction: "asc" },
          limit,
          offset,
        } = input;

        const reminders = await reminderService.getUserReminders(
          ctx.user.id,
          filters as ReminderFilters,
          sort as ReminderSortOptions,
          limit,
          offset,
        );

        return reminders;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Ошибка получения напоминаний: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        });
      }
    }),

  /**
   * Получить напоминание по ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid("Некорректный ID напоминания"),
        includeExecutions: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        if (input.includeExecutions) {
          const reminder = await reminderService.getReminderWithExecutions(
            input.id,
            ctx.user.id,
          );
          if (!reminder) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Напоминание не найдено",
            });
          }
          return reminder;
        } else {
          const reminder = await reminderService.getReminderById(
            input.id,
            ctx.user.id,
          );
          if (!reminder) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Напоминание не найдено",
            });
          }
          return reminder;
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Ошибка получения напоминания: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        });
      }
    }),

  /**
   * Получить статистику напоминаний пользователя
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const stats = await reminderService.getUserReminderStats(ctx.user.id);
      return stats;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Ошибка получения статистики: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
      });
    }
  }),

  /**
   * Найти похожие напоминания
   */
  findSimilar: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        limit: z.number().min(1).max(20).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const similar = await reminderService.findSimilarReminders(
          ctx.user.id,
          input.title,
          input.description,
          input.limit,
        );

        return similar;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Ошибка поиска похожих напоминаний: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        });
      }
    }),
});
