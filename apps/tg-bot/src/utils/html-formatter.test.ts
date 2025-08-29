/**
 * Простые тесты для HTML форматирования
 * Запуск: bun run test src/utils/html-formatter.test.ts
 */

import { HTMLMessageBuilder } from "./html-message-builder";

// Простые тесты для проверки работы HTML форматирования
function testHTMLFormatting() {
  console.log("🧪 Тестирование HTML форматирования...\n");

  // Тест 1: Простое сообщение
  console.log("1. Простое сообщение:");
  const simpleMessage = HTMLMessageBuilder.createMessage({
    title: "Тест",
    content: "Это тестовое сообщение",
    useEmojis: true,
  });
  console.log(simpleMessage);
  console.log("\n" + "─".repeat(50) + "\n");

  // Тест 2: Таблица
  console.log("2. Таблица:");
  const table = HTMLMessageBuilder.createTable({
    title: "Тестовая таблица",
    headers: ["Колонка 1", "Колонка 2"],
    rows: [
      ["Значение 1", "Значение 2"],
      ["Значение 3", "Значение 4"],
    ],
  });
  console.log(table);
  console.log("\n" + "─".repeat(50) + "\n");

  // Тест 3: Список
  console.log("3. Список:");
  const list = HTMLMessageBuilder.createList({
    title: "Тестовый список",
    items: ["Элемент 1", "Элемент 2", "Элемент 3"],
    type: "numbered",
  });
  console.log(list);
  console.log("\n" + "─".repeat(50) + "\n");

  // Тест 4: Блок кода
  console.log("4. Блок кода:");
  const codeBlock = HTMLMessageBuilder.createCodeBlock(
    "console.log('Hello, World!');",
    "JavaScript",
    "Пример кода",
  );
  console.log(codeBlock);
  console.log("\n" + "─".repeat(50) + "\n");

  // Тест 5: Анализ результата
  console.log("5. Результат анализа:");
  const analysis = HTMLMessageBuilder.createAnalysisResult(
    "Тестовый анализ",
    "Это краткое резюме анализа",
    ["Деталь 1", "Деталь 2"],
    ["Рекомендация 1", "Рекомендация 2"],
  );
  console.log(analysis);
  console.log("\n" + "─".repeat(50) + "\n");

  // Тест 6: Финансовая информация
  console.log("6. Финансовая информация:");
  const financial = HTMLMessageBuilder.createFinancialInfo(
    "Тестовый отчёт",
    "1000",
    "₽",
    { Доход: "1000 ₽", Расход: "500 ₽" },
    "up",
  );
  console.log(financial);
  console.log("\n" + "─".repeat(50) + "\n");

  // Тест 7: Информация о задаче
  console.log("7. Информация о задаче:");
  const task = HTMLMessageBuilder.createTaskInfo(
    "Тестовая задача",
    "Описание тестовой задачи",
    "high",
    "2024-12-31",
    "Тестовый пользователь",
  );
  console.log(task);

  console.log("\n✅ Все тесты завершены!");
}

// Запускаем тесты если файл запущен напрямую
if (require.main === module) {
  testHTMLFormatting();
}

export { testHTMLFormatting };
