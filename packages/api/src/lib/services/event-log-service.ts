import { and, desc, eq, gte, lte } from "drizzle-orm";

import type { EventLog } from "@synoro/db/schema";
import { db } from "@synoro/db/client";
import { eventLogs } from "@synoro/db/schema";

export interface CreateEventLogData {
  source: string;
  chatId: string;
  type: "text" | "audio" | "image" | "video" | "file";
  text?: string;
  originalText?: string;
  meta?: {
    messageId?: string;
    userId?: string;
    fileUrl?: string;
    fileSize?: number;
    duration?: number;
    transcriptionConfidence?: number;
    [key: string]: unknown;
  };
}

export interface EventLogFilters {
  source?: string;
  chatId?: string;
  type?: "text" | "audio" | "image" | "video" | "file";
  status?: "pending" | "processing" | "processed" | "failed";
  startDate?: Date;
  endDate?: Date;
}

export interface EventLogWithDetails extends EventLog {
  id: string;
  // Дополнительные поля при необходимости
}

export class EventLogService {
  /**
   * Создать новый лог события
   */
  async createEventLog(data: CreateEventLogData): Promise<EventLog> {
    const [eventLog] = await db
      .insert(eventLogs)
      .values({
        source: data.source,
        chatId: data.chatId,
        type: data.type,
        text: data.text,
        originalText: data.originalText,
        meta: data.meta,
        status: "pending",
      })
      .returning();

    if (!eventLog) {
      throw new Error("Не удалось создать лог события");
    }

    return eventLog;
  }

  /**
   * Получить лог события по ID
   */
  async getEventLogById(id: string): Promise<EventLogWithDetails | null> {
    const [eventLog] = await db
      .select()
      .from(eventLogs)
      .where(eq(eventLogs.id, id))
      .limit(1);

    return eventLog || null;
  }

  /**
   * Получить логи событий с фильтрацией
   */
  async getEventLogs(
    filters: EventLogFilters = {},
    options: {
      limit?: number;
      offset?: number;
      orderBy?: "createdAt" | "processedAt";
      orderDirection?: "asc" | "desc";
    } = {},
  ): Promise<EventLogWithDetails[]> {
    const {
      limit = 50,
      offset = 0,
      orderBy = "createdAt",
      orderDirection = "desc",
    } = options;

    const conditions = [];

    if (filters.source) {
      conditions.push(eq(eventLogs.source, filters.source));
    }

    if (filters.chatId) {
      conditions.push(eq(eventLogs.chatId, filters.chatId));
    }

    if (filters.type) {
      conditions.push(eq(eventLogs.type, filters.type));
    }

    if (filters.status) {
      conditions.push(eq(eventLogs.status, filters.status));
    }

    if (filters.startDate) {
      conditions.push(gte(eventLogs.createdAt, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(eventLogs.createdAt, filters.endDate));
    }

    const orderColumn =
      orderBy === "processedAt" ? eventLogs.processedAt : eventLogs.createdAt;
    const orderDirection_ = orderDirection === "asc" ? "asc" : "desc";

    const eventLogsList = await db
      .select()
      .from(eventLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderDirection_ === "desc" ? desc(orderColumn) : orderColumn)
      .limit(limit)
      .offset(offset);

    return eventLogsList;
  }

  /**
   * Обновить статус лога события
   */
  async updateEventLogStatus(
    id: string,
    status: "pending" | "processing" | "processed" | "failed",
    processedAt?: Date,
  ): Promise<EventLog | null> {
    const [eventLog] = await db
      .update(eventLogs)
      .set({
        status,
        processedAt: processedAt || new Date(),
      })
      .where(eq(eventLogs.id, id))
      .returning();

    return eventLog || null;
  }

  /**
   * Обновить текст лога события
   */
  async updateEventLogText(
    id: string,
    text: string,
    originalText?: string,
  ): Promise<EventLog | null> {
    const [eventLog] = await db
      .update(eventLogs)
      .set({
        text,
        originalText,
      })
      .where(eq(eventLogs.id, id))
      .returning();

    return eventLog || null;
  }

  /**
   * Обновить метаданные лога события
   */
  async updateEventLogMeta(
    id: string,
    meta: Record<string, unknown>,
  ): Promise<EventLog | null> {
    const [eventLog] = await db
      .update(eventLogs)
      .set({ meta })
      .where(eq(eventLogs.id, id))
      .returning();

    return eventLog || null;
  }

  /**
   * Удалить лог события
   */
  async deleteEventLog(id: string): Promise<boolean> {
    const result = await db.delete(eventLogs).where(eq(eventLogs.id, id));

    return result.rowCount > 0;
  }

  /**
   * Получить статистику логов событий
   */
  async getEventLogStats(filters: EventLogFilters = {}): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    bySource: Record<string, number>;
  }> {
    const conditions = [];

    if (filters.source) {
      conditions.push(eq(eventLogs.source, filters.source));
    }

    if (filters.chatId) {
      conditions.push(eq(eventLogs.chatId, filters.chatId));
    }

    if (filters.type) {
      conditions.push(eq(eventLogs.type, filters.type));
    }

    if (filters.status) {
      conditions.push(eq(eventLogs.status, filters.status));
    }

    if (filters.startDate) {
      conditions.push(gte(eventLogs.createdAt, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(eventLogs.createdAt, filters.endDate));
    }

    const allLogs = await db
      .select()
      .from(eventLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const stats = {
      total: allLogs.length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
    };

    for (const log of allLogs) {
      stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
      stats.bySource[log.source] = (stats.bySource[log.source] || 0) + 1;
    }

    return stats;
  }
}
