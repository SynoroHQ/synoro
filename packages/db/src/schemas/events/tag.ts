import { pgTable, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { household } from "../core/household";
import { event } from "./event";

export const tag = pgTable(
  "tag",
  (t) => ({
    id: t.text().primaryKey(),
    householdId: t
      .text()
      .notNull()
      .references(() => household.id, { onDelete: "cascade" }),
    name: t.text().notNull(),
    // Примечание: убрали FK на саму таблицу, чтобы избежать проблем типизации при само-ссылке.
    // Можно добавить ограничение отдельной миграцией, если потребуется.
    parentId: t.text(),
    createdAt: t.timestamp().notNull(),
    updatedAt: t.timestamp().notNull(),
  }),
  (table) => ({
    uniqName: uniqueIndex("tag_household_name_uidx").on(
      table.householdId,
      table.name
    ),
  })
);

export const eventTag = pgTable(
  "event_tag",
  (t) => ({
    eventId: t
      .text()
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    tagId: t.text().notNull().references(() => tag.id, { onDelete: "cascade" }),
    createdAt: t.timestamp().notNull(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.tagId] }),
  })
);
