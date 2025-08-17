import { z } from "zod";

// Event categories enum
export const EventCategory = z.enum([
  "purchase", // покупки
  "maintenance", // обслуживание/ремонт
  "health", // здоровье
  "work", // работа
  "personal", // личное
  "transport", // транспорт
  "home", // дом/квартира
  "finance", // финансы
  "education", // образование
  "entertainment", // развлечения
  "travel", // путешествия
  "food", // еда
  "other", // прочее
]);

// Event sources
export const EventSource = z.enum([
  "manual", // ручной ввод
  "telegram", // Telegram бот
  "web", // веб-интерфейс
  "mobile", // мобильное приложение
  "import", // импорт (CSV, API)
  "ocr", // распознавание чеков
  "api", // внешние API
]);

// Currency codes (ISO 4217)
export const CurrencyCode = z.enum([
  "RUB",
  "USD",
  "EUR",
  "GBP",
  "CNY",
  "JPY",
  "KZT",
  "BYN",
  "UAH",
]);

// Base schemas for reusable components
const uuidSchema = z.string().uuid("Invalid UUID format");
const timestampSchema = z.date().or(z.string().datetime());
const tagSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-zA-Zа-яА-Я0-9_-]+$/, "Invalid tag format");
const amountSchema = z
  .number()
  .positive("Amount must be positive")
  .max(999999999, "Amount is too large");

// Location schema for GPS coordinates
const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

// Event creation schema
export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title is too long")
    .trim(),
  description: z.string().max(2000, "Description is too long").optional(),
  category: EventCategory,
  tags: z.array(tagSchema).max(20, "Too many tags").optional().default([]),
  timestamp: timestampSchema.optional().default(new Date()),
  amount: amountSchema.optional(),
  currency: CurrencyCode.optional().default("RUB"),
  location: locationSchema.optional(),
  source: EventSource.default("manual"),
  objectId: z.string().optional(), // связь с объектом (машина, квартира)
  receiptData: z
    .object({
      receiptId: z.string().optional(),
      storeName: z.string().optional(),
      items: z
        .array(
          z.object({
            name: z.string(),
            quantity: z.number().positive(),
            price: z.number().positive(),
            total: z.number().positive(),
          }),
        )
        .optional(),
    })
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(), // дополнительные данные
});

// Event update schema (все поля опциональные)
export const updateEventSchema = createEventSchema.partial().extend({
  id: uuidSchema,
});

// Event query/filter schema
export const eventQuerySchema = z.object({
  // Pagination
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),

  // Filters
  category: EventCategory.optional(),
  source: EventSource.optional(),
  tags: z.array(tagSchema).optional(),
  objectId: z.string().optional(),

  // Date range
  startDate: timestampSchema.optional(),
  endDate: timestampSchema.optional(),

  // Amount range
  minAmount: amountSchema.optional(),
  maxAmount: amountSchema.optional(),
  currency: CurrencyCode.optional(),

  // Search
  search: z.string().max(200).optional(),

  // Sorting
  sortBy: z
    .enum(["timestamp", "amount", "title", "category"])
    .default("timestamp"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Bulk operations
export const bulkDeleteEventsSchema = z.object({
  eventIds: z
    .array(uuidSchema)
    .min(1, "At least one event ID is required")
    .max(100, "Too many events"),
});

export const bulkUpdateEventsSchema = z.object({
  eventIds: z
    .array(uuidSchema)
    .min(1, "At least one event ID is required")
    .max(100, "Too many events"),
  updates: z
    .object({
      category: EventCategory.optional(),
      tags: z.array(tagSchema).optional(),
      objectId: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be updated",
    }),
});

// Event import schemas
export const importEventsSchema = z
  .object({
    format: z.enum(["csv", "json", "excel"]),
    file: z.instanceof(File).optional(), // for web uploads
    data: z.array(createEventSchema).optional(), // for direct data
    options: z
      .object({
        skipDuplicates: z.boolean().default(true),
        updateExisting: z.boolean().default(false),
        batchSize: z.number().int().min(1).max(1000).default(100),
      })
      .optional(),
  })
  .refine((data) => data.file || data.data, {
    message: "Either file or data must be provided",
  });

// Event export schema
export const exportEventsSchema = z.object({
  format: z.enum(["csv", "json", "excel", "pdf"]),
  filters: eventQuerySchema.omit({ page: true, limit: true }).optional(),
  includeMetadata: z.boolean().default(false),
  dateRange: z
    .object({
      startDate: timestampSchema,
      endDate: timestampSchema,
    })
    .optional(),
});

// OCR/Receipt processing schemas
export const processReceiptSchema = z.object({
  image: z.instanceof(File).or(z.string().url()), // file upload or URL
  ocrProvider: z
    .enum(["tesseract", "google", "aws", "azure"])
    .default("tesseract"),
  autoCreateEvent: z.boolean().default(true),
  defaultCategory: EventCategory.default("purchase"),
});

// Event analytics schema
export const eventAnalyticsSchema = z.object({
  period: z.enum(["day", "week", "month", "quarter", "year"]).default("month"),
  startDate: timestampSchema.optional(),
  endDate: timestampSchema.optional(),
  groupBy: z.enum(["category", "source", "tags", "objectId"]).optional(),
  metrics: z
    .array(z.enum(["count", "sum", "average", "trend"]))
    .default(["count", "sum"]),
  categories: z.array(EventCategory).optional(),
  currency: CurrencyCode.optional(),
});

// Type exports
export type EventCategoryType = z.infer<typeof EventCategory>;
export type EventSourceType = z.infer<typeof EventSource>;
export type CurrencyCodeType = z.infer<typeof CurrencyCode>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventQueryInput = z.infer<typeof eventQuerySchema>;
export type BulkDeleteEventsInput = z.infer<typeof bulkDeleteEventsSchema>;
export type BulkUpdateEventsInput = z.infer<typeof bulkUpdateEventsSchema>;
export type ImportEventsInput = z.infer<typeof importEventsSchema>;
export type ExportEventsInput = z.infer<typeof exportEventsSchema>;
export type ProcessReceiptInput = z.infer<typeof processReceiptSchema>;
export type EventAnalyticsInput = z.infer<typeof eventAnalyticsSchema>;
export type LocationData = z.infer<typeof locationSchema>;
