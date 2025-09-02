import { TRPCError } from "@trpc/server";

import type { TRPCInstance } from "../trpc";

// RBAC helpers
export type Role = "user" | "admin";
export const roleRank: Record<Role, number> = { user: 1, admin: 2 };

export const createRequireRoleMiddleware =
  (t: TRPCInstance) => (minRole: Role) =>
    t.middleware(({ ctx, next }) => {
      interface WithRole {
        role?: Role;
      }
      let role: Role = "user";
      const maybeRole = (ctx.session?.user as WithRole | undefined)?.role;
      if (maybeRole) role = maybeRole;
      if (roleRank[role] < roleRank[minRole]) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient role",
        });
      }
      return next();
    });
