import { and, desc, eq, lt, sql } from "drizzle-orm";

import type { Reminder } from "@synoro/db/schema";
import type { Reminder as ValidatorReminder } from "@synoro/validators";
import { db } from "@synoro/db/client";
import { reminders, user } from "@synoro/db/schema";

import { BaseReminderService } from "./base-reminder-service";

export class AnonymousReminderService extends BaseReminderService {
  /**
   * Получить напоминания для анонимного пользователя по Telegram Chat ID
   */
  async getRemindersByTelegramChatId(
    telegramChatId: string,
  ): Promise<Reminder[]> {
    // Сначала находим пользователя по telegramChatId
    const foundUser = await db
      .select({ id: user.id })
      .from(user)
      .where(
        and(
          eq(user.telegramChatId, telegramChatId),
          eq(user.isAnonymous, true),
        ),
      )
      .limit(1);

    if (!foundUser.length) {
      return [];
    }

    return await db
      .select()
      .from(reminders)
      .where(eq(reminders.userId, foundUser[0]!.id))
      .orderBy(desc(reminders.reminderTime));
  }

  /**
   * Создать напоминание для анонимного пользователя
   */
  async createReminderForAnonymousUser(
    telegramChatId: string,
    reminderData: Omit<ValidatorReminder, "userId">,
  ): Promise<Reminder> {
    // Находим или создаем анонимного пользователя
    const { AnonymousUserService } = await import("../anonymous-user-service");
    const anonymousUserService = new AnonymousUserService();

    const anonymousUser = await anonymousUserService.getOrCreateAnonymousUser({
      telegramChatId,
    });

    // Создаем напоминание с userId анонимного пользователя
    return await this.createReminder({
      ...reminderData,
      userId: anonymousUser.id,
    });
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
    const foundUser = await db
      .select({ id: user.id })
      .from(user)
      .where(
        and(
          eq(user.telegramChatId, telegramChatId),
          eq(user.isAnonymous, true),
        ),
      )
      .limit(1);

    if (!foundUser.length) {
      return { total: 0, pending: 0, completed: 0, overdue: 0 };
    }

    const userId = foundUser[0]!.id;
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
