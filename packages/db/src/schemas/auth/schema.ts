import { createId } from "@paralleldrive/cuid2";
import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin"]);

export const user = pgTable("user", (t) => ({
  id: text("id").primaryKey().$defaultFn(createId),
  name: t.text().notNull(),
  email: t.text().notNull().unique(),
  emailVerified: t.boolean().notNull(),
  image: t.text(),
  role: userRole("role").notNull().default("user"),
  createdAt: t.timestamp().notNull(),
  updatedAt: t.timestamp().notNull(),
}));

export const session = pgTable("session", (t) => ({
  id: text("id").primaryKey().$defaultFn(createId),
  expiresAt: t.timestamp().notNull(),
  token: t.text().notNull().unique(),
  createdAt: t.timestamp().notNull(),
  updatedAt: t.timestamp().notNull(),
  ipAddress: t.text(),
  userAgent: t.text(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}));

export const account = pgTable("account", (t) => ({
  id: text("id").primaryKey().$defaultFn(createId),
  accountId: t.text().notNull(),
  providerId: t.text().notNull(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: t.text(),
  refreshToken: t.text(),
  idToken: t.text(),
  accessTokenExpiresAt: t.timestamp(),
  refreshTokenExpiresAt: t.timestamp(),
  scope: t.text(),
  password: t.text(),
  createdAt: t.timestamp().notNull(),
  updatedAt: t.timestamp().notNull(),
}));

export const verification = pgTable("verification", (t) => ({
  id: text("id").primaryKey().$defaultFn(createId),
  identifier: t.text().notNull(),
  value: t.text().notNull(),
  expiresAt: t.timestamp().notNull(),
  createdAt: t.timestamp(),
  updatedAt: t.timestamp(),
}));
