import { relations } from "drizzle-orm";

import { user } from "../auth/schema";
import {
  conversations,
  identityLinks,
  messageAttachments,
  messages,
} from "./schema";

// Relations for conversation
export const conversationRelations = relations(
  conversations,
  ({ one, many }) => ({
    owner: one(user, {
      fields: [conversations.ownerUserId],
      references: [user.id],
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
  attachments: many(messageAttachments),
}));

// Relations for messageAttachment
export const messageAttachmentRelations = relations(
  messageAttachments,
  ({ one }) => ({
    message: one(messages, {
      fields: [messageAttachments.messageId],
      references: [messages.id],
    }),
  }),
);

// Relations for identityLink
export const identityLinkRelations = relations(identityLinks, ({ one }) => ({
  user: one(user, {
    fields: [identityLinks.userId],
    references: [user.id],
  }),
}));

// Relations for user (from auth schema)
export const userChatRelations = relations(user, ({ many }) => ({
  conversations: many(conversations),
  identityLinks: many(identityLinks),
}));
