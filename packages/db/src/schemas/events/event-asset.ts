import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { assets } from "../core/asset";
import { events } from "./event";

/**
 * Таблица связи событий с объектами/активами
 * Позволяет привязывать события к конкретным объектам (машинам, строениям и т.д.)
 * Одно событие может быть связано с несколькими объектами
 */
export const eventAssets = pgTable(
  "event_assets",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.eventId, table.assetId] }),
    index("event_asset_event_idx").on(table.eventId),
    index("event_asset_asset_idx").on(table.assetId),
  ],
);
