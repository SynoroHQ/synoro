import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { users } from "../auth/schema";

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
 * Все пользователи теперь зарегистрированы в системе
 */
export const conversations = pgTable(
  "conversations",
  (t) => ({
    id: text("id").primaryKey().$defaultFn(createId),
    ownerUserId: t
      .text("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
    // Индекс для пользователей
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
    parentId: text("parent_id"), // самоссылка для иерархии сообщений
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Composite foreign key: (parent_id, conversation_id) → (id, conversation_id)
    foreignKey({
      columns: [table.parentId, table.conversationId],
      foreignColumns: [table.id, table.conversationId],
      name: "message_parent_conversation_fk",
    }).onDelete("set null"),

    // Unique constraint on (id, conversation_id) for composite FK target
    unique("message_id_conversation_unique").on(table.id, table.conversationId),

    // Check constraint to prevent self-links
    check(
      "message_no_self_link",
      sql`${table.parentId} IS NULL OR ${table.parentId} != ${table.id}`,
    ),

    // Indexes
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
      .references(() => users.id, { onDelete: "cascade" }),
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
