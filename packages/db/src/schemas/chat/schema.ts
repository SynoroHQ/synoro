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

import { user } from "../auth/schema";
import { files } from "../core/files";

export const chatChannel = pgEnum("chat_channel", [
  "telegram",
  "web",
  "mobile",
]);
export const messageRole = pgEnum("message_role", [
  "system",
  "user",
  "assistant",
  "tool",
]);

/**
 * Таблица диалогов/бесед между пользователями и AI
 * Хранит метаданные о беседах: владелец, канал, статус, заголовок
 */
export const conversations = pgTable(
  "conversations",
  (t) => ({
    id: text("id").primaryKey().$defaultFn(createId),
    ownerUserId: t
      .text("owner_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    channel: chatChannel("channel").notNull(),
    title: t.text("title"),
    status: t.text("status").default("active").notNull(),
    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: t
      .timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    lastMessageAt: t.timestamp("last_message_at", { withTimezone: true }),
  }),
  (table) => [
    index("conversation_owner_user_idx").on(table.ownerUserId),
    index("conversation_channel_idx").on(table.channel),
    index("conversation_status_idx").on(table.status),
    index("conversation_last_message_idx").on(table.lastMessageAt),
  ],
);

/**
 * Таблица сообщений в диалогах
 * Хранит все сообщения пользователей и AI с поддержкой иерархии (parent-child)
 */
export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: messageRole("role").notNull(),
    content: jsonb("content").$type<Record<string, unknown>>().notNull(),
    model: text("model"),
    status: text("status").default("completed").notNull(),
    parentId: text("parent_id"), // самоссылка, FK добавляется через миграцию для ссылочной целостности
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("message_conversation_idx").on(table.conversationId),
    index("message_role_idx").on(table.role),
    index("message_status_idx").on(table.status),
    index("message_parent_idx").on(table.parentId),
    index("message_created_at_idx").on(table.createdAt),
    index("message_conversation_created_idx").on(
      table.conversationId,
      table.createdAt,
    ),
  ],
);

/**
 * Таблица вложений к сообщениям
 * Хранит файлы, изображения и другие медиа, прикрепленные к сообщениям
 * 
 * @deprecated Используйте новую систему files + fileRelations
 * Эта таблица оставлена для обратной совместимости
 */
export const messageAttachments = pgTable(
  "message_attachments",
  (t) => ({
    id: text("id").primaryKey().$defaultFn(createId),
    
    // Связь с новой системой файлов
    fileId: t.text("file_id").references(() => files.id, { onDelete: "cascade" }),
    
    // Существующие поля для обратной совместимости
    messageId: t
      .text("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    key: t.text("key").notNull(),
    mime: t.text("mime"),
    size: integer("size"),
    
    // Новые поля для миграции
    migratedToFiles: t.text("migrated_to_files").default("false"), // флаг миграции
    
    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: t
      .timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  }),
  (table) => [
    // Существующие индексы
    index("message_attachment_message_idx").on(table.messageId),
    index("message_attachment_key_idx").on(table.key),
    unique("message_attachment_message_key_uidx").on(
      table.messageId,
      table.key,
    ),
    
    // Новые индексы для связи с files
    index("message_attachment_file_idx").on(table.fileId),
    index("message_attachment_migrated_idx").on(table.migratedToFiles),
  ],
);

/**
 * Таблица связей пользователей с внешними провайдерами
 * Связывает внутренних пользователей с Telegram, Discord и другими платформами
 */
export const identityLinks = pgTable(
  "identity_links",
  (t) => ({
    id: text("id").primaryKey().$defaultFn(createId),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: t.text("provider").notNull(), // e.g. 'telegram'
    providerUserId: t.text("provider_user_id").notNull(), // e.g. chat_id
    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: t
      .timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  }),
  (table) => [
    unique().on(table.provider, table.providerUserId),
    unique().on(table.userId, table.provider),
    index("identity_link_user_idx").on(table.userId),
    index("identity_link_provider_idx").on(table.provider),
  ],
);
