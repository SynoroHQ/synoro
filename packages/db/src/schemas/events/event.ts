import { createId } from "@paralleldrive/cuid2";
import {
  decimal,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "../auth/schema";
import { household } from "../core/household";

export const eventStatus = pgEnum("event_status", [
  "active",
  "archived",
  "deleted",
]);

export const eventPriority = pgEnum("event_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const event = pgTable(
  "event",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    householdId: text("household_id")
      .notNull()
      .references(() => household.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    source: text("source").notNull(), // 'telegram', 'web', 'mobile', 'api'
    type: text("type").notNull(), // 'expense', 'task', 'maintenance', etc.
    status: eventStatus("status").notNull().default("active"),
    priority: eventPriority("priority").default("medium"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    ingestedAt: timestamp("ingested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    title: text("title"),
    notes: text("notes"),
    // Добавим поле для денежных значений
    amount: decimal("amount", { precision: 12, scale: 2 }),
    currency: text("currency").default("RUB"),
    data: jsonb("data").$type<Record<string, unknown> | null>(),
  },
  (table) => [
    index("event_household_occurred_idx").on(
      table.householdId,
      table.occurredAt,
    ),
    index("event_household_type_occurred_idx").on(
      table.householdId,
      table.type,
      table.occurredAt,
    ),
    index("event_user_occurred_idx").on(table.userId, table.occurredAt),
    index("event_status_type_idx").on(table.status, table.type),
    index("event_priority_idx").on(table.priority),
    index("event_amount_idx").on(table.amount),
    index("event_source_idx").on(table.source),
  ],
);
