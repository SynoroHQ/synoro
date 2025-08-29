// Типы для API роутов напоминаний
// Импортируем основные типы из валидаторов

export type {
  // Основные типы напоминаний
  Reminder,
  ReminderUpdate,
  ReminderType,
  ReminderStatus,
  ReminderPriority,
  ReminderRecurrence,

  // Типы для выполнения
  ReminderExecution,
  ReminderExecutionUpdate,
  ExecutionStatus,
  NotificationChannel,

  // Типы для шаблонов
  ReminderTemplate,
  ReminderTemplateUpdate,

  // Типы для поиска и фильтрации
  ReminderFilters,
  ReminderSortOptions,
  ReminderSearch,

  // Типы для API запросов
  CreateFromTextRequest,
  ReminderIdRequest,
  CompleteReminderRequest,
  SnoozeReminderRequest,
  GetReminderRequest,
  FindSimilarRequest,
  BulkReminderOperation,
} from "@synoro/validators";

// Дополнительные типы для API
export type CreateReminderInput = Omit<
  import("@synoro/validators").Reminder,
  "userId" | "id" | "createdAt" | "updatedAt"
>;

export type UpdateReminderInput = import("@synoro/validators").ReminderUpdate;

export type ListRemindersInput = import("@synoro/validators").ReminderSearch;

export type DeleteReminderInput = { id: string };
