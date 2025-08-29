import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "../auth/schema";

// Enum для типов напоминаний
export const reminderTypeEnum = pgEnum("reminder_type", [
  "task",
  "event",
  "deadline",
  "meeting",
  "call",
  "follow_up",
  "custom",
]);

// Enum для статусов напоминаний
export const reminderStatusEnum = pgEnum("reminder_status", [
  "pending",
  "active",
  "completed",
  "cancelled",
  "snoozed",
]);

// Enum для приоритетов
export const reminderPriorityEnum = pgEnum("reminder_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

// Enum для частоты повторений
export const reminderRecurrenceEnum = pgEnum("reminder_recurrence", [
  "none",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "custom",
]);

// Типы для JSON полей
export interface RecurrencePattern {
  frequency: string;
  interval: number;
  byDay?: string[];
  byMonth?: number[];
  byMonthDay?: number[];
  until?: string;
}

export interface AIContext {
  source: string;
  conversationId?: string;
  intent?: string;
  entities?: Record<string, any>;
  confidence?: number;
}

export interface SmartSuggestions {
  nextReminder?: string;
  relatedTasks?: string[];
  priorityAdjustment?: string;
  timeOptimization?: string;
}

export type ReminderTags = string[];

export type ReminderMetadata = Record<string, any>;

// Основная таблица напоминаний
export const reminders = pgTable(
  "reminders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Основная информация
    title: text("title").notNull(),
    description: text("description"),
    type: reminderTypeEnum("type").notNull().default("task"),
    priority: reminderPriorityEnum("priority").notNull().default("medium"),
    status: reminderStatusEnum("status").notNull().default("pending"),

    // Временные метки
    reminderTime: timestamp("reminder_time", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    // Повторения
    recurrence: reminderRecurrenceEnum("recurrence").default("none"),
    recurrencePattern: jsonb("recurrence_pattern").$type<RecurrencePattern>(),
    recurrenceEndDate: timestamp("recurrence_end_date", { withTimezone: true }),

    // ИИ и контекст
    aiGenerated: boolean("ai_generated").default(false),
    aiContext: jsonb("ai_context").$type<AIContext>(),
    smartSuggestions: jsonb("smart_suggestions").$type<SmartSuggestions>(),

    // Связи и метаданные
    chatId: uuid("chat_id"), // Связь с чатом, если напоминание создано из чата
    parentReminderId: uuid("parent_reminder_id"), // Для связанных напоминаний
    tags: jsonb("tags").$type<ReminderTags>(),

    // Настройки уведомлений
    notificationSent: boolean("notification_sent").default(false),
    snoozeCount: integer("snooze_count").default(0),
    snoozeUntil: timestamp("snooze_until", { withTimezone: true }),

    // Дополнительные данные
    metadata: jsonb("metadata").$type<ReminderMetadata>(),
  },
  (table) => ({
    // Основные индексы для производительности
    userIdIdx: index("reminders_user_id_idx").on(table.userId),
    reminderTimeIdx: index("reminders_reminder_time_idx").on(
      table.reminderTime,
    ),
    statusIdx: index("reminders_status_idx").on(table.status),
    typeIdx: index("reminders_type_idx").on(table.type),

    // Составные индексы для сложных запросов (оптимизированы по порядку)
    // userId + status - для фильтрации по пользователю и статусу
    userStatusIdx: index("reminders_user_status_idx").on(
      table.userId,
      table.status,
    ),
    // userId + type + status - для фильтрации по пользователю, типу и статусу
    userTypeStatusIdx: index("reminders_user_type_status_idx").on(
      table.userId,
      table.type,
      table.status,
    ),
    // userId + priority + reminderTime - для сортировки по приоритету и времени
    userPriorityTimeIdx: index("reminders_user_priority_time_idx").on(
      table.userId,
      table.priority,
      table.reminderTime,
    ),
    // userId + reminderTime + status - для поиска активных напоминаний по времени
    userTimeStatusIdx: index("reminders_user_time_status_idx").on(
      table.userId,
      table.reminderTime,
      table.status,
    ),

    // Специальные индексы
    aiGeneratedIdx: index("reminders_ai_generated_idx").on(table.aiGenerated),
    parentReminderIdx: index("reminders_parent_reminder_idx").on(
      table.parentReminderId,
    ),
    chatIdIdx: index("reminders_chat_id_idx").on(table.chatId),

    // Индексы для повторений
    recurrenceIdx: index("reminders_recurrence_idx").on(table.recurrence),
    recurrenceEndDateIdx: index("reminders_recurrence_end_date_idx").on(
      table.recurrenceEndDate,
    ),

    // Индексы для JSON полей (PostgreSQL автоматически выберет GIN для jsonb)
    // Индекс для тегов с поддержкой операторов JSON
    tagsGinIdx: index("reminders_tags_gin_idx").on(table.tags),
    // Индекс для метаданных
    metadataGinIdx: index("reminders_metadata_gin_idx").on(table.metadata),
    // Индекс для паттерна повторения
    recurrencePatternGinIdx: index("reminders_recurrence_pattern_gin_idx").on(
      table.recurrencePattern,
    ),

    // Индексы для временных полей
    createdAtIdx: index("reminders_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("reminders_updated_at_idx").on(table.updatedAt),
    completedAtIdx: index("reminders_completed_at_idx").on(table.completedAt),
    snoozeUntilIdx: index("reminders_snooze_until_idx").on(table.snoozeUntil),
  }),
);

// Таблица для истории выполнения напоминаний
export const reminderExecutions = pgTable(
  "reminder_executions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reminderId: uuid("reminder_id")
      .notNull()
      .references(() => reminders.id, { onDelete: "cascade" }),

    executedAt: timestamp("executed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    status: text("status").notNull(), // "sent", "failed", "skipped"
    channel: text("channel"), // "telegram", "email", "push", etc.
    errorMessage: text("error_message"),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
  },
  (table) => ({
    // Основные индексы
    reminderIdIdx: index("reminder_executions_reminder_id_idx").on(
      table.reminderId,
    ),
    executedAtIdx: index("reminder_executions_executed_at_idx").on(
      table.executedAt,
    ),
    statusIdx: index("reminder_executions_status_idx").on(table.status),
    channelIdx: index("reminder_executions_channel_idx").on(table.channel),

    // Составные индексы для анализа (оптимизированы по порядку)
    // reminderId + status - для фильтрации по напоминанию и статусу
    reminderStatusIdx: index("reminder_executions_reminder_status_idx").on(
      table.reminderId,
      table.status,
    ),
    // reminderId + executedAt - для сортировки по времени выполнения
    reminderExecutedAtIdx: index(
      "reminder_executions_reminder_executed_at_idx",
    ).on(table.reminderId, table.executedAt),
    // status + executedAt - для анализа по статусу и времени
    statusExecutedAtIdx: index("reminder_executions_status_executed_at_idx").on(
      table.status,
      table.executedAt,
    ),
    // channel + status - для анализа по каналу и статусу
    channelStatusIdx: index("reminder_executions_channel_status_idx").on(
      table.channel,
      table.status,
    ),

    // GIN индекс для метаданных
    metadataGinIdx: index("reminder_executions_metadata_gin_idx").on(
      table.metadata,
    ),
  }),
);

// Таблица для шаблонов напоминаний
export const reminderTemplates = pgTable(
  "reminder_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    description: text("description"),
    template: jsonb("template").notNull().$type<Record<string, any>>(), // JSON шаблон напоминания
    isPublic: boolean("is_public").default(false),
    usageCount: integer("usage_count").default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("reminder_templates_user_id_idx").on(table.userId),
    isPublicIdx: index("reminder_templates_is_public_idx").on(table.isPublic),
    nameIdx: index("reminder_templates_name_idx").on(table.name),

    // Составной индекс для поиска публичных шаблонов
    publicNameIdx: index("reminder_templates_public_name_idx").on(
      table.isPublic,
      table.name,
    ),
  }),
);

// Relations
export const remindersRelations = relations(reminders, ({ one, many }) => ({
  user: one(user, {
    fields: [reminders.userId],
    references: [user.id],
  }),
  parentReminder: one(reminders, {
    fields: [reminders.parentReminderId],
    references: [reminders.id],
  }),
  childReminders: many(reminders),
  executions: many(reminderExecutions),
}));

export const reminderExecutionsRelations = relations(
  reminderExecutions,
  ({ one }) => ({
    reminder: one(reminders, {
      fields: [reminderExecutions.reminderId],
      references: [reminders.id],
    }),
  }),
);

export const reminderTemplatesRelations = relations(
  reminderTemplates,
  ({ one }) => ({
    user: one(user, {
      fields: [reminderTemplates.userId],
      references: [user.id],
    }),
  }),
);
