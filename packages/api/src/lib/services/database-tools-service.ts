import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";

import type {
  EventWithDetails,
  ExpenseSummary,
  GetEventByIdInput,
  GetExpenseSummaryInput,
  GetRecentEventsInput,
  GetUpcomingTasksInput,
  GetUserEventsInput,
  GetUserStatsInput,
  SearchEventsInput,
  SearchResult,
  UserStats,
} from "@synoro/prompts/tools/database-tools";
import { db } from "@synoro/db/client";
import { eventProperties, events, eventTags, tags } from "@synoro/db/schema";

/**
 * Сервис для обработки database tools мультиагентов
 * Предоставляет методы для получения информации о делах и событиях пользователя
 */
export class DatabaseToolsService {
  /**
   * Получить события пользователя с фильтрацией
   */
  async getUserEvents(input: GetUserEventsInput): Promise<EventWithDetails[]> {
    try {
      const {
        userId,
        householdId,
        limit = 10,
        offset = 0,
        type,
        status,
        priority,
        startDate,
        endDate,
        search,
      } = input;

      const conditions = [eq(events.householdId, householdId)];

      if (userId) {
        conditions.push(eq(events.userId, userId));
      }

      if (type) {
        conditions.push(eq(events.type, type));
      }

      if (status) {
        conditions.push(eq(events.status, status));
      }

      if (priority) {
        conditions.push(eq(events.priority, priority));
      }

      if (startDate) {
        conditions.push(gte(events.occurredAt, new Date(startDate)));
      }

      if (endDate) {
        conditions.push(lte(events.occurredAt, new Date(endDate)));
      }

      if (search) {
        conditions.push(
          sql`(${events.title} ILIKE ${`%${search}%`} OR ${events.notes} ILIKE ${`%${search}%`})`,
        );
      }

      const eventsList = await db.query.events.findMany({
        where: and(...conditions),
        with: {
          properties: true,
          tags: {
            with: {
              tag: true,
            },
          },
        },
        orderBy: [desc(events.occurredAt)],
        limit,
        offset,
      });

      return eventsList.map((event) => ({
        ...event,
        occurredAt: event.occurredAt.toISOString(),
        ingestedAt: event.ingestedAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        properties:
          event.properties?.map((prop) => ({
            key: prop.key,
            value: prop.value,
          })) || [],
        tags:
          event.tags?.map((et) => ({
            id: et.tag.id,
            name: et.tag.name,
            description: et.tag.description,
            color: et.tag.color,
          })) || [],
      }));
    } catch (error) {
      console.error("Error in getUserEvents:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при получении событий пользователя",
      });
    }
  }

  /**
   * Получить событие по ID
   */
  async getEventById(
    input: GetEventByIdInput,
  ): Promise<EventWithDetails | null> {
    try {
      const { eventId, householdId } = input;

      const event = await db.query.events.findFirst({
        where: and(eq(events.id, eventId), eq(events.householdId, householdId)),
        with: {
          properties: true,
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });

      if (!event) {
        return null;
      }

      return {
        ...event,
        occurredAt: event.occurredAt.toISOString(),
        ingestedAt: event.ingestedAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        properties:
          event.properties?.map((prop) => ({
            key: prop.key,
            value: prop.value,
          })) || [],
        tags:
          event.tags?.map((et) => ({
            id: et.tag.id,
            name: et.tag.name,
            description: et.tag.description,
            color: et.tag.color,
          })) || [],
      };
    } catch (error) {
      console.error("Error in getEventById:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при получении события",
      });
    }
  }

  /**
   * Получить статистику пользователя
   */
  async getUserStats(input: GetUserStatsInput): Promise<UserStats> {
    try {
      const { userId, householdId, startDate, endDate, type } = input;

      const conditions = [eq(events.householdId, householdId)];

      if (userId) {
        conditions.push(eq(events.userId, userId));
      }

      if (type) {
        conditions.push(eq(events.type, type));
      }

      if (startDate) {
        conditions.push(gte(events.occurredAt, new Date(startDate)));
      }

      if (endDate) {
        conditions.push(lte(events.occurredAt, new Date(endDate)));
      }

      const eventsList = await db.query.events.findMany({
        where: and(...conditions),
        columns: {
          type: true,
          status: true,
          amount: true,
          currency: true,
        },
      });

      const total = eventsList.length;
      const byType: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      const byCurrency: Record<string, { totalAmount: number; count: number }> =
        {};

      eventsList.forEach((event) => {
        byType[event.type] = (byType[event.type] || 0) + 1;
        byStatus[event.status] = (byStatus[event.status] || 0) + 1;

        if (event.amount) {
          const amount = parseFloat(event.amount);
          const currency = event.currency || "RUB";

          if (!byCurrency[currency]) {
            byCurrency[currency] = { totalAmount: 0, count: 0 };
          }
          byCurrency[currency].totalAmount += amount;
          byCurrency[currency].count += 1;
        }
      });

      // Вычисляем средние значения для каждой валюты
      const byCurrencyWithAverage = Object.entries(byCurrency).reduce(
        (acc, [currency, data]) => {
          acc[currency] = {
            totalAmount: data.totalAmount,
            averageAmount: data.count > 0 ? data.totalAmount / data.count : 0,
            count: data.count,
          };
          return acc;
        },
        {} as Record<
          string,
          { totalAmount: number; averageAmount: number; count: number }
        >,
      );

      return {
        total,
        byType,
        byStatus,
        byCurrency: byCurrencyWithAverage,
      };
    } catch (error) {
      console.error("Error in getUserStats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при получении статистики пользователя",
      });
    }
  }

  /**
   * Поиск событий по тексту
   */
  async searchEvents(input: SearchEventsInput): Promise<SearchResult> {
    try {
      const { householdId, userId, query, limit = 10, type } = input;

      const conditions = [eq(events.householdId, householdId)];

      if (userId) {
        conditions.push(eq(events.userId, userId));
      }

      if (type) {
        conditions.push(eq(events.type, type));
      }

      conditions.push(
        sql`(${events.title} ILIKE ${`%${query}%`} OR ${events.notes} ILIKE ${`%${query}%`})`,
      );

      // Получаем общее количество событий для пагинации
      const totalCountResult = await db
        .select({ count: count() })
        .from(events)
        .where(and(...conditions));
      const totalCount = totalCountResult[0]?.count || 0;

      const eventsList = await db.query.events.findMany({
        where: and(...conditions),
        with: {
          properties: true,
          tags: {
            with: {
              tag: true,
            },
          },
        },
        orderBy: [desc(events.occurredAt)],
        limit,
      });

      const formattedEvents = eventsList.map((event) => ({
        ...event,
        occurredAt: event.occurredAt.toISOString(),
        ingestedAt: event.ingestedAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        properties:
          event.properties?.map((prop) => ({
            key: prop.key,
            value: prop.value,
          })) || [],
        tags:
          event.tags?.map((et) => ({
            id: et.tag.id,
            name: et.tag.name,
            description: et.tag.description,
            color: et.tag.color,
          })) || [],
      }));

      return {
        events: formattedEvents,
        total: totalCount,
        query,
      };
    } catch (error) {
      console.error("Error in searchEvents:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при поиске событий",
      });
    }
  }

  /**
   * Получить недавние события
   */
  async getRecentEvents(
    input: GetRecentEventsInput,
  ): Promise<EventWithDetails[]> {
    try {
      const { householdId, userId, days = 7, limit = 10 } = input;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const conditions = [
        eq(events.householdId, householdId),
        gte(events.occurredAt, startDate),
      ];

      if (userId) {
        conditions.push(eq(events.userId, userId));
      }

      const eventsList = await db.query.events.findMany({
        where: and(...conditions),
        with: {
          properties: true,
          tags: {
            with: {
              tag: true,
            },
          },
        },
        orderBy: [desc(events.occurredAt)],
        limit,
      });

      return eventsList.map((event) => ({
        ...event,
        occurredAt: event.occurredAt.toISOString(),
        ingestedAt: event.ingestedAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        properties:
          event.properties?.map((prop) => ({
            key: prop.key,
            value: prop.value,
          })) || [],
        tags:
          event.tags?.map((et) => ({
            id: et.tag.id,
            name: et.tag.name,
            description: et.tag.description,
            color: et.tag.color,
          })) || [],
      }));
    } catch (error) {
      console.error("Error in getRecentEvents:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при получении недавних событий",
      });
    }
  }

  /**
   * Получить предстоящие задачи
   */
  async getUpcomingTasks(
    input: GetUpcomingTasksInput,
  ): Promise<EventWithDetails[]> {
    try {
      const { householdId, userId, days = 7, limit = 10 } = input;

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const conditions = [
        eq(events.householdId, householdId),
        eq(events.type, "task"),
        eq(events.status, "active"),
        lte(events.occurredAt, endDate),
        gte(events.occurredAt, new Date()),
      ];

      if (userId) {
        conditions.push(eq(events.userId, userId));
      }

      const eventsList = await db.query.events.findMany({
        where: and(...conditions),
        with: {
          properties: true,
          tags: {
            with: {
              tag: true,
            },
          },
        },
        orderBy: [events.occurredAt],
        limit,
      });

      return eventsList.map((event) => ({
        ...event,
        occurredAt: event.occurredAt.toISOString(),
        ingestedAt: event.ingestedAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        properties:
          event.properties?.map((prop) => ({
            key: prop.key,
            value: prop.value,
          })) || [],
        tags:
          event.tags?.map((et) => ({
            id: et.tag.id,
            name: et.tag.name,
            description: et.tag.description,
            color: et.tag.color,
          })) || [],
      }));
    } catch (error) {
      console.error("Error in getUpcomingTasks:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при получении предстоящих задач",
      });
    }
  }

  /**
   * Получить сводку по расходам
   */
  async getExpenseSummary(
    input: GetExpenseSummaryInput,
  ): Promise<ExpenseSummary> {
    try {
      const {
        householdId,
        userId,
        startDate,
        endDate,
        currency = "RUB",
      } = input;

      const conditions = [
        eq(events.householdId, householdId),
        eq(events.type, "expense"),
        eq(events.currency, currency),
      ];

      if (userId) {
        conditions.push(eq(events.userId, userId));
      }

      if (startDate) {
        conditions.push(gte(events.occurredAt, new Date(startDate)));
      }

      if (endDate) {
        conditions.push(lte(events.occurredAt, new Date(endDate)));
      }

      const eventsList = await db.query.events.findMany({
        where: and(...conditions),
        columns: {
          amount: true,
          title: true,
          type: true,
          occurredAt: true,
        },
      });

      let totalAmount = 0;
      const byType: Record<string, { count: number; amount: number }> = {};
      const byPeriod: Record<string, { count: number; amount: number }> = {};
      const eventTypeAmounts: Record<
        string,
        { amount: number; count: number }
      > = {};

      eventsList.forEach((event) => {
        if (event.amount) {
          const amount = parseFloat(event.amount);
          totalAmount += amount;

          // Группировка по типу события
          const eventType = event.type || "other";
          if (!byType[eventType]) {
            byType[eventType] = { count: 0, amount: 0 };
          }
          byType[eventType].count++;
          byType[eventType].amount += amount;

          // Группировка по периоду (месяц)
          const month = event.occurredAt.toISOString().substring(0, 7); // YYYY-MM
          if (!byPeriod[month]) {
            byPeriod[month] = { count: 0, amount: 0 };
          }
          byPeriod[month].count++;
          byPeriod[month].amount += amount;

          // Для топ типов событий
          if (!eventTypeAmounts[eventType]) {
            eventTypeAmounts[eventType] = { amount: 0, count: 0 };
          }
          eventTypeAmounts[eventType].amount += amount;
          eventTypeAmounts[eventType].count++;
        }
      });

      // Топ типы событий по сумме
      const topCategories = Object.entries(eventTypeAmounts)
        .map(([eventType, data]) => ({
          category: eventType,
          amount: data.amount,
          count: data.count,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      return {
        totalAmount,
        currency,
        byType,
        byPeriod,
        topCategories,
      };
    } catch (error) {
      console.error("Error in getExpenseSummary:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Ошибка при получении сводки по расходам",
      });
    }
  }
}
