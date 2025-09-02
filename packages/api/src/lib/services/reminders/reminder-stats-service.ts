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


}
