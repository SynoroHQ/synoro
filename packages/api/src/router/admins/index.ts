import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";

export const adminsRouter = {
  // Placeholder for admin routes
  getAdmins: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
        }),
      ),
    )
    .query(async () => {
      // TODO: Implement actual admin fetching logic
      return [];
    }),
} satisfies TRPCRouterRecord;
