import type { TRPCRouterRecord } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import { conversations, messages } from "@synoro/db";
import {
  GetHistoryInput,
  GetHistoryOutput,
  MessageRole,
} from "@synoro/validators";

import { protectedProcedure } from "../../trpc";

export const getHistoryRouter: TRPCRouterRecord = {
  getHistory: protectedProcedure
    .input(GetHistoryInput)
    .output(GetHistoryOutput)
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      const userId = ctx.session.user.id;

      // Получаем сообщения из указанной беседы
      const query = db
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

      // Применяем пагинацию
      if (input.cursor) {
        // TODO: Implement cursor-based pagination
        // query = query.where(gt(messages.createdAt, input.cursor));
      }

      const rows = await query.limit(input.limit ?? 100);

      // Приводим к формату MessageOutput с валидацией
      const items = rows.map((row) => ({
        id: row.id,
        conversationId: row.conversationId,
        role: MessageRole.parse(row.role),
        content: {
          text:
            typeof row.content === "object" &&
            row.content &&
            "text" in row.content
              ? String(row.content.text)
              : String(row.content),
        },
        createdAt: row.createdAt,
      }));

      return { items };
    }),
};
