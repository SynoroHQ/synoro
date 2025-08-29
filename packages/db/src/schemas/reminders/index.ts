// Export schema
export * from "./schema";

// Export types from validators (only non-conflicting ones)
export type {
  ReminderType,
  ReminderPriority,
  ReminderStatus,
  ReminderRecurrence,
  ExecutionStatus,
  NotificationChannel,
  Reminder,
  ReminderUpdate,
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

// Export utilities
export * from "./utils";

// Export constants
export * from "./constants";

// Export validation functions from validators
export {
  validateReminder,
  validateReminderUpdate,
  validateReminderExecution,
  validateReminderTemplate,
  validateReminderSearch,
  validateBulkOperation,
  validateReminderTime,
  validateRecurrencePattern,
  validateTags,
} from "@synoro/validators";
