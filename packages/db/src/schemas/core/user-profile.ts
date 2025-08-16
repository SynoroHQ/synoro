import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "../auth/schema";

export const userProfile = pgTable("user_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  timezone: text("timezone").notNull().default("UTC"),
  locale: text("locale").notNull().default("ru-RU"),
  preferences: jsonb("preferences").$type<Record<string, unknown> | null>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
