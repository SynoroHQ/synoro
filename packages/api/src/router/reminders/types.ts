// Типы для роутов напоминаний

export type CreateReminderInput = {
  title: string;
  description?: string;
  type:
    | "task"
    | "event"
    | "deadline"
    | "meeting"
    | "call"
    | "follow_up"
    | "custom";
  priority: "low" | "medium" | "high" | "urgent";
  reminderTime: Date;
  recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
  recurrencePattern?: string;
  recurrenceEndDate?: Date;
  tags?: string[];
  chatId?: string;
};

export type CreateFromTextInput = {
  text: string;
  chatId?: string;
  timezone?: string;
  context?: Record<string, any>;
};

export type UpdateReminderInput = {
  title?: string;
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
  reminderTime?: Date;
  status?: "pending" | "active" | "completed" | "cancelled" | "snoozed";
  recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
  recurrencePattern?: string;
  recurrenceEndDate?: Date;
  tags?: string[];
};

export type ReminderFilters = {
  status?: ("pending" | "active" | "completed" | "cancelled" | "snoozed")[];
  type?: (
    | "task"
    | "event"
    | "deadline"
    | "meeting"
    | "call"
    | "follow_up"
    | "custom"
  )[];
  priority?: ("low" | "medium" | "high" | "urgent")[];
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  aiGenerated?: boolean;
  search?: string;
};

export type ReminderSortOptions = {
  field: "reminderTime" | "createdAt" | "priority" | "title";
  direction: "asc" | "desc";
};

export type ListRemindersInput = {
  filters?: ReminderFilters;
  sort?: ReminderSortOptions;
  limit?: number;
  offset?: number;
};

export type GetReminderInput = {
  id: string;
  includeExecutions?: boolean;
};

export type FindSimilarInput = {
  title: string;
  description?: string;
  limit?: number;
};

export type CompleteReminderInput = {
  id: string;
};

export type SnoozeReminderInput = {
  id: string;
  snoozeUntil: Date;
};

export type DeleteReminderInput = {
  id: string;
};
