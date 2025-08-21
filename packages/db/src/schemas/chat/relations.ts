import { relations } from "drizzle-orm";

import { user } from "../auth/schema";
import {
  conversation,
  identityLink,
  message,
  messageAttachment,
} from "./schema";

// Relations for conversation
export const conversationRelations = relations(
  conversation,
  ({ one, many }) => ({
    owner: one(user, {
      fields: [conversation.ownerUserId],
      references: [user.id],
    }),
    messages: many(message),
  }),
);

// Relations for message
export const messageRelations = relations(message, ({ one, many }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
  parent: one(message, {
    fields: [message.parentId],
    references: [message.id],
    relationName: "messageThread",
  }),
  children: many(message, {
    relationName: "messageThread",
  }),
  attachments: many(messageAttachment),
}));

// Relations for messageAttachment
export const messageAttachmentRelations = relations(
  messageAttachment,
  ({ one }) => ({
    message: one(message, {
      fields: [messageAttachment.messageId],
      references: [message.id],
    }),
  }),
);

// Relations for identityLink
export const identityLinkRelations = relations(identityLink, ({ one }) => ({
  user: one(user, {
    fields: [identityLink.userId],
    references: [user.id],
  }),
}));

// Relations for user (from auth schema)
export const userChatRelations = relations(user, ({ many }) => ({
  conversations: many(conversation),
  identityLinks: many(identityLink),
}));
