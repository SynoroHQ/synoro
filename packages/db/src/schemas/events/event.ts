import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import {
  check,
  decimal,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "../auth/schema";
import { households } from "../core/household";

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

export const eventSource = pgEnum("event_source", [
  "telegram",
  "web",
  "mobile",
  "api",
]);
export const eventType = pgEnum("event_type", [
  "expense",
  "task",
  "maintenance",
  "other",
]);

/**
 * Основная таблица событий/записей
 * Хранит все типы событий: расходы, задачи, обслуживание, заметки
 * Поддерживает приоритеты, статусы, денежные значения и метаданные
 */
export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    source: eventSource("source").notNull(),
    type: eventType("type").notNull(),
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
    // Добавим поле для денежных значений с проверкой на неотрицательность
    amount: decimal("amount", { precision: 12, scale: 2 }),
    // Валюта в формате ISO-4217 (3 заглавные буквы)
    currency: varchar("currency", { length: 3 }).default("RUB").notNull(),
    data: jsonb("data").$type<Record<string, unknown> | null>(),
  },
  (table) => [
    // CHECK constraints для валидации денежных полей
    check("amount_non_negative", sql`${table.amount} >= 0`),
    check("currency_iso_format", sql`${table.currency} ~ '^[A-Z]{3}$'`),
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
