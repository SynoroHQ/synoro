import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { household } from "../core/household";
import { event } from "./event";
import { createId } from "@paralleldrive/cuid2";

export const attachment = pgTable("attachment", {
  id: text("id").primaryKey().$defaultFn(createId),
  householdId: text("household_id")
    .notNull()
    .references(() => household.id, { onDelete: "cascade" }),
  eventId: text("event_id").references(() => event.id, { onDelete: "set null" }),
  type: text("type").notNull(), // 'image' | 'audio' | 'pdf' | 'raw'
  mime: text("mime"),
  storageUrl: text("storage_url").notNull(),
  meta: jsonb("meta").$type<Record<string, unknown> | null>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
