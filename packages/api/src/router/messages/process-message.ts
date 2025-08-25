import { TRPCError } from "@trpc/server";

import {
  ProcessMessageInput,
  ProcessMessageResponse,
} from "@synoro/validators";

import { processMessageInternal } from "../../lib/services/message-processor";
import { botProcedure, protectedProcedure } from "../../trpc";

export const processMessageRouter = {
  // Универсальный эндпоинт для обработки сообщений (для веб/мобайл клиентов)
  processMessage: protectedProcedure
    .input(ProcessMessageInput)
    .output(ProcessMessageResponse)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return processMessageInternal({
        text: input.text,
        channel: input.channel,
        userId,
        ctx,
        chatId: input.chatId,
        messageId: input.messageId,
        metadata: input.metadata,
      });
    }),

  // Публичный эндпоинт для Telegram бота
  processMessageFromTelegram: botProcedure
    .input(ProcessMessageInput)
    .output(ProcessMessageResponse)
    .mutation(async ({ ctx, input }) => {
      // Для bot запросов используем botUserId из контекста
      const userId = ctx.botUserId;
      if (!userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID пользователя бота не указан в контексте",
        });
      }

      return processMessageInternal({
        text: input.text,
        channel: input.channel,
        userId,
        ctx,
        chatId: input.chatId,
        messageId: input.messageId,
        metadata: input.metadata,
      });
    }),
};
