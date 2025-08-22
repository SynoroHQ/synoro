import { createId } from "@paralleldrive/cuid2";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const householdStatus = pgEnum("household_status", [
  "active",
  "inactive",
  "archived",
]);

export const households = pgTable(
  "households",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    name: text("name").notNull(),
    description: text("description"),
    status: householdStatus("status").notNull().default("active"),
    // Настройки домохозяйства
    settings: jsonb("settings").$type<{
      timezone?: string;
      currency?: string;
      language?: string;
      features?: string[];
    } | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("household_name_idx").on(table.name),
    index("household_status_idx").on(table.status),
    index("household_created_at_idx").on(table.createdAt),
  ],
);
