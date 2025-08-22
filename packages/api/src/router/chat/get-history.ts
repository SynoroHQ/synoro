import type { TRPCRouterRecord } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { conversation, message } from "@synoro/db";
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
        .orderBy(message.createdAt); // сначала старые сообщения

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
