import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "../auth/schema";

export const themeMode = pgEnum("theme_mode", ["light", "dark", "system"]);

export const userProfiles = pgTable(
  "user_profiles",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    // Локализация
    timezone: text("timezone").notNull().default("UTC"),
    locale: text("locale").notNull().default("ru-RU"),
    currency: text("currency").notNull().default("RUB"),

    // UI настройки
    theme: themeMode("theme").notNull().default("system"),

    // Персональная информация
    firstName: text("first_name"),
    lastName: text("last_name"),
    phone: text("phone"),
    bio: text("bio"),
    website: text("website"),

    // Настройки уведомлений
    emailNotifications: text("email_notifications").notNull().default("all"), // 'all' | 'important' | 'none'
    pushNotifications: text("push_notifications").notNull().default("all"),

    // Расширенные настройки
    preferences: jsonb("preferences").$type<{
      // AI настройки
      aiModel?: string;
      aiTemperature?: number;

      // Приватность
      profileVisibility?: "public" | "private";
      analyticsOptOut?: boolean;

      // Рабочие настройки
      workingHours?: {
        start: string;
        end: string;
        timezone: string;
      };

      // Другие настройки
      [key: string]: unknown;
    } | null>(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("user_profile_timezone_idx").on(table.timezone),
    index("user_profile_locale_idx").on(table.locale),
    index("user_profile_phone_idx").on(table.phone),
  ],
);
