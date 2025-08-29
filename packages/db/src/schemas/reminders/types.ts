import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type {
  reminderExecutions,
  reminderPriorityEnum,
  reminderRecurrenceEnum,
  reminders,
  reminderStatusEnum,
  reminderTemplates,
  reminderTypeEnum,
} from "./schema";

// Типы для enum'ов
export type ReminderType = (typeof reminderTypeEnum.enumValues)[number];
export type ReminderStatus = (typeof reminderStatusEnum.enumValues)[number];
export type ReminderPriority = (typeof reminderPriorityEnum.enumValues)[number];
export type ReminderRecurrence =
  (typeof reminderRecurrenceEnum.enumValues)[number];

// Основные типы для напоминаний
export type Reminder = InferSelectModel<typeof reminders>;
export type NewReminder = InferInsertModel<typeof reminders>;
export type ReminderUpdate = Partial<
  Omit<NewReminder, "id" | "userId" | "createdAt">
>;

// Типы для выполнения напоминаний
export type ReminderExecution = InferSelectModel<typeof reminderExecutions>;
export type NewReminderExecution = InferInsertModel<typeof reminderExecutions>;

// Типы для шаблонов
export type ReminderTemplate = InferSelectModel<typeof reminderTemplates>;
export type NewReminderTemplate = InferInsertModel<typeof reminderTemplates>;

// Расширенные типы с дополнительной информацией
export interface ReminderWithExecutions extends Reminder {
  executions: ReminderExecution[];
}

export interface ReminderWithChildren extends Reminder {
  childReminders: Reminder[];
}

// Типы для ИИ контекста
export interface AIContext {
  originalMessage?: string;
  extractedEntities?: {
    datetime?: string;
    location?: string;
    people?: string[];
    keywords?: string[];
  };
  confidence?: number;
  suggestedType?: ReminderType;
  suggestedPriority?: ReminderPriority;
}

export interface SmartSuggestion {
  type: "reschedule" | "priority_change" | "related_task" | "context_update";
  suggestion: string;
  confidence: number;
  metadata?: Record<string, any>;
}

// Типы для паттернов повторения
export interface CustomRecurrencePattern {
  type: "interval";
  interval: number;
  unit: "minutes" | "hours" | "days" | "weeks" | "months" | "years";
  daysOfWeek?: number[]; // 0-6, где 0 = воскресенье
  daysOfMonth?: number[]; // 1-31
  monthsOfYear?: number[]; // 1-12
}

// Типы для фильтрации и поиска
export interface ReminderFilters {
  status?: ReminderStatus[];
  type?: ReminderType[];
  priority?: ReminderPriority[];
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  aiGenerated?: boolean;
  search?: string;
}

export interface ReminderSortOptions {
  field: "reminderTime" | "createdAt" | "priority" | "title";
  direction: "asc" | "desc";
}

// Типы для создания напоминаний через ИИ
export interface CreateReminderFromTextRequest {
  text: string;
  userId: string;
  chatId?: string;
  timezone?: string;
  context?: Record<string, any>;
}

export interface CreateReminderFromTextResponse {
  reminder: Reminder;
  confidence: number;
  suggestions: SmartSuggestion[];
  needsConfirmation: boolean;
}

// Типы для JSON полей в схеме напоминаний

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

// Типы для вставки и обновления
export interface InsertReminder {
  userId: string;
  title: string;
  description?: string;
  type?:
    | "task"
    | "event"
    | "deadline"
    | "meeting"
    | "call"
    | "follow_up"
    | "custom";
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "pending" | "active" | "completed" | "cancelled" | "snoozed";
  reminderTime: Date;
  recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: Date;
  aiGenerated?: boolean;
  aiContext?: AIContext;
  smartSuggestions?: SmartSuggestions;
  chatId?: string;
  parentReminderId?: string;
  tags?: ReminderTags;
  metadata?: ReminderMetadata;
}

export type UpdateReminder = Partial<Omit<InsertReminder, "userId">> & {
  updatedAt?: Date;
  completedAt?: Date;
  notificationSent?: boolean;
  snoozeCount?: number;
  snoozeUntil?: Date;
};

// Типы для вставки и обновления выполнения
export interface InsertReminderExecution {
  reminderId: string;
  status: "sent" | "failed" | "skipped";
  channel?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export type UpdateReminderExecution = Partial<InsertReminderExecution>;

// Типы для вставки и обновления шаблонов
export interface InsertReminderTemplate {
  userId: string;
  name: string;
  description?: string;
  template: Record<string, any>;
  isPublic?: boolean;
}

export type UpdateReminderTemplate = Partial<
  Omit<InsertReminderTemplate, "userId">
> & {
  usageCount?: number;
};
