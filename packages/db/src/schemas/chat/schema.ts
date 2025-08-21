import { createId } from "@paralleldrive/cuid2";
import { jsonb, integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { user } from "../auth/schema";

export const chatChannel = pgEnum("chat_channel", ["telegram", "web", "mobile"]);
export const messageRole = pgEnum("message_role", ["system", "user", "assistant", "tool"]);

export const conversation = pgTable("conversation", (t) => ({
  id: text("id").primaryKey().$defaultFn(createId),
  ownerUserId: t
    .text("owner_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  channel: chatChannel("channel").notNull(),
  title: t.text("title"),
  status: t.text("status").default("active").notNull(),
  createdAt: t.timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: t.timestamp("updated_at", { withTimezone: true }).notNull(),
  lastMessageAt: t.timestamp("last_message_at", { withTimezone: true }),
}));

export const message = pgTable("message", (t) => ({
  id: text("id").primaryKey().$defaultFn(createId),
  conversationId: t
    .text("conversation_id")
    .notNull()
    .references(() => conversation.id, { onDelete: "cascade" }),
  role: messageRole("role").notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull(),
  model: t.text("model"),
  status: t.text("status").default("completed").notNull(),
  parentId: t
    .text("parent_id")
    .references(() => message.id, { onDelete: "set null" }),
  createdAt: t.timestamp("created_at", { withTimezone: true }).notNull(),
}));

export const messageAttachment = pgTable("message_attachment", (t) => ({
  id: text("id").primaryKey().$defaultFn(createId),
  messageId: t
    .text("message_id")
    .notNull()
    .references(() => message.id, { onDelete: "cascade" }),
  key: t.text("key").notNull(),
  mime: t.text("mime"),
  size: integer("size"),
  createdAt: t.timestamp("created_at", { withTimezone: true }).notNull(),
}));

export const identityLink = pgTable("identity_link", (t) => ({
  id: text("id").primaryKey().$defaultFn(createId),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  provider: t.text("provider").notNull(), // e.g. 'telegram'
  providerUserId: t.text("provider_user_id").notNull(), // e.g. chat_id
  createdAt: t.timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: t.timestamp("updated_at", { withTimezone: true }).notNull(),
}));
