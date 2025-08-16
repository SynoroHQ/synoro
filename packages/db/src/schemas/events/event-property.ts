import { jsonb, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

import { event } from "./event";

export const eventProperty = pgTable(
  "event_property",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: jsonb("value").$type<unknown>(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.key] }),
  }),
);
