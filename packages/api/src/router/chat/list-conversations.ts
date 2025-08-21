import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { conversation } from "@synoro/db";
import { desc, eq } from "drizzle-orm";
import { ListConversationsInput } from "@synoro/validators";

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
          id: conversation.id,
          title: conversation.title,
          channel: conversation.channel,
          updatedAt: conversation.updatedAt,
          lastMessageAt: conversation.lastMessageAt,
        })
        .from(conversation)
        .where(eq(conversation.ownerUserId, userId))
        .orderBy(desc(conversation.updatedAt))
        .limit(50);

      return { items: rows };
    }),
};
