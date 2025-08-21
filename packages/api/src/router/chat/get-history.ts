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
// Update imports
-import { message } from "@synoro/db";
import { message, conversation } from "@synoro/db";
import { and, eq, gt } from "drizzle-orm";

…

// Inside your router definition
.query(async ({ ctx, input }) => {
  const db = ctx.db;
  const userId = ctx.session.user.id;
  const rows = await db
    .select({
      id: message.id,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
    })
    .from(message)
    .innerJoin(conversation, eq(conversation.id, message.conversationId))
    .where(
      and(
        eq(message.conversationId, input.conversationId),
        eq(conversation.ownerUserId, userId),
      ),
    )
    .orderBy(message.createdAt); // oldest first

  return rows;
})
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
