import { createId } from "@paralleldrive/cuid2";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const logType = pgEnum("log_type", [
  "text",
  "audio",
  "image",
  "video",
  "file",
]);

export const logStatus = pgEnum("log_status", [
  "pending",
  "processing",
  "processed",
  "failed",
]);

export const eventLog = pgTable(
  "event_log",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    source: text("source").notNull(), // 'telegram', 'web', 'mobile', 'api'
    chatId: text("chat_id").notNull(), // идентификатор чата/канала
    type: logType("type").notNull(),
    status: logStatus("status").notNull().default("pending"),
    text: text("text"), // сообщение или расшифровка
    originalText: text("original_text"), // оригинальный текст до обработки
    processedAt: timestamp("processed_at", { withTimezone: true }),
    meta: jsonb("meta").$type<{
      messageId?: string;
      userId?: string;
      fileUrl?: string;
      fileSize?: number;
      duration?: number; // для аудио/видео
      transcriptionConfidence?: number;
      [key: string]: unknown;
    } | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    sourceIdx: index("event_log_source_idx").on(table.source),
    chatIdx: index("event_log_chat_idx").on(table.chatId),
    typeIdx: index("event_log_type_idx").on(table.type),
    statusIdx: index("event_log_status_idx").on(table.status),
    createdAtIdx: index("event_log_created_at_idx").on(table.createdAt),
    sourceChatIdx: index("event_log_source_chat_idx").on(
      table.source,
      table.chatId,
    ),
  }),
);
