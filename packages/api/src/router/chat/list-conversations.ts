import type { TRPCRouterRecord } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { conversations } from "@synoro/db";
import { ListConversationsInput } from "@synoro/validators";

import { protectedProcedure } from "../../trpc";

export const listConversationsRouter: TRPCRouterRecord = {
  listConversations: protectedProcedure
    .input(ListConversationsInput)
    .output(
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            title: z.string().nullable().optional(),
            channel: z.string(),
            updatedAt: z.date(),
            lastMessageAt: z.date().nullable().optional(),
          }),
        ),
      }),
    )
    .query(async ({ ctx }) => {
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
        .limit(50);

      return { items: rows };
    }),
};
