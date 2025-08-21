import { createId } from "@paralleldrive/cuid2";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { household } from "../core/household";
import { event } from "./event";

export const attachmentType = pgEnum("attachment_type", [
  "image",
  "audio",
  "video",
  "pdf",
  "document",
  "receipt",
  "raw",
]);

export const attachment = pgTable(
  "attachment",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    householdId: text("household_id")
      .notNull()
      .references(() => household.id, { onDelete: "cascade" }),
    eventId: text("event_id").references(() => event.id, {
      onDelete: "set null",
    }),
    type: attachmentType("type").notNull(),
    mime: text("mime"),
    filename: text("filename"), // оригинальное имя файла
    size: integer("size"), // размер в байтах
    storageUrl: text("storage_url").notNull(),
    thumbnailUrl: text("thumbnail_url"), // для изображений/видео
    meta: jsonb("meta").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    householdIdx: index("attachment_household_idx").on(table.householdId),
    eventIdx: index("attachment_event_idx").on(table.eventId),
    typeIdx: index("attachment_type_idx").on(table.type),
    createdAtIdx: index("attachment_created_at_idx").on(table.createdAt),
  }),
);
