import { createId } from "@paralleldrive/cuid2";
import {
  index,
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
    description: text("description"),
    color: text("color"), // для UI цветовой кодировки тегов
    parentId: text("parent_id"), // самоссылка, FK будет добавлен через relations
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqName: uniqueIndex("tag_household_name_uidx").on(
      table.householdId,
      table.name,
    ),
    householdIdx: index("tag_household_idx").on(table.householdId),
    parentIdx: index("tag_parent_idx").on(table.parentId),
    nameIdx: index("tag_name_idx").on(table.name),
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
    eventIdx: index("event_tag_event_idx").on(table.eventId),
    tagIdx: index("event_tag_tag_idx").on(table.tagId),
  }),
);
