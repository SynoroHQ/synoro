import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ReminderService } from "../../lib/services/reminder-service";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

// Инициализируем сервис
const reminderService = new ReminderService();

export const deleteRemindersRouter = createTRPCRouter({
  /**
   * Удалить напоминание
   */
  reminder: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid("Некорректный ID напоминания"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const success = await reminderService.deleteReminder(
          input.id,
          ctx.user.id,
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
});
