import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { startCompletionRun } from "../../lib/llm";
import { createId, conversation, message } from "@synoro/db";
import { eq } from "drizzle-orm";
import { SendMessageInput } from "@synoro/validators";

export const sendMessageRouter: TRPCRouterRecord = {
  sendMessage: protectedProcedure
  .input(SendMessageInput)
  .output(
    z.object({
      runId: z.string(),
      conversationId: z.string(),
      userMessageId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const db = ctx.db;
    const now = new Date();
    const userId = ctx.session.user.id;

    // Resolve conversation
    let convId: string;
    if (!input.conversationId || input.createNew) {
      convId = createId();
      await db.insert(conversation).values({
        id: convId,
        ownerUserId: userId,
        channel: input.channel,
        status: "active",
        createdAt: now,
        updatedAt: now,
        lastMessageAt: now,
      });
    } else {
      convId = input.conversationId;
      // touch conversation timestamps
      await db
        .update(conversation)
        .set({ updatedAt: now, lastMessageAt: now })
        .where(eq(conversation.id, convId));
    }

    // Create user message
    const userMsgId = createId();
    await db.insert(message).values({
      id: userMsgId,
      conversationId: convId,
      role: "user",
      content: { text: input.content.text },
      model: input.model ?? undefined,
      status: "completed",
      parentId: undefined,
      createdAt: now,
    });

    const runId = createId();

    // Fire-and-forget LLM run
    void startCompletionRun({
      runId,
      conversationId: convId,
      _userMessageId: userMsgId,
      prompt: input.content.text,
      model: input.model,
      userId,
    });

    return { runId, conversationId: convId, userMessageId: userMsgId };
  }),
};
