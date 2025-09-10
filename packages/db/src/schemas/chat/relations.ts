import { relations } from "drizzle-orm";

import { users } from "../auth/schema";
import { files } from "../core/files";
import { conversations, identityLinks, messages } from "./schema";

// Relations for conversation
export const conversationRelations = relations(
  conversations,
  ({ one, many }) => ({
    // Владелец может быть опциональным для анонимных пользователей
    owner: one(users, {
      fields: [conversations.ownerUserId],
      references: [users.id],
    }),
    messages: many(messages),
  }),
);

// Relations for message
export const messageRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  parent: one(messages, {
    fields: [messages.parentId],
    references: [messages.id],
    relationName: "messageThread",
  }),
  children: many(messages, {
    relationName: "messageThread",
  }),
}));

// Relations for identityLink
export const identityLinkRelations = relations(identityLinks, ({ one }) => ({
  user: one(users, {
    fields: [identityLinks.userId],
    references: [users.id],
  }),
}));

// Relations for user (from auth schema) - merged into main user relations
// export const userChatRelations = relations(users, ({ many }) => ({
//   conversations: many(conversations),
//   identityLinks: many(identityLinks),
// }));
