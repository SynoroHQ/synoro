import type { TRPCRouterRecord } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { conversations, messages } from "@synoro/db";
import { GetHistoryInput, MessageRole } from "@synoro/validators";

import { protectedProcedure } from "../../trpc";

// Схема для вывода сообщения
const MessageOutputSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.enum(["user", "system", "assistant", "tool"]),
  content: z.object({
    text: z.string(),
  }),
  createdAt: z.date(),
});

export const getHistoryRouter: TRPCRouterRecord = {
  getHistory: protectedProcedure
    .input(GetHistoryInput)
    .output(z.object({ items: z.array(MessageOutputSchema) }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      const userId = ctx.session.user.id;

      // Получаем сообщения из указанной беседы
      const rows = await db
        .select({
          id: messages.id,
          role: messages.role,
          content: messages.content,
          model: messages.model,
          status: messages.status,
          parentId: messages.parentId,
          createdAt: messages.createdAt,
          conversationId: messages.conversationId,
        })
        .from(messages)
        .innerJoin(conversations, eq(conversations.id, messages.conversationId))
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            eq(conversations.ownerUserId, userId),
          ),
        )
        .orderBy(messages.createdAt); // сначала старые сообщения

      // Приводим к формату MessageOutput с валидацией
      const items = rows.map((row) => ({
        id: row.id,
        conversationId: row.conversationId,
        role: MessageRole.parse(row.role),
        content: MessageOutputSchema.shape.content.parse(row.content),
        createdAt: row.createdAt,
      }));

      return { items };
    }),
};
