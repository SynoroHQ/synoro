import { sql } from "drizzle-orm";

import type { RecurrencePattern } from "./schema";
import { reminders } from "./schema";

/**
 * Утилиты для работы с напоминаниями
 */

/**
 * Проверяет, нужно ли показать напоминание на основе времени
 */
export function shouldShowReminder(
  reminderTime: Date,
  now: Date = new Date(),
): boolean {
  return reminderTime <= now;
}

/**
 * Вычисляет следующее время напоминания на основе паттерна повторения
 */
export function getNextReminderTime(
  currentTime: Date,
  recurrence: string,
  pattern?: RecurrencePattern,
): Date | null {
  if (recurrence === "none") return null;

  const nextTime = new Date(currentTime);

  switch (recurrence) {
    case "daily":
      nextTime.setDate(nextTime.getDate() + 1);
      break;
    case "weekly":
      nextTime.setDate(nextTime.getDate() + 7);
      break;
    case "monthly":
      nextTime.setMonth(nextTime.getMonth() + 1);
      break;
    case "yearly":
      nextTime.setFullYear(nextTime.getFullYear() + 1);
      break;
    case "custom":
      if (pattern) {
        return calculateCustomRecurrence(currentTime, pattern);
      }
      return null;
    default:
      return null;
  }

  return nextTime;
}

/**
 * Вычисляет кастомное повторение на основе паттерна
 */
function calculateCustomRecurrence(
  currentTime: Date,
  pattern: RecurrencePattern,
): Date | null {
  const nextTime = new Date(currentTime);

  if (pattern.interval && pattern.interval > 0) {
    switch (pattern.frequency) {
      case "daily":
        nextTime.setDate(nextTime.getDate() + pattern.interval);
        break;
      case "weekly":
        nextTime.setDate(nextTime.getDate() + pattern.interval * 7);
        break;
      case "monthly":
        nextTime.setMonth(nextTime.getMonth() + pattern.interval);
        break;
      case "yearly":
        nextTime.setFullYear(nextTime.getFullYear() + pattern.interval);
        break;
      default:
        return null;
    }
  }

  return nextTime;
}

/**
 * SQL запрос для поиска активных напоминаний пользователя
 */
export const getActiveRemindersQuery = (userId: string) => sql`
  SELECT * FROM ${reminders}
  WHERE ${reminders.userId} = ${userId}
    AND ${reminders.status} IN ('pending', 'active')
    AND ${reminders.reminderTime} <= NOW()
  ORDER BY ${reminders.reminderTime} ASC
`;

/**
 * SQL запрос для поиска напоминаний по тегам
 */
export const getRemindersByTagsQuery = (userId: string, tags: string[]) => sql`
  SELECT * FROM ${reminders}
  WHERE ${reminders.userId} = ${userId}
    AND ${reminders.tags} ?| ${tags}
  ORDER BY ${reminders.reminderTime} ASC
`;

/**
 * SQL запрос для поиска напоминаний по приоритету
 */
export const getRemindersByPriorityQuery = (
  userId: string,
  priority: string,
) => sql`
  SELECT * FROM ${reminders}
  WHERE ${reminders.userId} = ${userId}
    AND ${reminders.priority} = ${priority}
    AND ${reminders.status} IN ('pending', 'active')
  ORDER BY ${reminders.reminderTime} ASC
`;

/**
 * SQL запрос для поиска просроченных напоминаний
 */
export const getOverdueRemindersQuery = (userId: string) => sql`
  SELECT * FROM ${reminders}
  WHERE ${reminders.userId} = ${userId}
    AND ${reminders.status} IN ('pending', 'active')
    AND ${reminders.reminderTime} < NOW()
  ORDER BY ${reminders.reminderTime} ASC
`;

/**
 * SQL запрос для поиска напоминаний в определенном временном диапазоне
 */
export const getRemindersInTimeRangeQuery = (
  userId: string,
  startTime: Date,
  endTime: Date,
) => sql`
  SELECT * FROM ${reminders}
  WHERE ${reminders.userId} = ${userId}
    AND ${reminders.reminderTime} BETWEEN ${startTime} AND ${endTime}
  ORDER BY ${reminders.reminderTime} ASC
`;

/**
 * SQL запрос для поиска ИИ-сгенерированных напоминаний
 */
export const getAIGeneratedRemindersQuery = (userId: string) => sql`
  SELECT * FROM ${reminders}
  WHERE ${reminders.userId} = ${userId}
    AND ${reminders.aiGenerated} = true
  ORDER BY ${reminders.createdAt} DESC
`;

/**
 * SQL запрос для поиска связанных напоминаний
 */
export const getRelatedRemindersQuery = (reminderId: string) => sql`
  SELECT * FROM ${reminders}
  WHERE ${reminders.parentReminderId} = ${reminderId}
     OR ${reminders.id} = (
       SELECT ${reminders.parentReminderId} 
       FROM ${reminders} 
       WHERE ${reminders.id} = ${reminderId}
     )
  ORDER BY ${reminders.reminderTime} ASC
`;
