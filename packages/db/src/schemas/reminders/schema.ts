import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
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
} from "drizzle-orm/pg-core";

import { users } from "../auth/schema";

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
  entities?: Record<string, unknown>;
  confidence?: number;
}

export interface SmartSuggestions {
  nextReminder?: string;
  relatedTasks?: string[];
  priorityAdjustment?: string;
  timeOptimization?: string;
}

export type ReminderTags = string[];

export type ReminderMetadata = Record<string, unknown>;

// Основная таблица напоминаний
export const reminders = pgTable(
  "reminders",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

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
    chatId: text("chat_id"), // Связь с чатом, если напоминание создано из чата
    parentReminderId: text("parent_reminder_id"), // Для связанных напоминаний
    tags: jsonb("tags").$type<ReminderTags>(),

    // Настройки уведомлений
    notificationSent: boolean("notification_sent").default(false),
    snoozeCount: integer("snooze_count").default(0),
    snoozeUntil: timestamp("snooze_until", { withTimezone: true }),

    // Дополнительные данные
    metadata: jsonb("metadata").$type<ReminderMetadata>(),
  },
  (table) => [
    // Основные индексы для производительности
    index("reminders_user_id_idx").on(table.userId),
    index("reminders_reminder_time_idx").on(table.reminderTime),
    index("reminders_status_idx").on(table.status),
    index("reminders_type_idx").on(table.type),
    index("reminders_priority_idx").on(table.priority),

    // Составные индексы для сложных запросов (оптимизированы по порядку)
    // userId + status - для фильтрации по пользователю и статусу
    index("reminders_user_status_idx").on(table.userId, table.status),

    // userId + type + status - для фильтрации по пользователю, типу и статусу
    index("reminders_user_type_status_idx").on(
      table.userId,
      table.type,
      table.status,
    ),

    // userId + reminderTime + status - для поиска активных напоминаний по времени
    index("reminders_user_time_status_idx").on(
      table.userId,
      table.reminderTime,
      table.status,
    ),

    // userId + priority + reminderTime - для сортировки по приоритету и времени
    index("reminders_user_priority_time_idx").on(
      table.userId,
      table.priority,
      table.reminderTime,
    ),

    // Индексы с условиями для оптимизации
    // Только активные напоминания по времени
    index("reminders_active_time_idx")
      .on(table.reminderTime)
      .where(sql`${table.status} = 'active'`),

    // Только незавершенные напоминания по пользователю
    index("reminders_user_pending_idx")
      .on(table.userId, table.reminderTime)
      .where(sql`${table.status} IN ('pending', 'active')`),

    // Специальные индексы
    index("reminders_ai_generated_idx").on(table.aiGenerated),
    index("reminders_parent_reminder_idx").on(table.parentReminderId),
    index("reminders_chat_id_idx").on(table.chatId),

    // Индексы для повторений
    index("reminders_recurrence_idx").on(table.recurrence),
    index("reminders_recurrence_end_date_idx").on(table.recurrenceEndDate),

    // GIN индексы для JSON полей с использованием правильного синтаксиса
    index("reminders_tags_gin_idx").using("gin", table.tags),
    index("reminders_metadata_gin_idx").using("gin", table.metadata),
    index("reminders_recurrence_pattern_gin_idx").using(
      "gin",
      table.recurrencePattern,
    ),
    index("reminders_ai_context_gin_idx").using("gin", table.aiContext),
    index("reminders_smart_suggestions_gin_idx").using(
      "gin",
      table.smartSuggestions,
    ),

    // Индексы для временных полей
    index("reminders_created_at_idx").on(table.createdAt),
    index("reminders_updated_at_idx").on(table.updatedAt),
    index("reminders_completed_at_idx").on(table.completedAt),
    index("reminders_snooze_until_idx").on(table.snoozeUntil),

    // Уникальные индексы
    // Уникальность по пользователю и времени для предотвращения дубликатов
    uniqueIndex("reminders_user_time_unique_idx")
      .on(table.userId, table.reminderTime, table.title)
      .where(sql`${table.status} IN ('pending', 'active')`),
  ],
);

// Таблица для истории выполнения напоминаний
export const reminderExecutions = pgTable(
  "reminder_executions",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    reminderId: text("reminder_id")
      .notNull()
      .references(() => reminders.id, { onDelete: "cascade" }),

    executedAt: timestamp("executed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    status: text("status").notNull(), // "sent", "failed", "skipped"
    channel: text("channel"), // "telegram", "email", "push", etc.
    errorMessage: text("error_message"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  },
  (table) => [
    // Основные индексы
    index("reminder_executions_reminder_id_idx").on(table.reminderId),
    index("reminder_executions_executed_at_idx").on(table.executedAt),
    index("reminder_executions_status_idx").on(table.status),
    index("reminder_executions_channel_idx").on(table.channel),

    // Составные индексы для анализа (оптимизированы по порядку)
    // reminderId + status - для фильтрации по напоминанию и статусу
    index("reminder_executions_reminder_status_idx").on(
      table.reminderId,
      table.status,
    ),
    // reminderId + executedAt - для сортировки по времени выполнения
    index("reminder_executions_reminder_executed_at_idx").on(
      table.reminderId,
      table.executedAt,
    ),
    // status + executedAt - для анализа по статусу и времени
    index("reminder_executions_status_executed_at_idx").on(
      table.status,
      table.executedAt,
    ),
    // channel + status - для анализа по каналу и статусу
    index("reminder_executions_channel_status_idx").on(
      table.channel,
      table.status,
    ),

    // Индексы с условиями для оптимизации
    // Только неудачные выполнения для мониторинга
    index("reminder_executions_failed_idx")
      .on(table.executedAt, table.channel)
      .where(sql`${table.status} = 'failed'`),

    // Только успешные выполнения для статистики
    index("reminder_executions_success_idx")
      .on(table.reminderId, table.executedAt)
      .where(sql`${table.status} = 'sent'`),

    // GIN индекс для метаданных
    index("reminder_executions_metadata_gin_idx").using("gin", table.metadata),
  ],
);

// Таблица для шаблонов напоминаний
export const reminderTemplates = pgTable(
  "reminder_templates",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    description: text("description"),
    template: jsonb("template").notNull().$type<Record<string, unknown>>(), // JSON шаблон напоминания
    isPublic: boolean("is_public").default(false),
    usageCount: integer("usage_count").default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Основные индексы
    index("reminder_templates_user_id_idx").on(table.userId),
    index("reminder_templates_is_public_idx").on(table.isPublic),
    index("reminder_templates_name_idx").on(table.name),
    index("reminder_templates_usage_count_idx").on(table.usageCount),

    // Составные индексы для поиска
    // Публичные шаблоны по имени
    index("reminder_templates_public_name_idx").on(table.isPublic, table.name),
    // Пользовательские шаблоны по имени
    index("reminder_templates_user_name_idx").on(table.userId, table.name),
    // Популярные публичные шаблоны
    index("reminder_templates_popular_public_idx").on(
      table.isPublic,
      table.usageCount,
    ),

    // Уникальные индексы
    // Уникальность имени шаблона для пользователя
    uniqueIndex("reminder_templates_user_name_unique_idx").on(
      table.userId,
      table.name,
    ),

    // Уникальность имени для публичных шаблонов
    uniqueIndex("reminder_templates_public_name_unique_idx")
      .on(table.name)
      .where(sql`${table.isPublic} = true`),
  ],
);

// Relations for reminders
export const remindersRelations = relations(reminders, ({ one, many }) => ({
  user: one(users, {
    fields: [reminders.userId],
    references: [users.id],
  }),
  parentReminder: one(reminders, {
    fields: [reminders.parentReminderId],
    references: [reminders.id],
    relationName: "reminderHierarchy",
  }),
  childReminders: many(reminders, {
    relationName: "reminderHierarchy",
  }),
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
    user: one(users, {
      fields: [reminderTemplates.userId],
      references: [users.id],
    }),
  }),
);
