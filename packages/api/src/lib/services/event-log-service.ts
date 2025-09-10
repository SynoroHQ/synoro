import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@synoro/db/client";
import { eventLogs } from "@synoro/db/schema";

// Определяем тип на основе схемы eventLogs
export type EventLog = typeof eventLogs.$inferSelect;

export const createEventLogDataSchema = z.object({
  source: z.string().min(1, "Source is required and cannot be empty"),
  chatId: z.string().min(1, "ChatId is required and cannot be empty"),
  type: z.enum(["text", "audio", "image", "video", "file"]),
  text: z.string().min(1).max(10000).optional(),
  originalText: z.string().min(1).max(10000).optional(),
  meta: z.record(z.string(), z.unknown()).nullable().optional(),
});

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

export class EventLogService {
  /**
   * Создать новый лог события
   */
  async createEventLog(data: CreateEventLogData): Promise<EventLog> {
    try {
      const parsedData = createEventLogDataSchema.parse(data);

      const [eventLog] = await db
        .insert(eventLogs)
        .values({
          source: parsedData.source,
          chatId: parsedData.chatId,
          type: parsedData.type,
          text: parsedData.text,
          originalText: parsedData.originalText,
          meta: parsedData.meta,
          status: "pending",
        })
        .returning();

      if (!eventLog) {
        throw new Error("Не удалось создать лог события");
      }

      return eventLog;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        );
      }
      throw error;
    }
  }

  /**
   * Получить лог события по ID
   */
  async getEventLogById(id: string): Promise<EventLog | null> {
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
  ): Promise<EventLog[]> {
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
    newStatus: "pending" | "processing" | "processed" | "failed",
  ): Promise<EventLog | null> {
    // Сначала загружаем текущий лог события
    const currentEventLog = await this.getEventLogById(id);
    if (!currentEventLog) {
      return null;
    }

    const currentStatus = currentEventLog.status;

    // Определяем финальные статусы
    const finalStatuses = ["processed", "failed"] as const;
    const isNewStatusFinal = finalStatuses.includes(newStatus as any);

    // Валидация переходов статусов
    const allowedTransitions: Record<string, string[]> = {
      pending: ["processing", "processed", "failed"],
      processing: ["processed", "failed"],
      processed: [], // Нельзя переходить из processed
      failed: [], // Нельзя переходить из failed
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. ` +
          `Allowed transitions from '${currentStatus}': ${allowedTransitions[currentStatus]?.join(", ") || "none"}`,
      );
    }

    // Обновляем статус и processedAt
    const [eventLog] = await db
      .update(eventLogs)
      .set({
        status: newStatus,
        processedAt: isNewStatusFinal
          ? currentEventLog.processedAt || new Date()
          : null,
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
    // Строим payload условно, чтобы undefined не перезаписывал существующее значение
    const updatePayload: { text: string; originalText?: string } = { text };

    if (originalText !== undefined) {
      updatePayload.originalText = originalText;
    }

    const [eventLog] = await db
      .update(eventLogs)
      .set(updatePayload)
      .where(eq(eventLogs.id, id))
      .returning();

    return eventLog || null;
  }

  /**
   * Обновить метаданные лога события
   * Атомарно сливает новые метаданные с существующими для предотвращения потери данных
   */
  async updateEventLogMeta(
    id: string,
    meta: Record<string, unknown>,
  ): Promise<EventLog | null> {
    try {
      // Используем SQL JSON merge для атомарного слияния
      const [eventLog] = await db
        .update(eventLogs)
        .set({
          meta: sql`${eventLogs.meta} || ${sql.raw(`'${JSON.stringify(meta)}'::jsonb`)}`,
        })
        .where(eq(eventLogs.id, id))
        .returning();

      return eventLog || null;
    } catch (error) {
      // Если SQL merge не поддерживается, используем двухэтапный подход
      console.warn(
        "SQL JSON merge not supported, falling back to client-side merge:",
        error,
      );

      // Этап 1: Получаем текущие метаданные
      const currentEventLog = await this.getEventLogById(id);
      if (!currentEventLog) {
        return null;
      }

      // Этап 2: Сливаем метаданные на клиенте
      const currentMeta = currentEventLog.meta || {};
      const mergedMeta = { ...currentMeta, ...meta };

      // Этап 3: Обновляем с объединенными метаданными
      const [eventLog] = await db
        .update(eventLogs)
        .set({ meta: mergedMeta })
        .where(eq(eventLogs.id, id))
        .returning();

      return eventLog || null;
    }
  }

  /**
   * Удалить лог события
   */
  async deleteEventLog(id: string): Promise<boolean> {
    const result = await db.delete(eventLogs).where(eq(eventLogs.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Получить статистику логов событий
   * Использует SQL агрегатные запросы для эффективного подсчета статистики
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

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Запрос 1: Общий счетчик
    const [totalResult] = await db
      .select({ total: count() })
      .from(eventLogs)
      .where(whereClause);

    // Запрос 2: Группировка по статусу
    const statusResults = await db
      .select({
        status: eventLogs.status,
        count: count(),
      })
      .from(eventLogs)
      .where(whereClause)
      .groupBy(eventLogs.status);

    // Запрос 3: Группировка по типу
    const typeResults = await db
      .select({
        type: eventLogs.type,
        count: count(),
      })
      .from(eventLogs)
      .where(whereClause)
      .groupBy(eventLogs.type);

    // Запрос 4: Группировка по источнику
    const sourceResults = await db
      .select({
        source: eventLogs.source,
        count: count(),
      })
      .from(eventLogs)
      .where(whereClause)
      .groupBy(eventLogs.source);

    // Преобразуем результаты в нужный формат
    const byStatus: Record<string, number> = {};
    statusResults.forEach((row) => {
      byStatus[row.status] = row.count;
    });

    const byType: Record<string, number> = {};
    typeResults.forEach((row) => {
      byType[row.type] = row.count;
    });

    const bySource: Record<string, number> = {};
    sourceResults.forEach((row) => {
      bySource[row.source] = row.count;
    });

    return {
      total: totalResult?.total ?? 0,
      byStatus,
      byType,
      bySource,
    };
  }
}
