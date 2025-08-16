import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";

export const bannersRouter = {
  // Placeholder for banner routes
  getBanners: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          image: z.string(),
        }),
      ),
    )
    .query(async () => {
      // TODO: Implement actual banner fetching logic
      return [];
    }),
} satisfies TRPCRouterRecord;
