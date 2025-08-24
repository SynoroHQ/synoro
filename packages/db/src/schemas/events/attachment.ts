import { createId } from "@paralleldrive/cuid2";
import {
  bigint,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { files } from "../core/files";
import { households } from "../core/household";
import { events } from "./event";

export const attachmentType = pgEnum("attachment_type", [
  "image",
  "audio",
  "video",
  "pdf",
  "document",
  "receipt",
  "raw",
]);

/**
 * Таблица вложений к событиям
 * Хранит файлы, изображения, документы и другие медиа
 * Поддерживает различные типы файлов с метаданными и URL для хранения
 *
 * @deprecated Используйте новую систему files + fileRelations
 * Эта таблица оставлена для обратной совместимости
 */
export const attachments = pgTable(
  "attachments",
  {
    id: text("id").primaryKey().$defaultFn(createId),

    // Связь с новой системой файлов
    fileId: text("file_id").references(() => files.id, { onDelete: "cascade" }),

    // Существующие поля для обратной совместимости
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    eventId: text("event_id").references(() => events.id, {
      onDelete: "set null",
    }),
    type: attachmentType("type").notNull(),
    mime: text("mime"),
    filename: text("filename"), // оригинальное имя файла
    size: bigint("size", { mode: "bigint" }), // размер в байтах
    storageUrl: text("storage_url").notNull(),
    thumbnailUrl: text("thumbnail_url"), // для изображений/видео
    meta: jsonb("meta").$type<Record<string, unknown> | null>(),

    // Новые поля для миграции
    migratedToFiles: text("migrated_to_files").default("false"), // флаг миграции

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Существующие индексы
    index("attachment_household_idx").on(table.householdId),
    index("attachment_event_idx").on(table.eventId),
    index("attachment_type_idx").on(table.type),
    index("attachment_created_at_idx").on(table.createdAt),

    // Новые индексы для связи с files
    index("attachment_file_idx").on(table.fileId),
    index("attachment_migrated_idx").on(table.migratedToFiles),
  ],
);
