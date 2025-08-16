import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";

export const blogRouter = {
  // Placeholder for blog routes
  getPosts: protectedProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          content: z.string(),
        }),
      ),
    )
    .query(async () => {
      // TODO: Implement actual blog post fetching logic
      return [];
    }),
} satisfies TRPCRouterRecord;
