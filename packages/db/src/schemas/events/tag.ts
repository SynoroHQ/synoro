import { createId } from "@paralleldrive/cuid2";
import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { household } from "../core/household";
import { event } from "./event";

export const tag = pgTable(
  "tag",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    householdId: text("household_id")
      .notNull()
      .references(() => household.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // Примечание: убрали FK на саму таблицу, чтобы избежать проблем типизации при само-ссылке.
    // Можно добавить ограничение отдельной миграцией, если потребуется.
    parentId: text("parent_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqName: uniqueIndex("tag_household_name_uidx").on(
      table.householdId,
      table.name,
    ),
  }),
);

export const eventTag = pgTable(
  "event_tag",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.tagId] }),
  }),
);
