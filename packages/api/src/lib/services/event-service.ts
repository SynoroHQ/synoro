import type { z } from "zod";
import { and, eq, gte, lte, sql } from "drizzle-orm";

import type { EventCategory } from "@synoro/validators";
import { db } from "@synoro/db/client";
import { eventProperties, events, eventTags, tags } from "@synoro/db/schema";

type Event = typeof events.$inferSelect;
type EventProperty = typeof eventProperties.$inferSelect;
type Tag = typeof tags.$inferSelect;

export interface CreateEventData {
  householdId: string;
  userId?: string;
  source: "telegram" | "web" | "mobile" | "api";
  type: z.infer<typeof EventCategory>;
  title?: string;
  notes?: string;
  amount?: number;
  currency?: string;
  occurredAt: Date;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "active" | "archived" | "deleted";
  data?: Record<string, unknown>;
  tags?: string[];
  properties?: Record<string, unknown>;
}

export interface EventFilters {
  householdId: string;
  userId?: string;
  type?: string;
  status?: string;
  priority?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  tags?: string[];
  search?: string;
}

export interface EventWithDetails {
  id: string;
  householdId: string;
  userId: string | null;
  source: "telegram" | "web" | "mobile" | "api";
  type: z.infer<typeof EventCategory>;
  status: "active" | "archived" | "deleted";
  priority: "low" | "medium" | "high" | "urgent";
  occurredAt: Date;
  ingestedAt: Date;
  updatedAt: Date;
  title: string | null;
  notes: string | null;
  amount: string | null;
  currency: string;
  data: Record<string, unknown> | null;
  properties: EventProperty[];
  tags: Tag[];
  assets?: {
    id: string;
    name: string;
    type: string;
    status: string;
  }[];
}

export class EventService {
  /**
   * Создать новое событие
   */
  async createEvent(data: CreateEventData): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values({
        householdId: data.householdId,
        userId: data.userId,
        source: data.source,
        type: data.type,
        title: data.title,
        notes: data.notes,
        amount: data.amount ? data.amount.toString() : null,
        currency: data.currency ?? "RUB",
        occurredAt: data.occurredAt,
        priority: data.priority ?? "medium",
        status: data.status ?? "active",
        data: data.data,
      })
      .returning();

    if (!event) {
      throw new Error("Не удалось создать событие");
    }

    // Добавляем свойства события
    if (data.properties && Object.keys(data.properties).length > 0) {
      await this.addEventProperties(event.id, data.properties);
    }

    // Добавляем теги события
    if (data.tags && data.tags.length > 0) {
      await this.addEventTags(event.id, data.tags, data.householdId);
    }

    return event;
  }

  /**
   * Получить событие по ID
   */
  async getEventById(
    id: string,
    householdId: string,
  ): Promise<EventWithDetails | null> {
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.householdId, householdId)),
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
      properties: event.properties ?? [],
      tags: event.tags?.map((et) => et.tag) ?? [],
    };
  }

  /**
   * Получить события с фильтрацией
   */
  async getEvents(
    filters: EventFilters,
    options: {
      limit?: number;
      offset?: number;
      orderBy?: "occurredAt" | "createdAt" | "amount";
      orderDirection?: "asc" | "desc";
    } = {},
  ): Promise<EventWithDetails[]> {
    const {
      limit = 50,
      offset = 0,
      orderBy = "occurredAt",
      orderDirection = "desc",
    } = options;

    const conditions = [eq(events.householdId, filters.householdId)];

    if (filters.userId) {
      conditions.push(eq(events.userId, filters.userId));
    }

    if (filters.type) {
      conditions.push(
        eq(events.type, filters.type as z.infer<typeof EventCategory>),
      );
    }

    if (filters.status) {
      conditions.push(
        eq(events.status, filters.status as "active" | "archived" | "deleted"),
      );
    }

    if (filters.priority) {
      conditions.push(
        eq(
          events.priority,
          filters.priority as "low" | "medium" | "high" | "urgent",
        ),
      );
    }

    if (filters.startDate) {
      conditions.push(gte(events.occurredAt, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(events.occurredAt, filters.endDate));
    }

    if (filters.minAmount !== undefined) {
      conditions.push(gte(events.amount, filters.minAmount.toString()));
    }

    if (filters.maxAmount !== undefined) {
      conditions.push(lte(events.amount, filters.maxAmount.toString()));
    }

    if (filters.currency) {
      conditions.push(eq(events.currency, filters.currency));
    }

    if (filters.search) {
      conditions.push(
        sql`(${events.title} ILIKE ${`%${filters.search}%`} OR ${events.notes} ILIKE ${`%${filters.search}%`})`,
      );
    }

    const orderByField =
      orderBy === "createdAt"
        ? events.ingestedAt
        : orderBy === "amount"
          ? events.amount
          : events.occurredAt;

    const orderDirectionFn =
      orderDirection === "asc"
        ? sql`${orderByField} ASC`
        : sql`${orderByField} DESC`;

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
      orderBy: [orderDirectionFn],
      limit,
      offset,
    });

    return eventsList.map((event) => ({
      ...event,
      properties: event.properties ?? [],
      tags: event.tags?.map((et) => et.tag) ?? [],
    }));
  }

  /**
   * Обновить событие
   */
  async updateEvent(
    id: string,
    householdId: string,
    updates: Partial<CreateEventData>,
  ): Promise<Event | null> {
    const [event] = await db
      .update(events)
      .set({
        ...updates,
        amount: updates.amount ? updates.amount.toString() : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(events.id, id), eq(events.householdId, householdId)))
      .returning();

    if (!event) {
      return null;
    }

    // Обновляем свойства если они предоставлены
    if (updates.properties) {
      await this.updateEventProperties(id, updates.properties);
    }

    // Обновляем теги если они предоставлены
    if (updates.tags) {
      await this.updateEventTags(id, updates.tags, householdId);
    }

    return event;
  }

  /**
   * Удалить событие (мягкое удаление)
   */
  async deleteEvent(id: string, householdId: string): Promise<boolean> {
    const [event] = await db
      .update(events)
      .set({
        status: "deleted",
        updatedAt: new Date(),
      })
      .where(and(eq(events.id, id), eq(events.householdId, householdId)))
      .returning();

    return !!event;
  }

  /**
   * Получить статистику событий
   */
  async getEventStats(
    householdId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      type?: string;
    } = {},
  ): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    totalAmount: number;
    averageAmount: number;
  }> {
    const conditions = [eq(events.householdId, householdId)];

    if (filters.startDate) {
      conditions.push(gte(events.occurredAt, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(events.occurredAt, filters.endDate));
    }

    if (filters.type) {
      conditions.push(
        eq(events.type, filters.type as z.infer<typeof EventCategory>),
      );
    }

    const eventsList = await db.query.events.findMany({
      where: and(...conditions),
      columns: {
        type: true,
        status: true,
        amount: true,
      },
    });

    const total = eventsList.length;
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalAmount = 0;
    let amountCount = 0;

    eventsList.forEach((event) => {
      byType[event.type] = (byType[event.type] ?? 0) + 1;
      byStatus[event.status] = (byStatus[event.status] ?? 0) + 1;

      if (event.amount) {
        totalAmount += parseFloat(event.amount);
        amountCount++;
      }
    });

    return {
      total,
      byType,
      byStatus,
      totalAmount,
      averageAmount: amountCount > 0 ? totalAmount / amountCount : 0,
    };
  }

  /**
   * Добавить свойства к событию
   */
  private async addEventProperties(
    eventId: string,
    properties: Record<string, unknown>,
  ): Promise<void> {
    const propertyEntries = Object.entries(properties).map(([key, value]) => ({
      eventId,
      key,
      value: value as string | number | boolean | null,
    }));

    await db.insert(eventProperties).values(propertyEntries);
  }

  /**
   * Обновить свойства события
   */
  private async updateEventProperties(
    eventId: string,
    properties: Record<string, unknown>,
  ): Promise<void> {
    // Удаляем старые свойства
    await db
      .delete(eventProperties)
      .where(eq(eventProperties.eventId, eventId));

    // Добавляем новые
    await this.addEventProperties(eventId, properties);
  }

  /**
   * Добавить теги к событию
   */
  private async addEventTags(
    eventId: string,
    tagNames: string[],
    householdId: string,
  ): Promise<void> {
    // Получаем или создаем теги
    const tagIds: string[] = [];

    for (const tagName of tagNames) {
      let tag = await db.query.tags.findFirst({
        where: and(eq(tags.name, tagName), eq(tags.householdId, householdId)),
      });

      if (!tag) {
        const [newTag] = await db
          .insert(tags)
          .values({
            name: tagName,
            householdId,
          })
          .returning();
        tag = newTag;
      }

      if (tag) {
        tagIds.push(tag.id);
      }
    }

    // Связываем теги с событием
    const eventTagEntries = tagIds.map((tagId) => ({
      eventId,
      tagId,
    }));

    await db.insert(eventTags).values(eventTagEntries);
  }

  /**
   * Обновить теги события
   */
  private async updateEventTags(
    eventId: string,
    tagNames: string[],
    householdId: string,
  ): Promise<void> {
    // Удаляем старые связи
    await db.delete(eventTags).where(eq(eventTags.eventId, eventId));

    // Добавляем новые
    await this.addEventTags(eventId, tagNames, householdId);
  }
}
