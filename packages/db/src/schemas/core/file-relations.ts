import { createId } from "@paralleldrive/cuid2";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { files } from "./files";

export const entityType = pgEnum("entity_type", [
  // Основные сущности
  "event",
  "message",
  "user_profile",
  "household",

  // Дополнительные сущности
  "task",
  "receipt",
  "document",
  "template",
  "report",
]);

// Export enum value type for strict typing
export type EntityType = (typeof entityType.enumValues)[number];

/**
 * Таблица связей файлов с сущностями системы
 * Позволяет привязывать файлы к различным объектам
 * Поддерживает множественные файлы для одной сущности
 */
export const fileRelations = pgTable(
  "file_relations",
  {
    id: text("id").primaryKey().$defaultFn(createId),

    // Связь с файлом
    fileId: text("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),

    // Связь с сущностью
    entityType: entityType("entity_type").notNull(),
    entityId: text("entity_id").notNull(),

    // Контекст связи
    role: text("role"), // например: "main", "thumbnail", "attachment", "preview"
    order: integer("order"), // порядок файлов для сущности

    // Метаданные связи
    meta: jsonb("meta").$type<Record<string, unknown> | null>(), // дополнительные данные о связи

    // Временные метки
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Основные индексы
    index("file_relation_file_idx").on(table.fileId),
    index("file_relation_entity_type_idx").on(table.entityType),
    index("file_relation_entity_id_idx").on(table.entityId),
    index("file_relation_role_idx").on(table.role),
    index("file_relation_created_at_idx").on(table.createdAt),

    // Составные индексы
    index("file_relation_entity_idx").on(table.entityType, table.entityId),
    index("file_relation_file_entity_idx").on(
      table.fileId,
      table.entityType,
      table.entityId,
    ),

    // Уникальные ограничения
    unique("file_relation_file_entity_role_uidx").on(
      table.fileId,
      table.entityType,
      table.entityId,
      table.role,
    ),
  ],
);
