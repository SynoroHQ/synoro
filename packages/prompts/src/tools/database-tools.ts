import { z } from "zod";

/**
 * Tools для мультиагентов для работы с базой данных
 * Предоставляют информацию о делах, событиях и пользователях
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
    .enum(["expense", "task", "maintenance", "other"])
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
    .enum(["expense", "task", "maintenance", "other"])
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
    .enum(["expense", "task", "maintenance", "other"])
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

// Определения tools
export const databaseTools = [
  {
    name: "get_user_events",
    description:
      "Получить события пользователя с возможностью фильтрации по типу, статусу, приоритету и датам",
    parameters: getUserEventsSchema,
  },
  {
    name: "get_event_by_id",
    description: "Получить детальную информацию о конкретном событии по его ID",
    parameters: getEventByIdSchema,
  },
  {
    name: "get_user_stats",
    description:
      "Получить статистику событий пользователя: общее количество, по типам, по статусам, суммарные расходы",
    parameters: getUserStatsSchema,
  },
  {
    name: "search_events",
    description: "Поиск событий по тексту в заголовке и заметках",
    parameters: searchEventsSchema,
  },
  {
    name: "get_recent_events",
    description:
      "Получить недавние события пользователя за указанное количество дней",
    parameters: getRecentEventsSchema,
  },
  {
    name: "get_upcoming_tasks",
    description:
      "Получить предстоящие задачи пользователя на указанное количество дней вперед",
    parameters: getUpcomingTasksSchema,
  },
  {
    name: "get_expense_summary",
    description:
      "Получить сводку по расходам пользователя с группировкой по типам и периодам",
    parameters: getExpenseSummarySchema,
  },
] as const;

// Типы для TypeScript
export type GetUserEventsInput = z.infer<typeof getUserEventsSchema>;
export type GetEventByIdInput = z.infer<typeof getEventByIdSchema>;
export type GetUserStatsInput = z.infer<typeof getUserStatsSchema>;
export type SearchEventsInput = z.infer<typeof searchEventsSchema>;
export type GetRecentEventsInput = z.infer<typeof getRecentEventsSchema>;
export type GetUpcomingTasksInput = z.infer<typeof getUpcomingTasksSchema>;
export type GetExpenseSummaryInput = z.infer<typeof getExpenseSummarySchema>;

// Интерфейсы для результатов
export interface EventWithDetails {
  id: string;
  householdId: string;
  userId: string | null;
  source: "telegram" | "web" | "mobile" | "api";
  type: "expense" | "task" | "maintenance" | "other";
  status: "active" | "archived" | "deleted";
  priority: "low" | "medium" | "high" | "urgent";
  occurredAt: string;
  ingestedAt: string;
  updatedAt: string;
  title: string | null;
  notes: string | null;
  amount: string | null;
  currency: string;
  data: Record<string, unknown> | null;
  properties: Array<{
    key: string;
    value: unknown;
  }>;
  tags: Array<{
    id: string;
    name: string;
    description: string | null;
    color: string | null;
  }>;
}

export interface UserStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  totalAmount: number;
  averageAmount: number;
  currency: string;
}

export interface ExpenseSummary {
  totalAmount: number;
  currency: string;
  byType: Record<string, { count: number; amount: number }>;
  byPeriod: Record<string, { count: number; amount: number }>;
  topCategories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
}

export interface SearchResult {
  events: EventWithDetails[];
  total: number;
  query: string;
}

// Константы для типов событий
export const EVENT_TYPES = {
  EXPENSE: "expense",
  TASK: "task",
  MAINTENANCE: "maintenance",
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

// Утилиты для работы с датами
export const dateUtils = {
  /**
   * Преобразует строку даты в объект Date
   */
  parseDate: (dateString: string): Date => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateString}`);
    }
    return date;
  },

  /**
   * Получает дату N дней назад
   */
  getDaysAgo: (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  },

  /**
   * Получает дату N дней вперед
   */
  getDaysAhead: (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  },

  /**
   * Форматирует дату в ISO строку (YYYY-MM-DD)
   */
  formatISODate: (date: Date): string => {
    return date.toISOString().split("T")[0] ?? "";
  },
};

// Утилиты для форматирования результатов
export const formatUtils = {
  /**
   * Форматирует сумму валюты
   */
  formatCurrency: (amount: number, currency: string = "RUB"): string => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currency,
    }).format(amount);
  },

  /**
   * Форматирует дату для отображения
   */
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  },

  /**
   * Форматирует относительное время
   */
  formatRelativeTime: (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "только что";
    if (diffInHours < 24) return `${diffInHours} ч. назад`;
    if (diffInHours < 48) return "вчера";
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} дн. назад`;

    return formatUtils.formatDate(dateString);
  },
};
