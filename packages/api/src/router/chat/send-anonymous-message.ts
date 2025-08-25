import type { TRPCRouterRecord } from "@trpc/server";
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import { conversations, messages } from "@synoro/db";
import { SendMessageInput, SendMessageOutput } from "@synoro/validators";

import { startCompletionRun } from "../../lib/llm";
import { publicProcedure } from "../../trpc";

export const sendAnonymousMessageRouter: TRPCRouterRecord = {
  sendAnonymousMessage: publicProcedure
    .input(SendMessageInput)
    .output(SendMessageOutput)
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      const now = new Date();

      // Для анонимных пользователей требуется telegramChatId
      if (input.channel !== "telegram" || !input.telegramChatId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Анонимные сообщения поддерживаются только для Telegram с указанием chatId",
        });
      }

      // Resolve conversation
      let convId: string;

      if (!input.conversationId || input.createNew) {
        // Создаем новую беседу для анонимного пользователя
        convId = createId();
        await db.insert(conversations).values({
          id: convId,
          telegramChatId: input.telegramChatId,
          channel: input.channel,
          status: "active",
          createdAt: now,
          updatedAt: now,
          lastMessageAt: now,
        });
      } else {
        // Используем существующую беседу
        convId = input.conversationId;

        // Проверяем, что диалог существует и принадлежит этому Telegram чату
        const existingConv = await db
          .select()
          .from(conversations)
          .where(
            and(
              eq(conversations.id, convId),
              eq(conversations.telegramChatId, input.telegramChatId),
            ),
          )
          .limit(1);

        if (existingConv.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Диалог не найден для данного Telegram чата",
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
        userId: null, // Анонимный пользователь
        telegramChatId: input.telegramChatId,
      }).catch((error) => {
        console.error(
          "Ошибка при запуске LLM completion для анонимного пользователя:",
          {
            runId,
            conversationId: convId,
            telegramChatId: input.telegramChatId,
            error:
              error instanceof Error ? error.message : "Неизвестная ошибка",
          },
        );
      });

      return { runId, conversationId: convId, userMessageId: userMsgId };
    }),
};
