import { and, desc, eq, gte, lt, lte, or, sql } from "drizzle-orm";

import type { Reminder } from "@synoro/db/schema";
import type {
  ReminderFilters as ValidatorReminderFilters,
  ReminderSortOptions as ValidatorReminderSortOptions,
} from "@synoro/validators";
import { db } from "@synoro/db/client";
import { reminders } from "@synoro/db/schema";

export class ReminderSearchService {
  /**
   * Получить список напоминаний пользователя с фильтрацией
   */
  async getUserReminders(
    userId: string,
    filters: ValidatorReminderFilters = {},
    sort: ValidatorReminderSortOptions = {
      field: "reminderTime",
      direction: "asc",
    },
    limit = 50,
    offset = 0,
  ): Promise<Reminder[]> {
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
      const searchCondition = or(
        sql`${reminders.title} ILIKE ${`%${filters.search}%`}`,
        sql`${reminders.description} ILIKE ${`%${filters.search}%`}`,
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (filters.tags?.length) {
      // Поиск по тегам в JSON поле
      conditions.push(
        sql`${reminders.tags}::jsonb ?| array[${filters.tags.join(",")}]`,
      );
    }

    let query = db
      .select()
      .from(reminders)
      .where(and(...conditions));

    // Применяем сортировку
    const sortField = reminders[sort.field as keyof typeof reminders];
    if (sortField) {
      query = query.orderBy(
        sort.direction === "desc" ? desc(sortField) : sortField,
      );
    }

    // Применяем пагинацию
    query = query.limit(limit).offset(offset);

    return await query;
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
        ),
      )
      .orderBy(reminders.reminderTime);
  }
}
