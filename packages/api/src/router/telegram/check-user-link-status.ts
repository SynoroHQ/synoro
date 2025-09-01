import { z } from "zod";

import { TelegramUserService } from "../../lib/services/telegram-user-service";
import { publicProcedure } from "../../trpc";

export const checkUserLinkStatus = publicProcedure
  .input(
    z.object({
      telegramUserId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const isLinked = await TelegramUserService.checkUserLinkStatus(
      input.telegramUserId,
    );
    return {
      isLinked,
      // Не возвращаем name, email или другие PII
    };
  });
