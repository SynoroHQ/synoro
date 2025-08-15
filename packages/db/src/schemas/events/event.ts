import { pgTable, index } from "drizzle-orm/pg-core";
import { household } from "../core/household";
import { user } from "../auth/schema";

export const event = pgTable(
  "event",
  (t) => ({
    id: t.text().primaryKey(),
    householdId: t
      .text()
      .notNull()
      .references(() => household.id, { onDelete: "cascade" }),
    userId: t.text().references(() => user.id, { onDelete: "set null" }),
    source: t.text().notNull(),
    type: t.text().notNull(),
    occurredAt: t.timestamp().notNull(),
    ingestedAt: t.timestamp().notNull(),
    title: t.text(),
    notes: t.text(),
    data: t.jsonb().$type<Record<string, unknown> | null>(),
  }),
  (table) => ({
    byHouseholdOccurred: index("event_household_occurred_idx").on(
      table.householdId,
      table.occurredAt
    ),
    byHouseholdTypeOccurred: index("event_household_type_occurred_idx").on(
      table.householdId,
      table.type,
      table.occurredAt
    ),
  })
);
