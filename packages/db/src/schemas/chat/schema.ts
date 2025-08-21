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

export const conversation = pgTable(
  "conversation",
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
  (table) => ({
    ownerUserIdx: index("conversation_owner_user_idx").on(table.ownerUserId),
    channelIdx: index("conversation_channel_idx").on(table.channel),
    statusIdx: index("conversation_status_idx").on(table.status),
    lastMessageIdx: index("conversation_last_message_idx").on(
      table.lastMessageAt,
    ),
  }),
);

export const message = pgTable(
  "message",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    role: messageRole("role").notNull(),
    content: jsonb("content").$type<Record<string, unknown>>().notNull(),
    model: text("model"),
    status: text("status").default("completed").notNull(),
    parentId: text("parent_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    conversationIdx: index("message_conversation_idx").on(table.conversationId),
    roleIdx: index("message_role_idx").on(table.role),
    statusIdx: index("message_status_idx").on(table.status),
    parentIdx: index("message_parent_idx").on(table.parentId),
    createdAtIdx: index("message_created_at_idx").on(table.createdAt),
    conversationCreatedIdx: index("message_conversation_created_idx").on(
      table.conversationId,
      table.createdAt,
    ),
  }),
);

export const messageAttachment = pgTable(
  "message_attachment",
  (t) => ({
    id: text("id").primaryKey().$defaultFn(createId),
    messageId: t
      .text("message_id")
      .notNull()
      .references(() => message.id, { onDelete: "cascade" }),
    key: t.text("key").notNull(),
    mime: t.text("mime"),
    size: integer("size"),
    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }),
  (table) => ({
    messageIdx: index("message_attachment_message_idx").on(table.messageId),
    keyIdx: index("message_attachment_key_idx").on(table.key),
  }),
);

export const identityLink = pgTable(
  "identity_link",
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
  (table) => ({
    uniqueProviderUser: unique().on(table.provider, table.providerUserId),
    uniqueUserProvider: unique().on(table.userId, table.provider),
    userIdx: index("identity_link_user_idx").on(table.userId),
    providerIdx: index("identity_link_provider_idx").on(table.provider),
  }),
);
