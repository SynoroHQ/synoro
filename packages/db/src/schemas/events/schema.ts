import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const eventLog = pgTable("event_log", {
  id: text("id").primaryKey().$defaultFn(createId),
  source: text("source").notNull(),        // e.g. 'telegram'
  chatId: text("chat_id").notNull(),
  type: text("type").notNull(),            // 'text' | 'audio'
  text: text("text"),                      // message or transcription
  meta: jsonb("meta").$type<Record<string, unknown> | null>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
