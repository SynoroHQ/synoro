import { and, desc, eq, gte, isNull, lt, lte, or, sql } from "drizzle-orm";

import type { Reminder, ReminderWithExecutions } from "@synoro/db/schema";
import type {
  Reminder as ValidatorReminder,
  ReminderUpdate as ValidatorReminderUpdate,
} from "@synoro/validators";
import { db } from "@synoro/db/client";
import { reminderExecutions, reminders } from "@synoro/db/schema";

export class BaseReminderService {
  /**
   * Создать новое напоминание
   */
  async createReminder(data: ValidatorReminder): Promise<Reminder> {
    const [reminder] = await db
      .insert(reminders)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!reminder) {
      throw new Error("Не удалось создать напоминание");
    }

    return reminder;
  }

  /**
   * Получить напоминание по ID
   */
  async getReminderById(id: string, userId: string): Promise<Reminder | null> {
    const [reminder] = await db
      .select()
      .from(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .limit(1);

    return reminder || null;
  }

  /**
   * Получить напоминание с историей выполнения
   */
  async getReminderWithExecutions(
    id: string,
    userId: string,
  ): Promise<ReminderWithExecutions | null> {
    const reminder = await this.getReminderById(id, userId);
    if (!reminder) return null;

    const executions = await db
      .select()
      .from(reminderExecutions)
      .where(eq(reminderExecutions.reminderId, id))
      .orderBy(desc(reminderExecutions.executedAt));

    return {
      ...reminder,
      executions,
    };
  }

  /**
   * Обновить напоминание
   */
  async updateReminder(
    id: string,
    userId: string,
    data: ValidatorReminderUpdate,
  ): Promise<Reminder | null> {
    const [updated] = await db
      .update(reminders)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();

    return updated || null;
  }

  /**
   * Удалить напоминание
   */
  async deleteReminder(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)));

    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Отметить напоминание как выполненное
   */
  async completeReminder(id: string, userId: string): Promise<Reminder | null> {
    return await this.updateReminder(id, userId, {
      status: "completed",
      completedAt: new Date(),
    });
  }

  /**
   * Отложить напоминание
   */
  async snoozeReminder(
    id: string,
    userId: string,
    snoozeUntil: Date,
  ): Promise<Reminder | null> {
    const reminder = await this.getReminderById(id, userId);
    if (!reminder) return null;

    return await this.updateReminder(id, userId, {
      status: "snoozed",
      snoozeUntil,
      snoozeCount: (reminder.snoozeCount || 0) + 1,
    });
  }

  /**
   * Записать выполнение напоминания
   */
  async logExecution(
    reminderId: string,
    status: "sent" | "failed" | "skipped",
    channel?: string,
    errorMessage?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await db.insert(reminderExecutions).values({
      reminderId,
      status,
      channel,
      errorMessage,
      metadata: metadata ? JSON.stringify(metadata) : null,
      executedAt: new Date(),
    });

    // Обновляем статус напоминания
    if (status === "sent") {
      await db
        .update(reminders)
        .set({
          notificationSent: true,
          updatedAt: new Date(),
        })
        .where(eq(reminders.id, reminderId));
    }
  }
}
