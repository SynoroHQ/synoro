import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { NewReminder } from "@synoro/db";

import { SmartReminderAgent } from "../../lib/agents/smart-reminder-agent";
import { ReminderService } from "../../lib/services/reminder-service";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

// Инициализируем сервисы
const reminderService = new ReminderService();
const smartReminderAgent = new SmartReminderAgent();

// Схемы валидации
const createReminderSchema = z.object({
  title: z
    .string()
    .min(1, "Название обязательно")
    .max(200, "Название слишком длинное"),
  description: z.string().optional(),
  type: z.enum([
    "task",
    "event",
    "deadline",
    "meeting",
    "call",
    "follow_up",
    "custom",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  reminderTime: z.date(),
  recurrence: z
    .enum(["none", "daily", "weekly", "monthly", "yearly", "custom"])
    .default("none"),
  recurrencePattern: z.string().optional(),
  recurrenceEndDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
  chatId: z.string().optional(),
});

export const createRemindersRouter = createTRPCRouter({
  /**
   * Создать напоминание вручную
   */
  manual: protectedProcedure
    .input(createReminderSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const reminderData: NewReminder = {
          ...input,
          userId: ctx.user.id,
          tags: input.tags ? JSON.stringify(input.tags) : null,
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
    .input(
      z.object({
        text: z.string().min(1, "Текст не может быть пустым"),
        chatId: z.string().optional(),
        timezone: z.string().default("Europe/Moscow"),
        context: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await smartReminderAgent.createReminderFromText({
          text: input.text,
          userId: ctx.user.id,
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
});
