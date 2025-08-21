import {
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { event } from "./event";

export const eventProperty = pgTable(
  "event_property",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: jsonb("value").$type<unknown>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.key] }),
    eventIdx: index("event_property_event_idx").on(table.eventId),
    keyIdx: index("event_property_key_idx").on(table.key),
  }),
);
