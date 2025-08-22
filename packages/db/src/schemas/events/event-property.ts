import {
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { events } from "./event";

/**
 * Таблица дополнительных свойств событий
 * Хранит произвольные ключ-значение пары для расширения событий
 * Позволяет добавлять специфичные поля без изменения основной схемы
 */
export const eventProperties = pgTable(
  "event_properties",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
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
  (table) => [
    primaryKey({ columns: [table.eventId, table.key] }),
    index("event_property_event_idx").on(table.eventId),
    index("event_property_key_idx").on(table.key),
  ],
);
