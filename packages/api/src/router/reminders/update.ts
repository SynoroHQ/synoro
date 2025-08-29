import { TRPCError } from "@trpc/server";

import type { ReminderUpdate } from "@synoro/db";
import {
  reminderUpdateSchema,
  completeReminderSchema,
  snoozeReminderSchema,
} from "@synoro/db";

import { ReminderService } from "../../lib/services/reminder-service";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

// Инициализируем сервис
const reminderService = new ReminderService();

export const updateRemindersRouter = createTRPCRouter({
  /**
   * Обновить напоминание
   */
  reminder: protectedProcedure
    .input(
      completeReminderSchema.extend({
        data: reminderUpdateSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updateData: ReminderUpdate = {
          ...input.data,
          tags: input.data.tags ? JSON.stringify(input.data.tags) : undefined,
        };

        const reminder = await reminderService.updateReminder(
          input.id,
          ctx.user.id,
          updateData,
        );
        if (!reminder) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Напоминание не найдено",
          });
        }

        return reminder;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Ошибка обновления напоминания: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        });
      }
    }),

  /**
   * Отметить напоминание как выполненное
   */
  complete: protectedProcedure
    .input(completeReminderSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const reminder = await reminderService.completeReminder(
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
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Ошибка завершения напоминания: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        });
      }
    }),

  /**
   * Отложить напоминание
   */
  snooze: protectedProcedure
    .input(snoozeReminderSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const reminder = await reminderService.snoozeReminder(
          input.id,
          ctx.user.id,
          input.snoozeUntil,
        );
        if (!reminder) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Напоминание не найдено",
          });
        }

        return reminder;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Ошибка отсрочки напоминания: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        });
      }
    }),
});
