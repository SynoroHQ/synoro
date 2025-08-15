import { pgTable, primaryKey } from "drizzle-orm/pg-core";
import { event } from "./event";

export const eventProperty = pgTable(
  "event_property",
  (t) => ({
    eventId: t.text().notNull().references(() => event.id, { onDelete: "cascade" }),
    key: t.text().notNull(),
    value: t.jsonb().$type<unknown>(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.key] }),
  })
);
