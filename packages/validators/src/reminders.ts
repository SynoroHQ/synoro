import { z } from "zod";

// Базовые схемы
export const cuid2Schema = z
  .string()
  .min(1, "ID обязательно")
  .max(25, "ID слишком длинный");
export const titleSchema = z
  .string()
  .min(1, "Название обязательно")
  .max(200, "Название слишком длинное");
export const descriptionSchema = z.string().optional();
export const dateSchema = z.date();

// Enum схемы
export const reminderTypeSchema = z.enum([
  "task",
  "event",
  "deadline",
  "meeting",
  "call",
  "follow_up",
  "custom",
]);

export const reminderPrioritySchema = z.enum([
  "low",
  "medium",
  "high",
  "urgent",
]);

export const reminderStatusSchema = z.enum([
  "pending",
  "active",
  "completed",
  "cancelled",
  "snoozed",
]);

export const reminderRecurrenceSchema = z.enum([
  "none",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "custom",
]);

export const executionStatusSchema = z.enum(["sent", "failed", "skipped"]);

export const notificationChannelSchema = z.enum([
  "email",
  "sms",
  "push",
  "telegram",
  "webhook",
]);

// Схемы для JSON полей (используем существующие типы из схемы)
export const recurrencePatternSchema = z.object({
  frequency: z.string(),
  interval: z.number(),
  byDay: z.array(z.string()).optional(),
  byMonth: z.array(z.number()).optional(),
  byMonthDay: z.array(z.number()).optional(),
  until: z.string().optional(),
});

export const aiContextSchema = z.object({
  source: z.string(),
  conversationId: z.string().optional(),
  intent: z.string().optional(),
  entities: z.record(z.string(), z.any()).optional(),
  confidence: z.number().optional(),
});

export const smartSuggestionsSchema = z.object({
  nextReminder: z.string().optional(),
  relatedTasks: z.array(z.string()).optional(),
  priorityAdjustment: z.string().optional(),
  timeOptimization: z.string().optional(),
});

export const tagsSchema = z.array(z.string());
export const metadataSchema = z.record(z.string(), z.any());

// Основные схемы для напоминаний
export const reminderSchema = z.object({
  userId: cuid2Schema,
  title: titleSchema,
  description: descriptionSchema,
  type: reminderTypeSchema.optional(),
  priority: reminderPrioritySchema.optional(),
  status: reminderStatusSchema.optional(),
  reminderTime: dateSchema,
  recurrence: reminderRecurrenceSchema.optional(),
  recurrencePattern: recurrencePatternSchema.optional(),
  recurrenceEndDate: dateSchema.optional(),
  aiGenerated: z.boolean().optional(),
  aiContext: aiContextSchema.optional(),
  smartSuggestions: smartSuggestionsSchema.optional(),
  chatId: z.string().optional(),
  parentReminderId: cuid2Schema.optional(),
  tags: tagsSchema.optional(),
  metadata: metadataSchema.optional(),
});

export const reminderUpdateSchema = z.object({
  title: titleSchema.optional(),
  description: descriptionSchema.optional(),
  type: reminderTypeSchema.optional(),
  priority: reminderPrioritySchema.optional(),
  status: reminderStatusSchema.optional(),
  reminderTime: dateSchema.optional(),
  recurrence: reminderRecurrenceSchema.optional(),
  recurrencePattern: recurrencePatternSchema.optional(),
  recurrenceEndDate: dateSchema.optional(),
  tags: tagsSchema.optional(),
  metadata: metadataSchema.optional(),
  updatedAt: dateSchema.optional(),
  completedAt: dateSchema.optional(),
  notificationSent: z.boolean().optional(),
  snoozeCount: z.number().optional(),
  snoozeUntil: dateSchema.optional(),
});

// Схемы для выполнения напоминаний
export const reminderExecutionSchema = z.object({
  reminderId: cuid2Schema,
  status: executionStatusSchema,
  channel: notificationChannelSchema.optional(),
  errorMessage: z.string().optional(),
  metadata: metadataSchema.optional(),
});

export const reminderExecutionUpdateSchema = z.object({
  status: executionStatusSchema.optional(),
  channel: notificationChannelSchema.optional(),
  errorMessage: z.string().optional(),
  metadata: metadataSchema.optional(),
});

// Схемы для шаблонов
export const reminderTemplateSchema = z.object({
  userId: cuid2Schema,
  name: z.string().min(1),
  description: descriptionSchema,
  template: z.record(z.string(), z.any()),
  isPublic: z.boolean().optional(),
});

export const reminderTemplateUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: descriptionSchema,
  template: z.record(z.string(), z.any()).optional(),
  isPublic: z.boolean().optional(),
  usageCount: z.number().optional(),
});

// Схемы для поиска и фильтрации
export const reminderFiltersSchema = z.object({
  status: z.array(reminderStatusSchema).optional(),
  type: z.array(reminderTypeSchema).optional(),
  priority: z.array(reminderPrioritySchema).optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  tags: z.array(z.string()).optional(),
  aiGenerated: z.boolean().optional(),
  search: z.string().optional(),
});

export const reminderSortOptionsSchema = z.object({
  field: z.enum(["reminderTime", "createdAt", "priority", "title"]),
  direction: z.enum(["asc", "desc"]),
});

export const reminderSearchSchema = z.object({
  filters: reminderFiltersSchema.optional(),
  sort: reminderSortOptionsSchema.optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// Схемы для создания из текста
export const createFromTextSchema = z.object({
  text: z.string().min(1),
  chatId: z.string().optional(),
  timezone: z.string().default("Europe/Moscow"),
  context: z.record(z.string(), z.any()).optional(),
});

// Схемы для операций
export const reminderIdSchema = z.object({
  id: cuid2Schema,
});

export const completeReminderSchema = reminderIdSchema;

export const snoozeReminderSchema = z.object({
  id: cuid2Schema,
  snoozeUntil: dateSchema,
});

export const getReminderSchema = z.object({
  id: cuid2Schema,
  includeExecutions: z.boolean().default(false),
});

export const findSimilarSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  limit: z.number().min(1).max(20).default(5),
});

// Схемы для массовых операций
export const bulkReminderOperationSchema = z.object({
  reminderIds: z.array(cuid2Schema),
  operation: z.enum(["complete", "delete", "snooze", "update"]),
  data: z.record(z.string(), z.any()).optional(),
  snoozeUntil: dateSchema.optional(),
});

// Валидационные функции
export const validateReminder = (data: unknown) => {
  return reminderSchema.parse(data);
};

export const validateReminderUpdate = (data: unknown) => {
  return reminderUpdateSchema.parse(data);
};

export const validateReminderExecution = (data: unknown) => {
  return reminderExecutionSchema.parse(data);
};

export const validateReminderTemplate = (data: unknown) => {
  return reminderTemplateSchema.parse(data);
};

export const validateReminderSearch = (data: unknown) => {
  return reminderSearchSchema.parse(data);
};

export const validateBulkOperation = (data: unknown) => {
  return bulkReminderOperationSchema.parse(data);
};

// Бизнес-логика валидации
export const validateReminderTime = (
  reminderTime: Date,
  recurrenceEndDate?: Date,
) => {
  const now = new Date();

  if (reminderTime < now) {
    throw new Error("Время напоминания не может быть в прошлом");
  }

  if (recurrenceEndDate && recurrenceEndDate < reminderTime) {
    throw new Error(
      "Дата окончания повторения не может быть раньше времени напоминания",
    );
  }

  return true;
};

export const validateRecurrencePattern = (pattern: any, recurrence: string) => {
  if (recurrence === "custom" && !pattern) {
    throw new Error(
      "Паттерн повторения обязателен для пользовательского повторения",
    );
  }

  if (pattern && recurrence !== "custom") {
    throw new Error(
      "Паттерн повторения может быть указан только для пользовательского повторения",
    );
  }

  return true;
};

export const validateTags = (tags: string[]) => {
  if (tags.length > 10) {
    throw new Error("Максимальное количество тегов: 10");
  }

  const invalidTags = tags.filter((tag) => tag.length > 50);
  if (invalidTags.length > 0) {
    throw new Error("Теги не могут быть длиннее 50 символов");
  }

  return true;
};

// Экспорт типов, выведенных из схем
export type ReminderType = z.infer<typeof reminderTypeSchema>;
export type ReminderPriority = z.infer<typeof reminderPrioritySchema>;
export type ReminderStatus = z.infer<typeof reminderStatusSchema>;
export type ReminderRecurrence = z.infer<typeof reminderRecurrenceSchema>;
export type ExecutionStatus = z.infer<typeof executionStatusSchema>;
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;

export type RecurrencePattern = z.infer<typeof recurrencePatternSchema>;
export type AIContext = z.infer<typeof aiContextSchema>;
export type SmartSuggestions = z.infer<typeof smartSuggestionsSchema>;
export type ReminderTags = z.infer<typeof tagsSchema>;
export type ReminderMetadata = z.infer<typeof metadataSchema>;

export type Reminder = z.infer<typeof reminderSchema>;
export type ReminderUpdate = z.infer<typeof reminderUpdateSchema>;
export type ReminderExecution = z.infer<typeof reminderExecutionSchema>;
export type ReminderExecutionUpdate = z.infer<
  typeof reminderExecutionUpdateSchema
>;
export type ReminderTemplate = z.infer<typeof reminderTemplateSchema>;
export type ReminderTemplateUpdate = z.infer<
  typeof reminderTemplateUpdateSchema
>;

export type ReminderFilters = z.infer<typeof reminderFiltersSchema>;
export type ReminderSortOptions = z.infer<typeof reminderSortOptionsSchema>;
export type ReminderSearch = z.infer<typeof reminderSearchSchema>;

export type CreateFromTextRequest = z.infer<typeof createFromTextSchema>;
export type ReminderIdRequest = z.infer<typeof reminderIdSchema>;
export type CompleteReminderRequest = z.infer<typeof completeReminderSchema>;
export type SnoozeReminderRequest = z.infer<typeof snoozeReminderSchema>;
export type GetReminderRequest = z.infer<typeof getReminderSchema>;
export type FindSimilarRequest = z.infer<typeof findSimilarSchema>;
export type BulkReminderOperation = z.infer<typeof bulkReminderOperationSchema>;
