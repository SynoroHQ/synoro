import { createId } from "@paralleldrive/cuid2";
import {
  bigint,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { user } from "../auth/schema";
import { households } from "./household";

// Branded types for better type safety
export type FileId = string & { readonly __brand: "FileId" };
export type StorageKeyId = string & { readonly __brand: "StorageKeyId" };
export type UploadedById = string & { readonly __brand: "UploadedById" };
export type HouseholdId = string & { readonly __brand: "HouseholdId" };

// Type helpers for creating branded IDs
export const createFileId = (id: string): FileId => id as FileId;
export const createStorageKeyId = (key: string): StorageKeyId => key as StorageKeyId;
export const createUploadedById = (id: string): UploadedById => id as UploadedById;
export const createHouseholdId = (id: string): HouseholdId => id as HouseholdId;

export const fileType = pgEnum("file_type", [
  // Общие типы
  "image",
  "audio",
  "video",
  "document",
  "pdf",
  "archive",
  "raw",

  // Специфичные типы
  "avatar",
  "receipt",
  "invoice",
  "contract",
  "template",
]);

export const fileStatus = pgEnum("file_status", [
  "uploading",
  "processing",
  "ready",
  "failed",
  "deleted",
]);

/**
 * Универсальная таблица файлов системы
 * Централизованное хранение всех файлов с метаданными
 * Поддерживает различные типы файлов и статусы обработки
 */
export const files = pgTable(
  "files",
  {
    id: text("id").primaryKey().$defaultFn(createId),

    // Основная информация
    name: text("name").notNull(), // оригинальное имя файла
    type: fileType("type").notNull(),
    status: fileStatus("status").notNull().default("ready"),

    // Метаданные
    mime: text("mime"),
    size: bigint("size", { mode: "bigint" }), // размер в байтах
    extension: text("extension"), // расширение файла

    // Хранение
    storageKey: text("storage_key").notNull(), // ключ в S3/объектном хранилище
    storageUrl: text("storage_url"), // прямая ссылка (опционально)
    thumbnailKey: text("thumbnail_key"), // ключ для превью
    thumbnailUrl: text("thumbnail_url"), // ссылка на превью

    // Владелец и контекст
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    householdId: text("household_id").references(() => households.id, {
      onDelete: "cascade",
    }),

    // Дополнительные данные
    meta: jsonb("meta").$type<{
      width?: number; // для изображений
      height?: number;
      duration?: number; // для аудио/видео
      pages?: number; // для документов
      checksum?: string; // контрольная сумма
      [key: string]: unknown;
    } | null>(),

    // Временные метки
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    // Основные индексы
    index("file_type_idx").on(table.type),
    index("file_status_idx").on(table.status),
    index("file_uploaded_by_idx").on(table.uploadedBy),
    index("file_household_idx").on(table.householdId),
    index("file_created_at_idx").on(table.createdAt),

    // Составные индексы
    index("file_type_status_idx").on(table.type, table.status),
    index("file_household_type_idx").on(table.householdId, table.type),

    // Уникальные ограничения
    unique("file_storage_key_uidx").on(table.storageKey),
  ],
);
