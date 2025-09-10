import { relations } from "drizzle-orm";

import { conversations, identityLinks } from "../chat/schema";
import { householdMembers } from "../core/household-member";
import { userProfiles } from "../core/user-profile";
import { events } from "../events/event";
import { accounts, sessions, users } from "./schema";

// Relations for user - consolidated all user relations
export const userRelations = relations(users, ({ one, many }) => ({
  // Auth relations
  sessions: many(sessions),
  accounts: many(accounts),

  // Core relations
  profile: one(userProfiles),
  householdMemberships: many(householdMembers),

  // Chat relations
  conversations: many(conversations),
  identityLinks: many(identityLinks),

  // Event relations
  events: many(events),
}));

// Relations for session
export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Relations for account
export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));
