import { pgTable } from "drizzle-orm/pg-core";

export const eventLog = pgTable("event_log", (t) => ({
  id: t.text().primaryKey(),
  source: t.text().notNull(), // e.g. 'telegram'
  chatId: t.text().notNull(),
  type: t.text().notNull(), // 'text' | 'audio'
  text: t.text(), // message or transcription
  meta: t.jsonb().$type<Record<string, unknown> | null>(),
  createdAt: t.timestamp().notNull(),
}));
