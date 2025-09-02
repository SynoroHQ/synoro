// DEPRECATED: Этот роутер больше не нужен, так как пользователи Telegram
// автоматически создаются при первом обращении через getUserContext
// import { z } from "zod";

// import { TelegramUserService } from "../../lib/services/telegram-user-service";
// import { protectedProcedure } from "../../trpc";

// export const linkUser = protectedProcedure
//   .input(
//     z.object({
//       telegramUserId: z.string(),
//       // internalUserId не нужен - берется из сессии
//     }),
//   )
//   .mutation(async ({ ctx, input }) => {
//     const internalUserId = ctx.session.user.id;

//     await TelegramUserService.linkUser(input.telegramUserId, internalUserId);

//     return {
//       success: true,
//       message: "Пользователь Telegram успешно связан",
//     };
//   });

// Экспортируем пустой объект для совместимости
export const linkUser = null;
