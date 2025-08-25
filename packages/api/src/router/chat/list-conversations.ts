import type { TRPCRouterRecord } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { conversations } from "@synoro/db";
import {
  ListAnonymousConversationsInput,
  ListConversationsInput,
  ListConversationsOutput,
} from "@synoro/validators";

import { protectedProcedure, telegramAnonymousProcedure } from "../../trpc";

export const listConversationsRouter: TRPCRouterRecord = {
  listConversations: protectedProcedure
    .input(ListConversationsInput)
    .output(ListConversationsOutput)
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      const userId = ctx.session.user.id;
      const rows = await db
        .select({
          id: conversations.id,
          title: conversations.title,
          channel: conversations.channel,
          updatedAt: conversations.updatedAt,
          lastMessageAt: conversations.lastMessageAt,
        })
        .from(conversations)
        .where(eq(conversations.ownerUserId, userId))
        .orderBy(desc(conversations.updatedAt))
        .limit(input.limit ?? 20);

      return { items: rows };
    }),

  // Для анонимных пользователей Telegram с валидацией initData
  listAnonymousConversations: telegramAnonymousProcedure
    .input(ListAnonymousConversationsInput)
    .output(ListConversationsOutput)
    .query(async ({ ctx, input }) => {
      const db = ctx.db;

      // Используем telegramChatId из контекста middleware
      if (!ctx.telegramChatId) {
        throw new Error("Telegram chat ID not found in context");
      }

      const rows = await db
        .select({
          id: conversations.id,
          title: conversations.title,
          channel: conversations.channel,
          updatedAt: conversations.updatedAt,
          lastMessageAt: conversations.lastMessageAt,
        })
        .from(conversations)
        .where(eq(conversations.telegramChatId, ctx.telegramChatId))
        .orderBy(desc(conversations.updatedAt))
        .limit(input.limit ?? 20);

      return { items: rows };
    }),
};
