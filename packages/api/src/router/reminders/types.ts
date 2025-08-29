// Экспортируем типы из validators.ts
export type {
  ReminderType,
  ReminderPriority,
  ReminderStatus,
  ReminderRecurrence,
  RecurrencePattern,
  AIContext,
  SmartSuggestions,
  ReminderTags,
  ReminderMetadata,
  Reminder,
  ReminderUpdate,
  ReminderFilters,
  ReminderSortOptions,
  CreateFromTextRequest,
  CompleteReminderRequest,
  SnoozeReminderRequest,
  GetReminderRequest,
  FindSimilarRequest,
  BulkReminderOperation,
} from "@synoro/db";

// Дополнительные типы для API
export type CreateReminderInput = Omit<Reminder, "userId" | "id" | "createdAt" | "updatedAt">;
export type UpdateReminderInput = ReminderUpdate;
export type ListRemindersInput = {
  filters?: ReminderFilters;
  sort?: ReminderSortOptions;
  limit?: number;
  offset?: number;
};
export type DeleteReminderInput = { id: string };
