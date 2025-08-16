import { pgTable, index, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { household } from "../core/household";
import { user } from "../auth/schema";
import { createId } from "@paralleldrive/cuid2";

export const event = pgTable(
  "event",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    householdId: text("household_id")
      .notNull()
      .references(() => household.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    source: text("source").notNull(),
    type: text("type").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).notNull().defaultNow(),
    title: text("title"),
    notes: text("notes"),
    data: jsonb("data").$type<Record<string, unknown> | null>(),
  },
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
