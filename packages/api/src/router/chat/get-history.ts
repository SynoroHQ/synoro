import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { message } from "@synoro/db";
import { eq } from "drizzle-orm";
import { GetHistoryInput, MessageOutput, MessageRole } from "@synoro/validators";

export const getHistoryRouter: TRPCRouterRecord = {
  getHistory: protectedProcedure
    .input(GetHistoryInput)
    .output(z.object({ items: z.array(MessageOutput) }))
    .query(async ({ ctx, input }) => {
    const db = ctx.db;
    const rows = await db
      .select({
        id: message.id,
        conversationId: message.conversationId,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
      })
      .from(message)
      .where(eq(message.conversationId, input.conversationId))
      .orderBy(message.createdAt); // oldest first

    // Conform to MessageOutput using validator shapes to avoid any-casts
    const items = rows.map((r) => ({
      id: r.id,
      conversationId: r.conversationId,
      role: MessageRole.parse(r.role),
      content: MessageOutput.shape.content.parse(r.content),
      createdAt: r.createdAt,
    }));

      return { items };
    }),
};
