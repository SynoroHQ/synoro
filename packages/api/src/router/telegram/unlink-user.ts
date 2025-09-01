import { z } from "zod";

import { TelegramUserService } from "../../lib/services/telegram-user-service";
import { protectedProcedure } from "../../trpc";

export const unlinkUser = protectedProcedure
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
  });
