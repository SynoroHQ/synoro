import { pgTable } from "drizzle-orm/pg-core";

export const household = pgTable("household", (t) => ({
  id: t.text().primaryKey(),
  name: t.text().notNull(),
  createdAt: t.timestamp().notNull(),
  updatedAt: t.timestamp().notNull(),
}));
