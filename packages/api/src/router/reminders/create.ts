import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import type { Reminder } from "@synoro/validators";
import { createFromTextSchema, reminderSchema } from "@synoro/validators";

import { SmartReminderAgent } from "../../lib/agents/smart-reminder-agent";
import { ReminderService } from "../../lib/services/reminder-service";
import { protectedProcedure } from "../../trpc";

// Инициализируем сервисы
const reminderService = new ReminderService();
const smartReminderAgent = new SmartReminderAgent();

export const createRemindersRouter: TRPCRouterRecord = {
  /**
   * Создать напоминание вручную
   */
  manual: protectedProcedure
    .input(reminderSchema.omit({ userId: true }))
    .mutation(async ({ ctx, input }) => {
      try {
        const reminderData: Reminder = {
          ...input,
          userId: ctx.session.user.id,
          tags: input.tags,
          aiGenerated: false,
        };

        const reminder = await reminderService.createReminder(reminderData);
        return reminder;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Ошибка создания напоминания: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        });
      }
    }),

  /**
   * Создать напоминание из текста с помощью ИИ
   */
  fromText: protectedProcedure
    .input(createFromTextSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await smartReminderAgent.createReminderFromText({
          text: input.text,
          userId: ctx.session.user.id,
          chatId: input.chatId,
          timezone: input.timezone,
          context: input.context,
        });

        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Ошибка создания напоминания из текста: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        });
      }
    }),
};
