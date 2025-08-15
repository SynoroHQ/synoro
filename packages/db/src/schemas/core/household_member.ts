import { pgTable, primaryKey } from "drizzle-orm/pg-core";
import { household } from "./household";
import { user } from "../auth/schema";

export const householdMember = pgTable(
  "household_member",
  (t) => ({
    householdId: t
      .text()
      .notNull()
      .references(() => household.id, { onDelete: "cascade" }),
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: t.text().notNull(), // 'owner' | 'member' | 'viewer'
    createdAt: t.timestamp().notNull(),
    updatedAt: t.timestamp().notNull(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.householdId, table.userId] }),
  })
);
