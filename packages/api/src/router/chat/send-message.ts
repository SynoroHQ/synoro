import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { conversations, createId, messages } from "@synoro/db";
import { SendMessageInput } from "@synoro/validators";

import { startCompletionRun } from "../../lib/llm";
import { protectedProcedure } from "../../trpc";

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
        // Создаем новую беседу
        convId = createId();
        await db.insert(conversations).values({
          id: convId,
          ownerUserId: userId,
          channel: input.channel,
          status: "active",
          createdAt: now,
          updatedAt: now,
          lastMessageAt: now,
        });
      } else {
        // Используем существующую беседу
        convId = input.conversationId;

        // Проверяем, что диалог принадлежит пользователю
        const existingConv = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, convId))
          .limit(1);

        if (existingConv.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Диалог не найден",
          });
        }

        const conv = existingConv[0];
        if (!conv || conv.ownerUserId !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Нет доступа к этому диалогу",
          });
        }

        // Обновляем временные метки беседы
        await db
          .update(conversations)
          .set({ updatedAt: now, lastMessageAt: now })
          .where(eq(conversations.id, convId));
      }

      // Создаем пользовательское сообщение
      const userMsgId = createId();
      await db.insert(messages).values({
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

      // Запускаем LLM completion в фоновом режиме
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
