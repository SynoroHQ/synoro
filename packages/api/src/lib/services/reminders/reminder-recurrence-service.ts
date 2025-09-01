import type { Reminder } from "@synoro/db/schema";
import type { Reminder as ValidatorReminder } from "@synoro/validators";

import { BaseReminderService } from "./base-reminder-service";

export class ReminderRecurrenceService extends BaseReminderService {
  /**
   * Создать повторяющееся напоминание
   */
  async createRecurringReminder(
    originalReminder: Reminder,
    nextReminderTime: Date,
  ): Promise<Reminder | null> {
    if (
      originalReminder.recurrence === "none" ||
      !originalReminder.recurrence
    ) {
      return null;
    }

    // Проверяем, не превышена ли дата окончания повторений
    if (
      originalReminder.recurrenceEndDate &&
      nextReminderTime > originalReminder.recurrenceEndDate
    ) {
      return null;
    }

    const newReminder: ValidatorReminder = {
      userId: originalReminder.userId,
      title: originalReminder.title,
      reminderTime: nextReminderTime,
      description: originalReminder.description || undefined,
      type: originalReminder.type,
      priority: originalReminder.priority,
      status: "active",
      recurrence: originalReminder.recurrence,
      recurrencePattern: originalReminder.recurrencePattern || undefined,
      recurrenceEndDate: originalReminder.recurrenceEndDate || undefined,
      aiGenerated: originalReminder.aiGenerated,
      aiContext: originalReminder.aiContext || undefined,
      smartSuggestions: originalReminder.smartSuggestions || undefined,

      parentReminderId: originalReminder.id,
      tags: originalReminder.tags || undefined,
      metadata: originalReminder.metadata || undefined,
    };

    return await this.createReminder(newReminder);
  }

  /**
   * Получить следующее время для повторяющегося напоминания
   */
  getNextReminderTime(
    currentTime: Date,
    recurrence: string,
    pattern?: any,
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
          return this.calculateCustomRecurrence(currentTime, pattern);
        }
        return null;
      default:
        return null;
    }
    return nextTime;
  }

  /**
   * Рассчитать пользовательское повторение
   */
  private calculateCustomRecurrence(
    currentTime: Date,
    pattern: any,
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
}
