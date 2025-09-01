import { TelegramUserService } from "../../lib/services/telegram-user-service";
import { protectedProcedure } from "../../trpc";

export const getMyLinkedAccounts = protectedProcedure.query(async ({ ctx }) => {
  // Здесь можно добавить логику для получения всех связанных аккаунтов
  // Пока возвращаем базовую информацию
  return {
    success: true,
    message: "Функция в разработке",
  };
});
