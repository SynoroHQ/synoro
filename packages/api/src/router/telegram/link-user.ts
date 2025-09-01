import { z } from "zod";

import { TelegramUserService } from "../../lib/services/telegram-user-service";
import { protectedProcedure } from "../../trpc";

export const linkUser = protectedProcedure
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
  });
