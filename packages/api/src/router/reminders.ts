import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type {
  NewReminder,
  ReminderFilters,
  ReminderSortOptions,
  ReminderUpdate,
} from "@synoro/db";

import { SmartReminderAgent } from "../lib/agents/smart-reminder-agent";
import { ReminderService } from "../lib/services/reminder-service";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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

export const remindersRouter = createTRPCRouter({
  /**
   * Создать напоминание вручную
   */
  create: protectedProcedure
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
  createFromText: protectedProcedure
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
   * Обновить напоминание
   */
  update: protectedProcedure
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
   * Удалить напоминание
   */
  delete: protectedProcedure
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
