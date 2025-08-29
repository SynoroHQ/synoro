import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import type { ReminderUpdate } from "@synoro/validators";
import {
  completeReminderSchema,
  reminderUpdateSchema,
  snoozeReminderSchema,
} from "@synoro/validators";

import { ReminderService } from "../../lib/services/reminder-service";
import { protectedProcedure } from "../../trpc";

// Инициализируем сервис
const reminderService = new ReminderService();

export const updateRemindersRouter: TRPCRouterRecord = {
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
          tags: input.data.tags,
        };

        const reminder = await reminderService.updateReminder(
          input.id,
          ctx.session.user.id,
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
          ctx.session.user.id,
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
          ctx.session.user.id,
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
};
