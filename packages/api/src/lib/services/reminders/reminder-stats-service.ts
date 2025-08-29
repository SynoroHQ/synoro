import { and, eq, lt, sql } from "drizzle-orm";

import type { Reminder } from "@synoro/db/schema";
import { db } from "@synoro/db/client";
import { reminders } from "@synoro/db/schema";

export class ReminderStatsService {
  /**
   * Получить статистику напоминаний пользователя
   */
  async getUserReminderStats(userId: string): Promise<{
    total: number;
    pending: number;
    active: number;
    completed: number;
    overdue: number;
  }> {
    const now = new Date();

    const stats = await db
      .select({
        status: reminders.status,
        count: sql<number>`count(*)`,
        overdue: sql<number>`count(*) filter (where ${reminders.reminderTime} < ${now} and ${reminders.status} in ('pending', 'active'))`,
      })
      .from(reminders)
      .where(eq(reminders.userId, userId))
      .groupBy(reminders.status);

    const result = {
      total: 0,
      pending: 0,
      active: 0,
      completed: 0,
      overdue: 0,
    };

    stats.forEach((stat) => {
      result.total += stat.count;
      if (stat.status === "pending") result.pending = stat.count;
      if (stat.status === "active") result.active = stat.count;
      if (stat.status === "completed") result.completed = stat.count;
      result.overdue += stat.overdue;
    });

    return result;
  }

  /**
   * Получить статистику напоминаний для анонимного пользователя
   */
  async getAnonymousUserReminderStats(telegramChatId: string): Promise<{
    total: number;
    pending: number;
    completed: number;
    overdue: number;
  }> {
    // Сначала находим пользователя по telegramChatId
    const foundUser = await db
      .select({ id: reminders.userId })
      .from(reminders)
      .where(
        and(
          eq(reminders.userId, telegramChatId),
          eq(reminders.userId, telegramChatId), // Временное решение для анонимных пользователей
        ),
      )
      .limit(1);

    if (!foundUser.length) {
      return { total: 0, pending: 0, completed: 0, overdue: 0 };
    }

    const userId = foundUser[0]!.userId;
    const now = new Date();

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reminders)
      .where(eq(reminders.userId, userId));

    const [pendingResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reminders)
      .where(
        and(eq(reminders.userId, userId), eq(reminders.status, "pending")),
      );

    const [completedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reminders)
      .where(
        and(eq(reminders.userId, userId), eq(reminders.status, "completed")),
      );

    const [overdueResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reminders)
      .where(
        and(
          eq(reminders.userId, userId),
          eq(reminders.status, "pending"),
          lt(reminders.reminderTime, now),
        ),
      );

    return {
      total: totalResult?.count || 0,
      pending: pendingResult?.count || 0,
      completed: completedResult?.count || 0,
      overdue: overdueResult?.count || 0,
    };
  }
}
