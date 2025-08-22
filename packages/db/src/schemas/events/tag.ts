import { createId } from "@paralleldrive/cuid2";
import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { households } from "../core/household";
import { events } from "./event";

export const tags = pgTable(
  "tags",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
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
  (table) => [
    uniqueIndex("tag_household_name_uidx").on(table.householdId, table.name),
    index("tag_household_idx").on(table.householdId),
    index("tag_parent_idx").on(table.parentId),
    index("tag_name_idx").on(table.name),
  ],
);

export const eventTags = pgTable(
  "event_tags",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.eventId, table.tagId] }),
    index("event_tag_event_idx").on(table.eventId),
    index("event_tag_tag_idx").on(table.tagId),
  ],
);
