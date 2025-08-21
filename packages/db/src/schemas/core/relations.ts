import { relations } from "drizzle-orm";

import { user } from "../auth/schema";
import { household, householdMember, userProfile } from "./";

// Relations for household
export const householdRelations = relations(household, ({ many }) => ({
  members: many(householdMember),
}));

// Relations for householdMember
export const householdMemberRelations = relations(
  householdMember,
  ({ one }) => ({
    household: one(household, {
      fields: [householdMember.householdId],
      references: [household.id],
    }),
    user: one(user, {
      fields: [householdMember.userId],
      references: [user.id],
    }),
  }),
);

// Relations for userProfile
export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, {
    fields: [userProfile.userId],
    references: [user.id],
  }),
}));

// Relations for user (extending from auth)
export const userCoreRelations = relations(user, ({ one, many }) => ({
  profile: one(userProfile),
  householdMemberships: many(householdMember),
}));
