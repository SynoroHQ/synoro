import { relations } from "drizzle-orm";

import { user } from "../auth/schema";
import { household } from "../core/household";
import { attachment, event, eventProperty, eventTag, tag } from "./";

// Relations for event
export const eventRelations = relations(event, ({ one, many }) => ({
  household: one(household, {
    fields: [event.householdId],
    references: [household.id],
  }),
  user: one(user, {
    fields: [event.userId],
    references: [user.id],
  }),
  attachments: many(attachment),
  properties: many(eventProperty),
  eventTags: many(eventTag),
}));

// Relations for attachment
export const attachmentRelations = relations(attachment, ({ one }) => ({
  household: one(household, {
    fields: [attachment.householdId],
    references: [household.id],
  }),
  event: one(event, {
    fields: [attachment.eventId],
    references: [event.id],
  }),
}));

// Relations for tag
export const tagRelations = relations(tag, ({ one, many }) => ({
  household: one(household, {
    fields: [tag.householdId],
    references: [household.id],
  }),
  parent: one(tag, {
    fields: [tag.parentId],
    references: [tag.id],
    relationName: "tagHierarchy",
  }),
  children: many(tag, {
    relationName: "tagHierarchy",
  }),
  eventTags: many(eventTag),
}));

// Relations for eventTag
export const eventTagRelations = relations(eventTag, ({ one }) => ({
  event: one(event, {
    fields: [eventTag.eventId],
    references: [event.id],
  }),
  tag: one(tag, {
    fields: [eventTag.tagId],
    references: [tag.id],
  }),
}));

// Relations for eventProperty
export const eventPropertyRelations = relations(eventProperty, ({ one }) => ({
  event: one(event, {
    fields: [eventProperty.eventId],
    references: [event.id],
  }),
}));

// Relations from other schemas
export const userEventRelations = relations(user, ({ many }) => ({
  events: many(event),
}));

export const householdEventRelations = relations(household, ({ many }) => ({
  events: many(event),
  attachments: many(attachment),
  tags: many(tag),
}));
