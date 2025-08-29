import { TRPCError } from "@trpc/server";

import type { ReminderFilters, ReminderSortOptions } from "@synoro/db";
import {
  reminderFiltersSchema,
  reminderSortOptionsSchema,
  reminderSearchSchema,
  getReminderSchema,
  findSimilarSchema,
} from "@synoro/db";

import { ReminderService } from "../../lib/services/reminder-service";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

// Инициализируем сервис
const reminderService = new ReminderService();

export const readRemindersRouter = createTRPCRouter({
  /**
   * Получить список напоминаний пользователя
   */
  list: protectedProcedure
    .input(reminderSearchSchema)
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
    .input(getReminderSchema)
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
    .input(findSimilarSchema)
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
