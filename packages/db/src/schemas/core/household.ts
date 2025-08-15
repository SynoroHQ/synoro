import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const household = pgTable("household", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  // withTimezone helps if you use timestamptz in PG
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
