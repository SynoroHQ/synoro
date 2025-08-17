import { z } from "zod";

import { CurrencyCode, EventCategory } from "./events";

// Base schemas
const timestampSchema = z.date().or(z.string().datetime());

// Time period enums
export const TimePeriod = z.enum([
  "day",
  "week",
  "month",
  "quarter",
  "year",
  "custom",
]);

export const ComparisonPeriod = z.enum([
  "previous_period", // предыдущий период
  "previous_year", // прошлый год
  "custom", // пользовательский
]);

// Chart types
export const ChartType = z.enum([
  "line", // линейный график
  "bar", // столбчатая диаграмма
  "pie", // круговая диаграмма
  "area", // площадная диаграмма
  "scatter", // точечная диаграмма
  "heatmap", // тепловая карта
  "treemap", // древовидная карта
]);

// Metric types
export const MetricType = z.enum([
  "count", // количество событий
  "sum", // сумма
  "average", // среднее значение
  "median", // медиана
  "min", // минимум
  "max", // максимум
  "trend", // тренд
  "growth", // рост в %
]);

// Group by options
export const GroupBy = z.enum([
  "category", // по категориям
  "source", // по источникам
  "tags", // по тегам
  "object", // по объектам
  "hour", // по часам
  "day", // по дням
  "week", // по неделям
  "month", // по месяцам
  "year", // по годам
]);

// Base analytics query schema
export const analyticsQuerySchema = z.object({
  // Time range
  period: TimePeriod.default("month"),
  startDate: timestampSchema.optional(),
  endDate: timestampSchema.optional(),
  timezone: z.string().optional(),

  // Filters
  categories: z.array(EventCategory).optional(),
  tags: z.array(z.string()).optional(),
  objectIds: z.array(z.string().uuid()).optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  currency: CurrencyCode.optional(),

  // Grouping and metrics
  groupBy: z.array(GroupBy).optional(),
  metrics: z.array(MetricType).default(["count", "sum"]),

  // Comparison
  comparison: z
    .object({
      enabled: z.boolean().default(false),
      period: ComparisonPeriod.optional(),
      startDate: timestampSchema.optional(),
      endDate: timestampSchema.optional(),
    })
    .optional(),
});

// Dashboard configuration schema
export const dashboardConfigSchema = z.object({
  name: z.string().min(1, "Dashboard name is required").max(100),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  layout: z.array(
    z.object({
      id: z.string().uuid(),
      type: z.enum(["chart", "metric", "table", "text"]),
      position: z.object({
        x: z.number().int().min(0),
        y: z.number().int().min(0),
        width: z.number().int().min(1).max(12),
        height: z.number().int().min(1).max(12),
      }),
      config: z.record(z.string(), z.any()),
    }),
  ),
  filters: analyticsQuerySchema.partial().optional(),
  refreshInterval: z.number().int().min(0).max(3600).optional(), // seconds
});

// Chart configuration schema
export const chartConfigSchema = z.object({
  title: z.string().max(200),
  description: z.string().max(500).optional(),
  chartType: ChartType,
  query: analyticsQuerySchema,

  // Chart styling
  colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).optional(),
  showLegend: z.boolean().default(true),
  showGrid: z.boolean().default(true),
  showTooltip: z.boolean().default(true),

  // Axes configuration
  xAxis: z
    .object({
      label: z.string().optional(),
      type: z.enum(["category", "time", "number"]).default("category"),
      format: z.string().optional(),
    })
    .optional(),
  yAxis: z
    .object({
      label: z.string().optional(),
      type: z.enum(["linear", "logarithmic"]).default("linear"),
      format: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
});

// Report generation schema
export const reportConfigSchema = z.object({
  name: z.string().min(1, "Report name is required").max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(["summary", "detailed", "custom"]),

  // Time settings
  period: TimePeriod,
  startDate: timestampSchema.optional(),
  endDate: timestampSchema.optional(),

  // Content sections
  sections: z
    .array(
      z.object({
        type: z.enum([
          "overview", // общий обзор
          "spending_by_category", // траты по категориям
          "trends", // тренды
          "top_events", // топ событий
          "predictions", // предсказания
          "recommendations", // рекомендации
          "custom_chart", // пользовательский график
        ]),
        title: z.string().optional(),
        config: z.record(z.string(), z.any()).optional(),
      }),
    )
    .min(1, "At least one section is required"),

  // Formatting
  format: z.enum(["pdf", "html", "json"]).default("pdf"),
  template: z.enum(["default", "minimal", "detailed"]).default("default"),
  includeCharts: z.boolean().default(true),
  includeRawData: z.boolean().default(false),

  // Delivery
  delivery: z
    .object({
      method: z.enum(["download", "email", "telegram"]),
      recipients: z.array(z.string().email()).optional(),
      schedule: z
        .object({
          enabled: z.boolean().default(false),
          frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
          dayOfWeek: z.number().int().min(0).max(6).optional(), // 0 = Sunday
          dayOfMonth: z.number().int().min(1).max(31).optional(),
          time: z
            .string()
            .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .optional(), // HH:MM
        })
        .optional(),
    })
    .optional(),
});

// Prediction schema
export const predictionConfigSchema = z.object({
  type: z.enum([
    "spending_forecast", // прогноз трат
    "event_frequency", // частота событий
    "maintenance_schedule", // график обслуживания
    "budget_alert", // предупреждения о бюджете
    "seasonal_patterns", // сезонные паттерны
  ]),

  // Target configuration
  target: z
    .object({
      category: EventCategory.optional(),
      objectId: z.string().uuid().optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),

  // Prediction parameters
  horizon: z.number().int().min(1).max(365).default(30), // days
  confidence: z.number().min(0.5).max(0.99).default(0.95),
  includeSeasonality: z.boolean().default(true),
  includeTrends: z.boolean().default(true),

  // Alert settings
  alerts: z
    .object({
      enabled: z.boolean().default(false),
      threshold: z.number().positive().optional(),
      thresholdType: z.enum(["amount", "count", "percentage"]).optional(),
      notification: z.enum(["email", "telegram", "push"]).optional(),
    })
    .optional(),
});

// Insight generation schema
export const insightConfigSchema = z.object({
  types: z
    .array(
      z.enum([
        "spending_patterns", // паттерны трат
        "unusual_activity", // необычная активность
        "cost_optimization", // оптимизация расходов
        "recurring_events", // повторяющиеся события
        "budget_performance", // выполнение бюджета
        "category_trends", // тренды по категориям
        "efficiency_tips", // советы по эффективности
      ]),
    )
    .min(1, "At least one insight type is required"),

  period: TimePeriod.default("month"),
  minConfidence: z.number().min(0).max(1).default(0.7),
  maxInsights: z.number().int().min(1).max(50).default(10),

  // Filters
  categories: z.array(EventCategory).optional(),
  minAmount: z.number().positive().optional(),

  // Output preferences
  includeActions: z.boolean().default(true),
  includeVisualization: z.boolean().default(false),
  language: z.enum(["en", "ru"]).default("en"),
});

// Budget tracking schema
export const budgetConfigSchema = z.object({
  name: z.string().min(1, "Budget name is required").max(100),
  description: z.string().max(500).optional(),

  // Budget parameters
  amount: z.number().positive("Budget amount must be positive"),
  currency: CurrencyCode.default("RUB"),
  period: z.enum(["week", "month", "quarter", "year"]),

  // Scope
  categories: z.array(EventCategory).optional(),
  tags: z.array(z.string()).optional(),
  objectIds: z.array(z.string().uuid()).optional(),

  // Alerts
  alerts: z
    .object({
      enabled: z.boolean().default(true),
      thresholds: z.object({
        warning: z.number().min(0).max(1).default(0.8), // 80%
        critical: z.number().min(0).max(1).default(0.95), // 95%
      }),
      notifications: z
        .array(z.enum(["email", "telegram", "push"]))
        .default(["telegram"]),
    })
    .optional(),

  // Settings
  autoReset: z.boolean().default(true),
  rollover: z.boolean().default(false), // перенос остатка
  isActive: z.boolean().default(true),
});

// Analytics export schema
export const analyticsExportSchema = z.object({
  type: z.enum(["chart", "report", "raw_data", "dashboard"]),
  format: z.enum(["pdf", "png", "svg", "csv", "json", "excel"]),

  // Content selection
  chartIds: z.array(z.string().uuid()).optional(),
  reportId: z.string().uuid().optional(),
  dashboardId: z.string().uuid().optional(),
  query: analyticsQuerySchema.optional(),

  // Export options
  includeMetadata: z.boolean().default(true),
  includeFilters: z.boolean().default(true),
  resolution: z.enum(["low", "medium", "high"]).default("medium"),

  // Delivery
  delivery: z.object({
    method: z.enum(["download", "email"]),
    email: z.string().email().optional(),
  }),
});

// Type exports
export type TimePeriodType = z.infer<typeof TimePeriod>;
export type ComparisonPeriodType = z.infer<typeof ComparisonPeriod>;
export type ChartTypeType = z.infer<typeof ChartType>;
export type MetricTypeType = z.infer<typeof MetricType>;
export type GroupByType = z.infer<typeof GroupBy>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type DashboardConfigInput = z.infer<typeof dashboardConfigSchema>;
export type ChartConfigInput = z.infer<typeof chartConfigSchema>;
export type ReportConfigInput = z.infer<typeof reportConfigSchema>;
export type PredictionConfigInput = z.infer<typeof predictionConfigSchema>;
export type InsightConfigInput = z.infer<typeof insightConfigSchema>;
export type BudgetConfigInput = z.infer<typeof budgetConfigSchema>;
export type AnalyticsExportInput = z.infer<typeof analyticsExportSchema>;
