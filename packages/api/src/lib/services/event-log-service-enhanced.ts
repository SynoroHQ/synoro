/**
 * Улучшенная версия EventLogService с дополнительными возможностями
 * Включает rate limiting, batch операции и улучшенную обработку ошибок
 */

import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@synoro/db/client";
import { eventLogs } from "@synoro/db/schema";

import {
  EventLogDatabaseError,
  EventLogNotFoundError,
  EventLogRateLimitError,
  EventLogStatusTransitionError,
  EventLogValidationError,
} from "../errors/event-log-errors";
import { safeParseDate } from "../utils/date-helpers";
import {
  sanitizeMetadata,
  sanitizeText,
  validateChatId,
  validateSource,
} from "../utils/text-sanitizer";

// Константы
const RATE_LIMIT = {
  MAX_EVENTS_PER_MINUTE: 60,
  WINDOW_MS: 60000,
  CLEANUP_INTERVAL_MS: 300000, // 5 минут
} as const;

const QUERY_LIMITS = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 1000,
  DEFAULT_OFFSET: 0,
} as const;

const BATCH_LIMITS = {
  MAX_BATCH_SIZE: 100,
} as const;

// Типы
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
  meta?: Record<string, unknown> | null;
}

export interface EventLogFilters {
  source?: string;
  chatId?: string;
  type?: "text" | "audio" | "image" | "video" | "file";
  status?: "pending" | "processing" | "processed" | "failed";
  startDate?: Date;
  endDate?: Date;
}

/**
 * Улучшенный сервис для работы с логами событий
 */
export class EventLogServiceEnhanced {
  private rateLimiter = new Map<string, number[]>();
  private lastCleanup = Date.now();

  /**
   * Создать новый лог события с валидацией и rate limiting
   */
  async createEventLog(data: CreateEventLogData): Promise<EventLog> {
    try {
      // Валидация source
      const sourceValidation = validateSource(data.source);
      if (!sourceValidation.valid) {
        throw new EventLogValidationError(sourceValidation.error!, {
          field: "source",
          value: data.source,
        });
      }

      // Валидация chatId
      const chatIdValidation = validateChatId(data.chatId);
      if (!chatIdValidation.valid) {
        throw new EventLogValidationError(chatIdValidation.error!, {
          field: "chatId",
          value: data.chatId,
        });
      }

      // Проверка rate limit
      this.checkRateLimit(data.source, data.chatId);

      // Санитизация данных
      const sanitizedData = {
        source: data.source,
        chatId: data.chatId,
        type: data.type,
        text: data.text ? sanitizeText(data.text, 10000) : undefined,
        originalText: data.originalText
          ? sanitizeText(data.originalText, 10000)
          : undefined,
        meta: sanitizeMetadata(data.meta),
      };

      // Валидация через Zod
      const parsedData = createEventLogDataSchema.parse(sanitizedData);

      // Вставка в БД
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
        throw new EventLogDatabaseError(
          "insert",
          new Error("No data returned"),
        );
      }

      return eventLog;
    } catch (error) {
      if (
        error instanceof EventLogValidationError ||
        error instanceof EventLogRateLimitError
      ) {
        throw error;
      }

      if (error instanceof z.ZodError) {
        throw new EventLogValidationError(
          `Validation error: ${error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
          { zodError: error.issues },
        );
      }

      throw new EventLogDatabaseError("createEventLog", error);
    }
  }

  /**
   * Создать несколько логов событий за один запрос (batch операция)
   */
  async createEventLogsBatch(
    dataArray: CreateEventLogData[],
  ): Promise<EventLog[]> {
    if (dataArray.length === 0) {
      return [];
    }

    if (dataArray.length > BATCH_LIMITS.MAX_BATCH_SIZE) {
      throw new EventLogValidationError(
        `Batch size exceeds maximum (${BATCH_LIMITS.MAX_BATCH_SIZE})`,
        { provided: dataArray.length, max: BATCH_LIMITS.MAX_BATCH_SIZE },
      );
    }

    try {
      // Валидируем и санитизируем все данные
      const validatedData = dataArray.map((data) => {
        const sourceValidation = validateSource(data.source);
        if (!sourceValidation.valid) {
          throw new EventLogValidationError(sourceValidation.error!, {
            field: "source",
            value: data.source,
          });
        }

        const chatIdValidation = validateChatId(data.chatId);
        if (!chatIdValidation.valid) {
          throw new EventLogValidationError(chatIdValidation.error!, {
            field: "chatId",
            value: data.chatId,
          });
        }

        return createEventLogDataSchema.parse({
          source: data.source,
          chatId: data.chatId,
          type: data.type,
          text: data.text ? sanitizeText(data.text, 10000) : undefined,
          originalText: data.originalText
            ? sanitizeText(data.originalText, 10000)
            : undefined,
          meta: sanitizeMetadata(data.meta),
        });
      });

      // Вставляем все за один запрос
      const eventLogs = await db
        .insert(eventLogs)
        .values(
          validatedData.map((data) => ({
            source: data.source,
            chatId: data.chatId,
            type: data.type,
            text: data.text,
            originalText: data.originalText,
            meta: data.meta,
            status: "pending" as const,
          })),
        )
        .returning();

      return eventLogs;
    } catch (error) {
      if (error instanceof EventLogValidationError) {
        throw error;
      }

      if (error instanceof z.ZodError) {
        throw new EventLogValidationError(
          `Batch validation error: ${error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
          { zodError: error.issues },
        );
      }

      throw new EventLogDatabaseError("createEventLogsBatch", error);
    }
  }

  /**
   * Получить лог события по ID
   */
  async getEventLogById(id: string): Promise<EventLog> {
    try {
      const [eventLog] = await db
        .select()
        .from(eventLogs)
        .where(eq(eventLogs.id, id))
        .limit(1);

      if (!eventLog) {
        throw new EventLogNotFoundError(id);
      }

      return eventLog;
    } catch (error) {
      if (error instanceof EventLogNotFoundError) {
        throw error;
      }
      throw new EventLogDatabaseError("getEventLogById", error);
    }
  }

  /**
   * Получить последние логи для чата
   */
  async getRecentEventLogsForChat(
    chatId: string,
    limit: number = 20,
  ): Promise<EventLog[]> {
    try {
      const chatIdValidation = validateChatId(chatId);
      if (!chatIdValidation.valid) {
        throw new EventLogValidationError(chatIdValidation.error!, {
          field: "chatId",
          value: chatId,
        });
      }

      const safeLimit = Math.min(Math.max(1, limit), QUERY_LIMITS.MAX_LIMIT);

      return await db
        .select()
        .from(eventLogs)
        .where(eq(eventLogs.chatId, chatId))
        .orderBy(desc(eventLogs.createdAt))
        .limit(safeLimit);
    } catch (error) {
      if (error instanceof EventLogValidationError) {
        throw error;
      }
      throw new EventLogDatabaseError("getRecentEventLogsForChat", error);
    }
  }

  /**
   * Удалить старые логи событий
   */
  async cleanupOldEventLogs(
    olderThanDays: number = 90,
    status?: "processed" | "failed",
  ): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const conditions = [lte(eventLogs.createdAt, cutoffDate)];

      if (status) {
        conditions.push(eq(eventLogs.status, status));
      }

      const result = await db.delete(eventLogs).where(and(...conditions));

      const deletedCount = result.rowCount ?? 0;
      console.log(
        `Cleaned up ${deletedCount} old event logs (older than ${olderThanDays} days)`,
      );

      return deletedCount;
    } catch (error) {
      throw new EventLogDatabaseError("cleanupOldEventLogs", error);
    }
  }

  /**
   * Обновить статус лога события с валидацией переходов
   */
  async updateEventLogStatus(
    id: string,
    newStatus: "pending" | "processing" | "processed" | "failed",
  ): Promise<EventLog> {
    try {
      const currentEventLog = await this.getEventLogById(id);
      const currentStatus = currentEventLog.status;

      // Валидация переходов статусов
      const allowedTransitions: Record<string, string[]> = {
        pending: ["processing", "processed", "failed"],
        processing: ["processed", "failed"],
        processed: [],
        failed: [],
      };

      const allowed = allowedTransitions[currentStatus] || [];
      if (!allowed.includes(newStatus)) {
        throw new EventLogStatusTransitionError(
          currentStatus,
          newStatus,
          allowed,
        );
      }

      // Определяем финальные статусы
      const finalStatuses = ["processed", "failed"] as const;
      const isNewStatusFinal = finalStatuses.includes(newStatus as any);

      // Обновляем статус
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

      if (!eventLog) {
        throw new EventLogDatabaseError(
          "updateEventLogStatus",
          new Error("No data returned after update"),
        );
      }

      return eventLog;
    } catch (error) {
      if (
        error instanceof EventLogNotFoundError ||
        error instanceof EventLogStatusTransitionError
      ) {
        throw error;
      }
      throw new EventLogDatabaseError("updateEventLogStatus", error);
    }
  }

  /**
   * Проверка rate limit для предотвращения спама
   */
  private checkRateLimit(source: string, chatId: string): void {
    const key = `${source}:${chatId}`;
    const now = Date.now();

    // Периодическая очистка старых записей
    if (now - this.lastCleanup > RATE_LIMIT.CLEANUP_INTERVAL_MS) {
      this.cleanupRateLimiter();
      this.lastCleanup = now;
    }

    // Получаем временные метки для этого ключа
    const timestamps = this.rateLimiter.get(key) || [];

    // Фильтруем только недавние события (в пределах окна)
    const recentTimestamps = timestamps.filter(
      (t) => now - t < RATE_LIMIT.WINDOW_MS,
    );

    // Проверяем лимит
    if (recentTimestamps.length >= RATE_LIMIT.MAX_EVENTS_PER_MINUTE) {
      throw new EventLogRateLimitError(
        source,
        chatId,
        RATE_LIMIT.MAX_EVENTS_PER_MINUTE,
      );
    }

    // Добавляем текущую временную метку
    recentTimestamps.push(now);
    this.rateLimiter.set(key, recentTimestamps);
  }

  /**
   * Очистка старых записей rate limiter
   */
  private cleanupRateLimiter(): void {
    const now = Date.now();
    for (const [key, timestamps] of this.rateLimiter.entries()) {
      const recentTimestamps = timestamps.filter(
        (t) => now - t < RATE_LIMIT.WINDOW_MS,
      );
      if (recentTimestamps.length === 0) {
        this.rateLimiter.delete(key);
      } else {
        this.rateLimiter.set(key, recentTimestamps);
      }
    }
  }

  /**
   * Получить статистику rate limiter (для мониторинга)
   */
  getRateLimiterStats(): {
    totalKeys: number;
    topSources: Array<{ key: string; count: number }>;
  } {
    const stats = Array.from(this.rateLimiter.entries())
      .map(([key, timestamps]) => ({
        key,
        count: timestamps.length,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalKeys: this.rateLimiter.size,
      topSources: stats.slice(0, 10),
    };
  }
}
