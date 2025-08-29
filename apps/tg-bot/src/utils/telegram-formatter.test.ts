/**
 * Тесты для основного форматтера Telegram
 */

import { formatForTelegram } from "./telegram-formatter";

function testTelegramFormatter() {
  console.log("🧪 Тестирование основного форматтера Telegram...\n");

  // Тест 1: Простой ответ
  console.log("1. Простой ответ:");
  const simpleResponse = formatForTelegram(
    "Это простой ответ на вопрос пользователя",
  );
  console.log("Результат:", simpleResponse);
  console.log("\n" + "─".repeat(50) + "\n");

  // Тест 2: Ответ с ошибкой
  console.log("2. Ответ с ошибкой:");
  const errorResponse = formatForTelegram(
    "Произошла ошибка при обработке запроса",
  );
  console.log("Результат:", errorResponse);
  console.log("\n" + "─".repeat(50) + "\n");

  // Тест 3: Ответ с техническими терминами
  console.log("3. Ответ с техническими терминами:");
  const techResponse = formatForTelegram(
    "Используйте API для получения данных. Поддерживаются HTTP запросы и JSON ответы",
  );
  console.log("Результат:", techResponse);
  console.log("\n" + "─".repeat(50) + "\n");

  // Тест 4: Ответ с важными словами
  console.log("4. Ответ с важными словами:");
  const importantResponse = formatForTelegram(
    "Внимание! Это важно. Срочно выполните задачу",
  );
  console.log("Результат:", importantResponse);
  console.log("\n" + "─".repeat(50) + "\n");

  // Тест 5: Ответ с ссылкой
  console.log("5. Ответ с ссылкой:");
  const linkResponse = formatForTelegram(
    "Подробнее читайте на сайте https://example.com",
  );
  console.log("Результат:", linkResponse);
  console.log("\n" + "─".repeat(50) + "\n");

  // Тест 6: Ответ с таблицей
  console.log("6. Ответ с таблицей:");
  const tableResponse = formatForTelegram(
    "Статистика:\nПроект | Статус | Прогресс\nВеб-сайт | В работе | 75%",
  );
  console.log("Результат:", tableResponse);
  console.log("\n" + "─".repeat(50) + "\n");

  console.log("✅ Все тесты завершены!");
}

// Запускаем тесты если файл запущен напрямую
if (require.main === module) {
  testTelegramFormatter();
}

export { testTelegramFormatter };
