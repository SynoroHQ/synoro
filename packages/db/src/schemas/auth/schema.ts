import { createId } from "@paralleldrive/cuid2";
// packages/db/src/schemas/auth/schema.ts
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin", "moderator"]);

export const userStatus = pgEnum("user_status", [
  "active",
  "inactive",
  "suspended",
  "pending",
]);

/**
 * Основная таблица пользователей системы
 * Хранит базовую информацию: имя, email, роль, статус, время последнего входа
 */
export const user = pgTable(
  "user",
  (t) => ({
    id: text("id").primaryKey().$defaultFn(createId),
    name: t.text().notNull(),
    email: t.text().notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: t.text(),
    role: userRole("role").notNull().default("user"),
    status: userStatus("status").notNull().default("active"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  }),
  (table) => [
    index("user_email_idx").on(table.email),
    index("user_role_idx").on(table.role),
    index("user_status_idx").on(table.status),
    index("user_created_at_idx").on(table.createdAt),
  ],
);

/**
 * Таблица активных сессий пользователей
 * Хранит токены аутентификации, IP адреса, user agent и время истечения
 */
export const session = pgTable(
  "session",
  (t) => ({
    id: text("id").primaryKey().$defaultFn(createId),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    isActive: boolean("is_active").notNull().default(true),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  }),
  (table) => [
    index("session_token_idx").on(table.token),
    index("session_user_idx").on(table.userId),
    index("session_expires_idx").on(table.expiresAt),
    index("session_active_idx").on(table.isActive),
  ],
);

/**
 * Таблица внешних аккаунтов пользователей
 * Связывает внутренних пользователей с OAuth провайдерами (Google, GitHub, etc.)
 */
export const account = pgTable(
  "account",
  (t) => ({
    id: text("id").primaryKey().$defaultFn(createId),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: t.text(), // для password-based провайдеров
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  }),
import {
  boolean,
  index,
  unique,
  pgEnum,
  pgTable,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

// ... other imports and definitions ...

export const account = pgTable(
  "account",
  {
    // ... column definitions ...
  },
  (table) => [
    index("account_user_idx").on(table.userId),
    index("account_provider_idx").on(table.providerId),
    unique("account_account_provider_uq").on(table.accountId, table.providerId),
  ],
);
);

export const verificationType = pgEnum("verification_type", [
  "email",
  "phone",
  "password_reset",
  "otp",
]);

/**
 * Таблица кодов верификации и OTP
 * Хранит временные коды для подтверждения email, сброса пароля и двухфакторной аутентификации
 */
export const verification = pgTable(
  "verification",
  (t) => ({
    id: text("id").primaryKey().$defaultFn(createId),
    identifier: text("identifier").notNull(), // email или phone
    value: text("value").notNull(), // код верификации
    type: verificationType("type").notNull().default("email"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    isUsed: boolean("is_used").notNull().default(false),
    attempts: integer("attempts").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  }),
  (table) => [
    index("verification_identifier_idx").on(table.identifier),
    index("verification_type_idx").on(table.type),
    index("verification_expires_idx").on(table.expiresAt),
    index("verification_used_idx").on(table.isUsed),
  ],
);
