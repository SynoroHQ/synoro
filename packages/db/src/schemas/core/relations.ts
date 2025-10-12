import { relations } from "drizzle-orm";

import { users } from "../auth/schema";
import { eventAssets } from "../events/event-asset";
import { householdMembers, households, userProfiles } from "./";
import { assets } from "./asset";

// Relations for household
export const householdRelations = relations(households, ({ many }) => ({
  members: many(householdMembers),
  assets: many(assets),
}));

// Relations for asset
export const assetRelations = relations(assets, ({ one, many }) => ({
  household: one(households, {
    fields: [assets.householdId],
    references: [households.id],
  }),
  eventAssets: many(eventAssets),
}));

// Relations for householdMember
export const householdMemberRelations = relations(
  householdMembers,
  ({ one }) => ({
    household: one(households, {
      fields: [householdMembers.householdId],
      references: [households.id],
    }),
    user: one(users, {
      fields: [householdMembers.userId],
      references: [users.id],
    }),
  }),
);

// Relations for userProfile
export const userProfileRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

// Relations for user (extending from auth) - merged into main user relations
// export const userCoreRelations = relations(users, ({ one, many }) => ({
//   profile: one(userProfiles),
//   householdMemberships: many(householdMembers),
// }));
