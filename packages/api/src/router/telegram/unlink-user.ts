// DEPRECATED: Этот роутер больше не нужен, так как пользователи Telegram
// автоматически создаются при первом обращении через getUserContext
// import { z } from "zod";

// import { TelegramUserService } from "../../lib/services/telegram-user-service";
// import { protectedProcedure } from "../../trpc";

// export const unlinkUser = protectedProcedure
//   .input(
//     z.object({
//       telegramUserId: z.string(),
//     }),
//   )
//   .mutation(async ({ input }) => {
//     await TelegramUserService.unlinkUser(input.telegramUserId);

//     return {
//       success: true,
//       message: "Пользователь Telegram успешно отвязан",
//     };
//   });

// Экспортируем пустой объект для совместимости
export const unlinkUser = null;
