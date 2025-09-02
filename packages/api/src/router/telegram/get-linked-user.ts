import { z } from "zod";

import { TelegramUserService } from "../../lib/services/telegram-user-service";
import { enhancedBotProcedure } from "../../trpc";

export const getLinkedUser = enhancedBotProcedure
  .input(
    z.object({
      telegramUserId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    return TelegramUserService.getTelegramUser(input.telegramUserId);
  });
