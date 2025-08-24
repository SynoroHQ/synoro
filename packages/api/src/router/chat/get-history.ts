import type { TRPCRouterRecord } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { conversations, messages } from "@synoro/db";
import {
  GetHistoryInput,
  MessageOutput,
  MessageRole,
} from "@synoro/validators";

import { protectedProcedure } from "../../trpc";

export const getHistoryRouter: TRPCRouterRecord = {
  getHistory: protectedProcedure
    .input(GetHistoryInput)
    .output(z.object({ items: z.array(MessageOutput) }))
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
        content: MessageOutput.shape.content.parse(row.content),
        createdAt: row.createdAt,
      }));

      return { items };
    }),
};
