// Простой тест для проверки создания пользователей Telegram
import { TelegramUserService } from "./dist/lib/services/telegram-user-service.js";

async function testTelegramUserCreation() {
  console.log("🧪 Тестируем создание пользователя Telegram...");

  const testTelegramUserId = "test_user_12345";

  try {
    // Первый вызов - должен создать пользователя
    console.log("1. Первый вызов getUserContext...");
    const userContext1 =
      await TelegramUserService.getUserContext(testTelegramUserId);
    console.log("✅ Пользователь создан:", {
      userId: userContext1.userId,
      telegramUserId: userContext1.telegramUserId,
      conversationId: userContext1.conversationId,
    });

    // Второй вызов - должен найти существующего пользователя
    console.log("2. Второй вызов getUserContext...");
    const userContext2 =
      await TelegramUserService.getUserContext(testTelegramUserId);
    console.log("✅ Пользователь найден:", {
      userId: userContext2.userId,
      telegramUserId: userContext2.telegramUserId,
      conversationId: userContext2.conversationId,
    });

    // Проверяем, что это тот же пользователь
    if (userContext1.userId === userContext2.userId) {
      console.log("✅ ID пользователя совпадает - пользователь не дублируется");
    } else {
      console.log("❌ ID пользователя не совпадает - возможно дублирование");
    }

    console.log("🎉 Тест прошел успешно!");
  } catch (error) {
    console.error("❌ Ошибка в тесте:", error);
  }
}

testTelegramUserCreation();
