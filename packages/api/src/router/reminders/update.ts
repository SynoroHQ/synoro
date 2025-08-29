import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { ReminderUpdate } from "@synoro/db";

import { ReminderService } from "../../lib/services/reminder-service";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

// Инициализируем сервис
const reminderService = new ReminderService();

// Схема валидации обновления
const updateReminderSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  type: z
    .enum([
      "task",
      "event",
      "deadline",
      "meeting",
      "call",
      "follow_up",
      "custom",
    ])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  reminderTime: z.date().optional(),
  status: z
    .enum(["pending", "active", "completed", "cancelled", "snoozed"])
    .optional(),
  recurrence: z
    .enum(["none", "daily", "weekly", "monthly", "yearly", "custom"])
    .optional(),
  recurrencePattern: z.string().optional(),
  recurrenceEndDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateRemindersRouter = createTRPCRouter({
  /**
   * Обновить напоминание
   */
  reminder: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid("Некорректный ID напоминания"),
        data: updateReminderSchema,
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
    .input(
      z.object({
        id: z.string().uuid("Некорректный ID напоминания"),
      }),
    )
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
    .input(
      z.object({
        id: z.string().uuid("Некорректный ID напоминания"),
        snoozeUntil: z.date(),
      }),
    )
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
