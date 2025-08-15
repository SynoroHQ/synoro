import { pgTable } from "drizzle-orm/pg-core";
import { user } from "../auth/schema";

export const userProfile = pgTable("user_profile", (t) => ({
  userId: t
    .text()
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  timezone: t.text().default("UTC"),
  locale: t.text().default("ru-RU"),
  preferences: t.jsonb().$type<Record<string, unknown> | null>(),
  createdAt: t.timestamp().notNull(),
  updatedAt: t.timestamp().notNull(),
}));
