import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "../auth/schema";
import { households } from "./household";

export const memberRole = pgEnum("member_role", [
  "owner",
  "admin",
  "member",
  "viewer",
]);

export const memberStatus = pgEnum("member_status", [
  "active",
  "invited",
  "suspended",
  "left",
]);

/**
 * Таблица участников домохозяйств
 * Связывает пользователей с домохозяйствами, определяет роли и права доступа
 * Поддерживает различные статусы: активный, приглашенный, приостановленный
 */
export const householdMembers = pgTable(
  "household_members",
  {
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: memberRole("role").notNull().default("member"),
    status: memberStatus("status").notNull().default("active"),
    // Персональные настройки участника в этом домохозяйстве
    settings: jsonb("settings").$type<{
      notifications?: boolean;
      permissions?: string[];
      preferences?: Record<string, unknown>;
    } | null>(),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    primaryKey({ columns: [table.householdId, table.userId] }),
    index("household_member_household_idx").on(table.householdId),
    index("household_member_user_idx").on(table.userId),
    index("household_member_role_idx").on(table.role),
    index("household_member_status_idx").on(table.status),
  ],
);
