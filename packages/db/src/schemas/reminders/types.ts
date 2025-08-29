import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type {
  reminderExecutions,
  reminders,
  reminderTemplates,
} from "./schema";

// Экспортируем типы из пакета @synoro/validators (только те, которых нет в схеме)
export type {
  ReminderType,
  ReminderStatus,
  ReminderPriority,
  ReminderRecurrence,
  ExecutionStatus,
  NotificationChannel,
  Reminder,
  ReminderExecution,
  ReminderExecutionUpdate,
  ReminderTemplate,
  ReminderTemplateUpdate,
  ReminderFilters,
  ReminderSortOptions,
  ReminderSearch,
  CreateFromTextRequest,
  ReminderIdRequest,
  CompleteReminderRequest,
  SnoozeReminderRequest,
  GetReminderRequest,
  FindSimilarRequest,
  BulkReminderOperation,
} from "@synoro/validators";

// Основные типы для Drizzle ORM
export type ReminderSelect = InferSelectModel<typeof reminders>;
export type ReminderInsert = InferInsertModel<typeof reminders>;

export type ReminderExecutionSelect = InferSelectModel<
  typeof reminderExecutions
>;
export type ReminderExecutionInsert = InferInsertModel<
  typeof reminderExecutions
>;

export type ReminderTemplateSelect = InferSelectModel<typeof reminderTemplates>;
export type ReminderTemplateInsert = InferInsertModel<typeof reminderTemplates>;

// Расширенные типы с дополнительной информацией
export interface ReminderWithExecutions extends ReminderSelect {
  executions: ReminderExecutionSelect[];
}

export interface ReminderWithChildren extends ReminderSelect {
  childReminders: ReminderSelect[];
}

// Типы для API (совместимость с существующим кодом)
export type NewReminder = ReminderInsert;
export type ReminderUpdate = Partial<
  Omit<ReminderInsert, "id" | "userId" | "createdAt">
>;

export type NewReminderExecution = ReminderExecutionInsert;
export type NewReminderTemplate = ReminderTemplateInsert;
