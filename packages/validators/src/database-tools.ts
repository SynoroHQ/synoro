import { z } from "zod";

/**
 * Схемы валидации для database tools
 * Используются для валидации входных параметров мультиагентов при работе с базой данных
 */

// Схемы для валидации входных параметров
export const getUserEventsSchema = z.object({
  userId: z.string().describe("ID пользователя"),
  householdId: z.string().describe("ID домохозяйства"),
  limit: z
    .number()
    .optional()
    .default(10)
    .describe("Максимальное количество событий"),
  offset: z.number().optional().default(0).describe("Смещение для пагинации"),
  type: z
    .enum([
      "purchase",
      "maintenance",
      "health",
      "work",
      "personal",
      "transport",
      "home",
      "finance",
      "education",
      "entertainment",
      "travel",
      "food",
      "other",
    ])
    .optional()
    .describe("Тип события"),
  status: z
    .enum(["active", "archived", "deleted"])
    .optional()
    .describe("Статус события"),
  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .optional()
    .describe("Приоритет события"),
  startDate: z
    .string()
    .optional()
    .describe("Начальная дата в формате ISO (YYYY-MM-DD)"),
  endDate: z
    .string()
    .optional()
    .describe("Конечная дата в формате ISO (YYYY-MM-DD)"),
  search: z
    .string()
    .optional()
    .describe("Поисковый запрос по заголовку и заметкам"),
});

export const getEventByIdSchema = z.object({
  eventId: z.string().describe("ID события"),
  householdId: z.string().describe("ID домохозяйства"),
});

export const getUserStatsSchema = z.object({
  userId: z.string().describe("ID пользователя"),
  householdId: z.string().describe("ID домохозяйства"),
  startDate: z
    .string()
    .optional()
    .describe("Начальная дата в формате ISO (YYYY-MM-DD)"),
  endDate: z
    .string()
    .optional()
    .describe("Конечная дата в формате ISO (YYYY-MM-DD)"),
  type: z
    .enum([
      "purchase",
      "maintenance",
      "health",
      "work",
      "personal",
      "transport",
      "home",
      "finance",
      "education",
      "entertainment",
      "travel",
      "food",
      "other",
    ])
    .optional()
    .describe("Тип события для фильтрации"),
});

export const searchEventsSchema = z.object({
  householdId: z.string().describe("ID домохозяйства"),
  userId: z.string().optional().describe("ID пользователя (опционально)"),
  query: z.string().describe("Поисковый запрос"),
  limit: z
    .number()
    .optional()
    .default(10)
    .describe("Максимальное количество результатов"),
  type: z
    .enum([
      "purchase",
      "maintenance",
      "health",
      "work",
      "personal",
      "transport",
      "home",
      "finance",
      "education",
      "entertainment",
      "travel",
      "food",
      "other",
    ])
    .optional()
    .describe("Тип события"),
});

export const getRecentEventsSchema = z.object({
  householdId: z.string().describe("ID домохозяйства"),
  userId: z.string().optional().describe("ID пользователя (опционально)"),
  days: z.number().optional().default(7).describe("Количество дней назад"),
  limit: z
    .number()
    .optional()
    .default(10)
    .describe("Максимальное количество событий"),
});

export const getUpcomingTasksSchema = z.object({
  householdId: z.string().describe("ID домохозяйства"),
  userId: z.string().optional().describe("ID пользователя (опционально)"),
  days: z.number().optional().default(7).describe("Количество дней вперед"),
  limit: z
    .number()
    .optional()
    .default(10)
    .describe("Максимальное количество задач"),
});

export const getExpenseSummarySchema = z.object({
  householdId: z.string().describe("ID домохозяйства"),
  userId: z.string().optional().describe("ID пользователя (опционально)"),
  startDate: z
    .string()
    .optional()
    .describe("Начальная дата в формате ISO (YYYY-MM-DD)"),
  endDate: z
    .string()
    .optional()
    .describe("Конечная дата в формате ISO (YYYY-MM-DD)"),
  currency: z
    .string()
    .optional()
    .default("RUB")
    .describe("Валюта для группировки"),
});

// Типы для TypeScript
export type GetUserEventsInput = z.infer<typeof getUserEventsSchema>;
export type GetEventByIdInput = z.infer<typeof getEventByIdSchema>;
export type GetUserStatsInput = z.infer<typeof getUserStatsSchema>;
export type SearchEventsInput = z.infer<typeof searchEventsSchema>;
export type GetRecentEventsInput = z.infer<typeof getRecentEventsSchema>;
export type GetUpcomingTasksInput = z.infer<typeof getUpcomingTasksSchema>;
export type GetExpenseSummaryInput = z.infer<typeof getExpenseSummarySchema>;

// Константы для типов событий
export const EVENT_TYPES = {
  PURCHASE: "purchase",
  MAINTENANCE: "maintenance",
  HEALTH: "health",
  WORK: "work",
  PERSONAL: "personal",
  TRANSPORT: "transport",
  HOME: "home",
  FINANCE: "finance",
  EDUCATION: "education",
  ENTERTAINMENT: "entertainment",
  TRAVEL: "travel",
  FOOD: "food",
  OTHER: "other",
} as const;

export const EVENT_STATUSES = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  DELETED: "deleted",
} as const;

export const EVENT_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;
