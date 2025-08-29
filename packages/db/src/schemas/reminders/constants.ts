// Константы для схемы напоминаний

/**
 * Значения по умолчанию для напоминаний
 */
export const REMINDER_DEFAULTS = {
  PRIORITY: "medium" as const,
  STATUS: "pending" as const,
  TYPE: "task" as const,
  RECURRENCE: "none" as const,
  AI_GENERATED: false,
  NOTIFICATION_SENT: false,
  SNOOZE_COUNT: 0,
} as const;

/**
 * Ограничения для полей
 */
export const REMINDER_CONSTRAINTS = {
  TITLE_MAX_LENGTH: 500,
  DESCRIPTION_MAX_LENGTH: 2000,
  ERROR_MESSAGE_MAX_LENGTH: 1000,
  METADATA_MAX_SIZE: 10000, // байт
  TAGS_MAX_COUNT: 20,
  TAGS_MAX_LENGTH: 50,
} as const;

/**
 * Временные константы
 */
export const TIME_CONSTRAINTS = {
  MIN_REMINDER_INTERVAL: 60 * 1000, // 1 минута в миллисекундах
  MAX_REMINDER_INTERVAL: 365 * 24 * 60 * 60 * 1000, // 1 год в миллисекундах
  DEFAULT_SNOOZE_DURATION: 15 * 60 * 1000, // 15 минут в миллисекундах
  MAX_SNOOZE_DURATION: 24 * 60 * 60 * 1000, // 24 часа в миллисекундах
} as const;

/**
 * Статусы выполнения напоминаний
 */
export const EXECUTION_STATUSES = {
  SENT: "sent",
  FAILED: "failed",
  SKIPPED: "skipped",
} as const;

/**
 * Каналы уведомлений
 */
export const NOTIFICATION_CHANNELS = {
  TELEGRAM: "telegram",
  EMAIL: "email",
  PUSH: "push",
  SMS: "sms",
  WEBHOOK: "webhook",
} as const;

/**
 * Приоритеты напоминаний
 */
export const REMINDER_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

/**
 * Типы напоминаний
 */
export const REMINDER_TYPES = {
  TASK: "task",
  EVENT: "event",
  DEADLINE: "deadline",
  MEETING: "meeting",
  CALL: "call",
  FOLLOW_UP: "follow_up",
  CUSTOM: "custom",
} as const;

/**
 * Статусы напоминаний
 */
export const REMINDER_STATUSES = {
  PENDING: "pending",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  SNOOZED: "snoozed",
} as const;

/**
 * Частоты повторений
 */
export const RECURRENCE_TYPES = {
  NONE: "none",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
  CUSTOM: "custom",
} as const;

/**
 * Максимальные значения для счетчиков
 */
export const MAX_COUNTS = {
  SNOOZE_COUNT: 10,
  USAGE_COUNT: 999999,
} as const;

/**
 * Шаблоны для валидации
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;
