import { pgTable } from "drizzle-orm/pg-core";
import { household } from "../core/household";
import { event } from "./event";

export const attachment = pgTable("attachment", (t) => ({
  id: t.text().primaryKey(),
  householdId: t
    .text()
    .notNull()
    .references(() => household.id, { onDelete: "cascade" }),
  eventId: t.text().references(() => event.id, { onDelete: "set null" }),
  type: t.text().notNull(), // 'image' | 'audio' | 'pdf' | 'raw'
  mime: t.text(),
  storageUrl: t.text().notNull(),
  meta: t.jsonb().$type<Record<string, unknown> | null>(),
  createdAt: t.timestamp().notNull(),
}));
