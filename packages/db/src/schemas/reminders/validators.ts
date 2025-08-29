import { z } from "zod";

import type {
  AIContext,
  RecurrencePattern,
  ReminderMetadata,
  ReminderTags,
  SmartSuggestions,
} from "./types";
import {
  MAX_COUNTS,
  REMINDER_CONSTRAINTS,
  TIME_CONSTRAINTS,
  VALIDATION_PATTERNS,
} from "./constants";

/**
 * Валидаторы для схемы напоминаний
 */

// Базовые валидаторы
export const uuidSchema = z
  .string()
  .regex(VALIDATION_PATTERNS.UUID, "Invalid UUID format");

export const titleSchema = z
  .string()
  .min(1, "Title is required")
  .max(
    REMINDER_CONSTRAINTS.TITLE_MAX_LENGTH,
    `Title must be at most ${REMINDER_CONSTRAINTS.TITLE_MAX_LENGTH} characters`,
  );

export const descriptionSchema = z
  .string()
  .max(
    REMINDER_CONSTRAINTS.DESCRIPTION_MAX_LENGTH,
    `Description must be at most ${REMINDER_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`,
  )
  .optional();

export const dateSchema = z
  .date()
  .refine((date) => date > new Date(), "Reminder time must be in the future");

// Валидаторы для JSON полей
export const recurrencePatternSchema = z.object({
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  interval: z.number().int().positive(),
  byDay: z.array(z.string()).optional(),
  byMonth: z.array(z.number().int().min(1).max(12)).optional(),
  byMonthDay: z.array(z.number().int().min(1).max(31)).optional(),
  until: z.string().optional(),
}) satisfies z.ZodType<RecurrencePattern>;

export const aiContextSchema = z.object({
  source: z.string(),
  conversationId: z.string().optional(),
  intent: z.string().optional(),
  entities: z.record(z.any()).optional(),
  confidence: z.number().min(0).max(1).optional(),
}) satisfies z.ZodType<AIContext>;

export const smartSuggestionsSchema = z.object({
  nextReminder: z.string().optional(),
  relatedTasks: z.array(z.string()).optional(),
  priorityAdjustment: z.string().optional(),
  timeOptimization: z.string().optional(),
}) satisfies z.ZodType<SmartSuggestions>;

export const tagsSchema = z
  .array(z.string().max(REMINDER_CONSTRAINTS.TAGS_MAX_LENGTH))
  .max(
    REMINDER_CONSTRAINTS.TAGS_MAX_COUNT,
    `Maximum ${REMINDER_CONSTRAINTS.TAGS_MAX_COUNT} tags allowed`,
  )
  .optional()
  .default([]) satisfies z.ZodType<ReminderTags>;

export const metadataSchema = z
  .record(z.any())
  .refine(
    (data) =>
      JSON.stringify(data).length <= REMINDER_CONSTRAINTS.METADATA_MAX_SIZE,
    `Metadata size must be at most ${REMINDER_CONSTRAINTS.METADATA_MAX_SIZE} bytes`,
  )
  .optional() satisfies z.ZodType<ReminderMetadata>;

// Основная схема валидации напоминания
export const reminderSchema = z.object({
  userId: uuidSchema,
  title: titleSchema,
  description: descriptionSchema,
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
    .default("task"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z
    .enum(["pending", "active", "completed", "cancelled", "snoozed"])
    .default("pending"),
  reminderTime: dateSchema,
  recurrence: z
    .enum(["none", "daily", "weekly", "monthly", "yearly", "custom"])
    .default("none"),
  recurrencePattern: recurrencePatternSchema.optional(),
  recurrenceEndDate: z.date().optional(),
  aiGenerated: z.boolean().default(false),
  aiContext: aiContextSchema.optional(),
  smartSuggestions: smartSuggestionsSchema.optional(),
  chatId: uuidSchema.optional(),
  parentReminderId: uuidSchema.optional(),
  tags: tagsSchema,
  metadata: metadataSchema,
});

// Схема валидации обновления напоминания
export const reminderUpdateSchema = reminderSchema
  .partial()
  .omit({ userId: true })
  .extend({
    updatedAt: z.date().optional(),
    completedAt: z.date().optional(),
    notificationSent: z.boolean().optional(),
    snoozeCount: z
      .number()
      .int()
      .min(0)
      .max(MAX_COUNTS.SNOOZE_COUNT)
      .optional(),
    snoozeUntil: z.date().optional(),
  });

// Схема валидации выполнения напоминания
export const reminderExecutionSchema = z.object({
  reminderId: uuidSchema,
  status: z.enum(["sent", "failed", "skipped"]),
  channel: z.string().optional(),
  errorMessage: z
    .string()
    .max(
      REMINDER_CONSTRAINTS.ERROR_MESSAGE_MAX_LENGTH,
      `Error message must be at most ${REMINDER_CONSTRAINTS.ERROR_MESSAGE_MAX_LENGTH} characters`,
    )
    .optional(),
  metadata: z.record(z.any()).optional(),
});

// Схема валидации шаблона напоминания
export const reminderTemplateSchema = z.object({
  userId: uuidSchema,
  name: titleSchema,
  description: descriptionSchema,
  template: z.record(z.any()),
  isPublic: z.boolean().default(false),
});

// Схема валидации поиска напоминаний
export const reminderSearchSchema = z.object({
  userId: uuidSchema,
  status: z
    .enum(["pending", "active", "completed", "cancelled", "snoozed"])
    .optional(),
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
  tags: z.array(z.string()).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  aiGenerated: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

// Схема валидации для массовых операций
export const bulkReminderOperationSchema = z.object({
  reminderIds: z
    .array(uuidSchema)
    .min(1, "At least one reminder ID is required"),
  operation: z.enum(["complete", "cancel", "snooze", "delete"]),
  snoozeUntil: z.date().optional(),
  metadata: metadataSchema,
});

// Функции валидации
export function validateReminder(data: unknown) {
  return reminderSchema.parse(data);
}

export function validateReminderUpdate(data: unknown) {
  return reminderUpdateSchema.parse(data);
}

export function validateReminderExecution(data: unknown) {
  return reminderExecutionSchema.parse(data);
}

export function validateReminderTemplate(data: unknown) {
  return reminderTemplateSchema.parse(data);
}

export function validateReminderSearch(data: unknown) {
  return reminderSearchSchema.parse(data);
}

export function validateBulkOperation(data: unknown) {
  return bulkReminderOperationSchema.parse(data);
}

// Функции для проверки бизнес-логики
export function validateReminderTime(
  reminderTime: Date,
  snoozeUntil?: Date,
): boolean {
  const now = new Date();

  if (reminderTime <= now) {
    return false;
  }

  if (snoozeUntil && snoozeUntil <= now) {
    return false;
  }

  return true;
}

export function validateRecurrencePattern(
  recurrence: string,
  pattern?: RecurrencePattern,
): boolean {
  if (recurrence === "custom" && !pattern) {
    return false;
  }

  if (pattern && pattern.interval <= 0) {
    return false;
  }

  return true;
}

export function validateTags(tags: string[]): boolean {
  if (tags.length > REMINDER_CONSTRAINTS.TAGS_MAX_COUNT) {
    return false;
  }

  return tags.every(
    (tag) => tag.length <= REMINDER_CONSTRAINTS.TAGS_MAX_LENGTH,
  );
}
