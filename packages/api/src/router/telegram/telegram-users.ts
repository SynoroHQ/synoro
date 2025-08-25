import { z } from "zod";

import { TelegramUserService } from "../../lib/services/telegram-user-service";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const telegramUsersRouter = {
  // Получить информацию о связанном пользователе Telegram
  getLinkedUser: publicProcedure
    .input(
      z.object({
        telegramUserId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return TelegramUserService.getLinkedUser(input.telegramUserId);
    }),

  // Связать Telegram пользователя с внутренним пользователем (требует аутентификации)
  linkUser: protectedProcedure
    .input(
      z.object({
        telegramUserId: z.string(),
        // internalUserId не нужен - берется из сессии
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const internalUserId = ctx.session.user.id;

      await TelegramUserService.linkUser(input.telegramUserId, internalUserId);

      return {
        success: true,
        message: "Пользователь Telegram успешно связан",
      };
    }),

  // Отвязать Telegram пользователя от внутреннего пользователя
  unlinkUser: protectedProcedure
    .input(
      z.object({
        telegramUserId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await TelegramUserService.unlinkUser(input.telegramUserId);

      return {
        success: true,
        message: "Пользователь Telegram успешно отвязан",
      };
    }),

  // Получить все связанные аккаунты текущего пользователя
  getMyLinkedAccounts: protectedProcedure.query(async ({ ctx }) => {
    // Здесь можно добавить логику для получения всех связанных аккаунтов
    // Пока возвращаем базовую информацию
    return {
      success: true,
      message: "Функция в разработке",
    };
  }),
};
