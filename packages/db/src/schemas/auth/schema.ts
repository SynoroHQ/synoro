import { createId } from "@paralleldrive/cuid2";
// packages/db/src/schemas/auth/schema.ts
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin", "moderator"]);

export const userStatus = pgEnum("user_status", [
  "active",
  "inactive",
  "suspended",
  "pending",
]);

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
  (table) => ({
    emailIdx: index("user_email_idx").on(table.email),
    roleIdx: index("user_role_idx").on(table.role),
    statusIdx: index("user_status_idx").on(table.status),
    createdAtIdx: index("user_created_at_idx").on(table.createdAt),
  }),
);

export const session = pgTable(
  "session",
  (t) => ({
    id: text("id").primaryKey().$defaultFn(createId),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: t.text().notNull().unique(),
    ipAddress: t.text("ip_address"),
    userAgent: t.text("user_agent"),
    isActive: boolean("is_active").notNull().default(true),
    userId: t
      .text("user_id")
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
  (table) => ({
    tokenIdx: index("session_token_idx").on(table.token),
    userIdx: index("session_user_idx").on(table.userId),
    expiresIdx: index("session_expires_idx").on(table.expiresAt),
    activeIdx: index("session_active_idx").on(table.isActive),
  }),
);

export const account = pgTable(
  "account",
  (t) => ({
    id: text("id").primaryKey().$defaultFn(createId),
    accountId: t.text("account_id").notNull(),
    providerId: t.text("provider_id").notNull(),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: t.text("access_token"),
    refreshToken: t.text("refresh_token"),
    idToken: t.text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: t.text(),
    password: t.text(), // для password-based провайдеров
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  }),
  (table) => ({
    userIdx: index("account_user_idx").on(table.userId),
    providerIdx: index("account_provider_idx").on(table.providerId),
    accountProviderIdx: index("account_account_provider_idx").on(
      table.accountId,
      table.providerId,
    ),
  }),
);

export const verificationType = pgEnum("verification_type", [
  "email",
  "phone",
  "password_reset",
  "otp",
]);

export const verification = pgTable(
  "verification",
  (t) => ({
    id: text("id").primaryKey().$defaultFn(createId),
    identifier: t.text().notNull(), // email или phone
    value: t.text().notNull(), // код верификации
    type: verificationType("type").notNull().default("email"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    isUsed: boolean("is_used").notNull().default(false),
    attempts: t.integer().notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  }),
  (table) => ({
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
    typeIdx: index("verification_type_idx").on(table.type),
    expiresIdx: index("verification_expires_idx").on(table.expiresAt),
    usedIdx: index("verification_used_idx").on(table.isUsed),
  }),
);
