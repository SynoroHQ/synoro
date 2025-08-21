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
// At the top of the file, alongside other imports
import { TRPCError } from "@trpc/server";
// …other imports…

// …inside your procedure resolver…
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
  // Проверяем, что диалог принадлежит пользователю
  const existingConv = await db
    .select()
    .from(conversation)
    .where(eq(conversation.id, convId))
    .limit(1);

  if (existingConv.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Диалог не найден",
    });
  }

  if (existingConv[0].ownerUserId !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Нет доступа к этому диалогу",
    });
  }

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
    // Fire-and-forget LLM run
    startCompletionRun({
      runId,
      conversationId: convId,
      _userMessageId: userMsgId,
      prompt: input.content.text,
      model: input.model,
      userId,
    }).catch((error) => {
      console.error("Ошибка при запуске LLM completion:", {
        runId,
        conversationId: convId,
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      });
    });

    return { runId, conversationId: convId, userMessageId: userMsgId };
  }),
};
