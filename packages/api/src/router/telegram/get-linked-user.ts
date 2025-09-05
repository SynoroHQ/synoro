import { z } from "zod";

import { TelegramUserService } from "../../lib/services/telegram-user-service";
import { botProcedure } from "../../trpc";

export const getLinkedUser = botProcedure
  .input(
    z.object({
      telegramUserId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    return TelegramUserService.getTelegramUser(input.telegramUserId);
  });
