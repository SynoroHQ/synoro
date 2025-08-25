import type { TRPCRouterRecord } from "@trpc/server";
import { desc, eq } from "drizzle-orm";

import { conversations } from "@synoro/db";
import {
  ListConversationsInput,
  ListConversationsOutput,
} from "@synoro/validators";

import { protectedProcedure } from "../../trpc";

export const listConversationsRouter: TRPCRouterRecord = {
  listConversations: protectedProcedure
    .input(ListConversationsInput)
    .output(ListConversationsOutput)
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      const userId = ctx.session.user.id;
      const rows = await db
        .select({
          id: conversations.id,
          title: conversations.title,
          channel: conversations.channel,
          updatedAt: conversations.updatedAt,
          lastMessageAt: conversations.lastMessageAt,
        })
        .from(conversations)
        .where(eq(conversations.ownerUserId, userId))
        .orderBy(desc(conversations.updatedAt))
        .limit(input.limit ?? 20);

      return { items: rows };
    }),
};
