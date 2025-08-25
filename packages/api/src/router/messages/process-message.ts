import { TRPCError } from "@trpc/server";

import {
  ProcessMessageInput,
  ProcessMessageResponse,
} from "@synoro/validators";

import { processMessageInternal } from "../../lib/services/message-processor";
import { TelegramUserService } from "../../lib/services/telegram-user-service";
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
      // Получаем telegramUserId из input
      const telegramUserId = input.telegramUserId;
      if (!telegramUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID пользователя Telegram не указан в запросе",
        });
      }

      // Получаем chatId из input
      const chatId = input.chatId;
      if (!chatId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ID чата Telegram не указан в запросе",
        });
      }

      // Получаем контекст пользователя через TelegramUserService
      const userContext = await TelegramUserService.getUserContext(
        telegramUserId,
        chatId,
        input.messageId,
      );

      // Вызываем processMessageInternal с правильным userId (может быть null для анонимных)
      return processMessageInternal({
        text: input.text,
        channel: input.channel,
        userId: userContext.userId ?? null, // null для анонимных пользователей
        ctx,
        chatId: userContext.conversationId, // Используем conversationId вместо chatId
        messageId: input.messageId,
        metadata: {
          ...input.metadata,
          telegramUserId,
          telegramChatId: chatId,
          isAnonymous: userContext.isAnonymous,
          conversationId: userContext.conversationId,
        },
      });
    }),
};
