import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { reminderIdSchema } from "@synoro/validators";

import { ReminderService } from "../../lib/services/reminder-service";
import { protectedProcedure } from "../../trpc";

// Инициализируем сервис
const reminderService = new ReminderService();

export const deleteRemindersRouter: TRPCRouterRecord = {
  /**
   * Удалить напоминание
   */
  reminder: protectedProcedure
    .input(reminderIdSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const success = await reminderService.deleteReminder(
          input.id,
          ctx.session.user.id,
        );
        if (!success) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Напоминание не найдено",
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Ошибка удаления напоминания: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        });
      }
    }),
};
