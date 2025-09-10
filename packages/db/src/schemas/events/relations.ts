import { relations } from "drizzle-orm";

import { users } from "../auth/schema";
import { files } from "../core/files";
import { households } from "../core/household";
import { attachments } from "./attachment";
import { events } from "./event";
import { eventProperties } from "./event-property";
import { eventTags, tags } from "./tag";

// Relations for event
export const eventRelations = relations(events, ({ one, many }) => ({
  household: one(households, {
    fields: [events.householdId],
    references: [households.id],
  }),
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  attachments: many(attachments),
  properties: many(eventProperties),
  eventTags: many(eventTags),
}));

// Relations for attachment
export const attachmentRelations = relations(attachments, ({ one }) => ({
  household: one(households, {
    fields: [attachments.householdId],
    references: [households.id],
  }),
  event: one(events, {
    fields: [attachments.eventId],
    references: [events.id],
  }),
  // Связь с новой системой файлов
  file: one(files, {
    fields: [attachments.fileId],
    references: [files.id],
  }),
}));

// Relations for tag
export const tagRelations = relations(tags, ({ one, many }) => ({
  household: one(households, {
    fields: [tags.householdId],
    references: [households.id],
  }),
  parent: one(tags, {
    fields: [tags.parentId],
    references: [tags.id],
    relationName: "tagHierarchy",
  }),
  children: many(tags, {
    relationName: "tagHierarchy",
  }),
  eventTags: many(eventTags),
}));

// Relations for eventTag
export const eventTagRelations = relations(eventTags, ({ one }) => ({
  event: one(events, {
    fields: [eventTags.eventId],
    references: [events.id],
  }),
  tag: one(tags, {
    fields: [eventTags.tagId],
    references: [tags.id],
  }),
}));

// Relations for eventProperty
export const eventPropertyRelations = relations(eventProperties, ({ one }) => ({
  event: one(events, {
    fields: [eventProperties.eventId],
    references: [events.id],
  }),
}));

// Relations from other schemas - merged into main user relations
// export const userEventRelations = relations(users, ({ many }) => ({
//   events: many(events),
// }));

export const householdEventRelations = relations(households, ({ many }) => ({
  events: many(events),
  attachments: many(attachments),
  tags: many(tags),
}));
