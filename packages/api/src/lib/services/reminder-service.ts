import { and, desc, eq, gte, lt, lte, or, sql } from "drizzle-orm";

import type {
  NewReminder,
  Reminder,
  ReminderFilters,
  ReminderSortOptions,
  ReminderUpdate,
  ReminderWithExecutions,
} from "@synoro/db/schemas/reminders";
import { db } from "@synoro/db";
import { user } from "@synoro/db/schemas/auth";
import {
  reminderExecutions,
  reminders,
  reminderTemplates,
} from "@synoro/db/schemas/reminders";

export class ReminderService {
  /**
   * Создать новое напоминание
   */
  async createReminder(data: NewReminder): Promise<Reminder> {
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
    data: ReminderUpdate,
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

    return result.rowCount > 0;
  }

  /**
   * Получить список напоминаний пользователя с фильтрацией
   */
  async getUserReminders(
    userId: string,
    filters: ReminderFilters = {},
    sort: ReminderSortOptions = { field: "reminderTime", direction: "asc" },
    limit = 50,
    offset = 0,
  ): Promise<Reminder[]> {
    let query = db.select().from(reminders).where(eq(reminders.userId, userId));

    // Применяем фильтры
    const conditions = [eq(reminders.userId, userId)];

    if (filters.status?.length) {
      conditions.push(sql`${reminders.status} = ANY(${filters.status})`);
    }

    if (filters.type?.length) {
      conditions.push(sql`${reminders.type} = ANY(${filters.type})`);
    }

    if (filters.priority?.length) {
      conditions.push(sql`${reminders.priority} = ANY(${filters.priority})`);
    }

    if (filters.dateFrom) {
      conditions.push(gte(reminders.reminderTime, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(reminders.reminderTime, filters.dateTo));
    }

    if (filters.aiGenerated !== undefined) {
      conditions.push(eq(reminders.aiGenerated, filters.aiGenerated));
    }

    if (filters.search) {
      conditions.push(
        or(
          sql`${reminders.title} ILIKE ${`%${filters.search}%`}`,
          sql`${reminders.description} ILIKE ${`%${filters.search}%`}`,
        ),
      );
    }

    if (filters.tags?.length) {
      // Поиск по тегам в JSON поле
      conditions.push(
        sql`${reminders.tags}::jsonb ?| array[${filters.tags.join(",")}]`,
      );
    }

    query = query.where(and(...conditions));

    // Применяем сортировку
    const sortField = reminders[sort.field];
    query = query.orderBy(
      sort.direction === "desc" ? desc(sortField) : sortField,
    );

    // Применяем пагинацию
    query = query.limit(limit).offset(offset);

    return await query;
  }

  /**
   * Получить активные напоминания для отправки
   */
  async getActiveRemindersForExecution(
    beforeTime: Date = new Date(),
  ): Promise<Reminder[]> {
    return await db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.status, "active"),
          lte(reminders.reminderTime, beforeTime),
          eq(reminders.notificationSent, false),
          or(
            eq(reminders.snoozeUntil, null),
            lte(reminders.snoozeUntil, beforeTime),
          ),
        ),
      )
      .orderBy(reminders.reminderTime);
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

    const newReminder: NewReminder = {
      ...originalReminder,
      id: undefined,
      reminderTime: nextReminderTime,
      status: "active",
      notificationSent: false,
      snoozeCount: 0,
      snoozeUntil: null,
      completedAt: null,
      parentReminderId: originalReminder.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.createReminder(newReminder);
  }

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
   * Поиск похожих напоминаний
   */
  async findSimilarReminders(
    userId: string,
    title: string,
    description?: string,
    limit = 5,
  ): Promise<Reminder[]> {
    const searchText = `${title} ${description || ""}`.trim();

    return await db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.userId, userId),
          or(
            sql`${reminders.title} ILIKE ${`%${searchText}%`}`,
            sql`${reminders.description} ILIKE ${`%${searchText}%`}`,
          ),
        ),
      )
      .orderBy(desc(reminders.createdAt))
      .limit(limit);
  }

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
      .where(eq(reminders.userId, foundUser[0].id))
      .orderBy(desc(reminders.reminderTime));
  }

  /**
   * Создать напоминание для анонимного пользователя
   */
  async createReminderForAnonymousUser(
    telegramChatId: string,
    reminderData: Omit<NewReminder, "userId">,
  ): Promise<Reminder> {
    // Находим или создаем анонимного пользователя
    const { AnonymousUserService } = await import("./anonymous-user-service");
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

    const userId = foundUser[0].id;
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
