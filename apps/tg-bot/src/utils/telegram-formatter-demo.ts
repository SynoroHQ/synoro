/**
 * Демонстрация работы форматтера ответов для Telegram
 * Показывает, как будут выглядеть отформатированные сообщения
 */

import { formatAgentResponse, formatForTelegram } from "./telegram-formatter";

/**
 * Демонстрирует различные типы форматирования
 */
export function demonstrateTelegramFormatting() {
  console.log("🎨 Демонстрация форматирования ответов для Telegram");
  console.log("=".repeat(60));

  // Пример 1: Обычный ответ
  console.log("\n📝 Пример 1: Обычный ответ");
  const simpleResponse = "Это простой ответ на вопрос пользователя.";
  const formatted1 = formatForTelegram(simpleResponse);
  console.log("Оригинал:", simpleResponse);
  console.log("Отформатировано:", formatted1.text);
  console.log("Режим парсинга:", formatted1.parse_mode || "нет");

  // Пример 2: Ответ с заголовками
  console.log("\n📝 Пример 2: Ответ с заголовками");
  const headerResponse = `Анализ финансового состояния:
Основные показатели:
- Доходы: 50000 рублей
- Расходы: 35000 рублей
- Экономия: 15000 рублей

Рекомендации:
1. Сократить расходы на развлечения
2. Увеличить доходы от подработки
3. Создать резервный фонд`;

  const formatted2 = formatForTelegram(headerResponse);
  console.log("Оригинал:", headerResponse);
  console.log("Отформатировано:", formatted2.text);
  console.log("Режим парсинга:", formatted2.parse_mode || "нет");

  // Пример 3: Ответ с ошибкой
  console.log("\n📝 Пример 3: Ответ с ошибкой");
  const errorResponse = "Не удалось обработать запрос. Попробуйте позже.";
  const formatted3 = formatForTelegram(errorResponse);
  console.log("Оригинал:", errorResponse);
  console.log("Отформатировано:", formatted3.text);
  console.log("Режим парсинга:", formatted3.parse_mode || "нет");

  // Пример 4: Ответ с техническими терминами
  console.log("\n📝 Пример 4: Ответ с техническими терминами");
  const techResponse = `Система Synoro использует следующие технологии:
- Next.js 14.0.0 для веб-интерфейса
- tRPC для API
- Drizzle ORM для работы с базой данных
- Bun как JavaScript runtime`;

  const formatted4 = formatForTelegram(techResponse);
  console.log("Оригинал:", techResponse);
  console.log("Отформатировано:", formatted4.text);
  console.log("Режим парсинга:", formatted4.parse_mode || "нет");

  // Пример 5: Ответ агента с контекстом
  console.log("\n📝 Пример 5: Ответ агента с контекстом");
  const agentResponse = `Финансовый анализ завершен:
Обнаружены возможности экономии в размере 25000 рублей в месяц.
Основные направления оптимизации:
• Сокращение необязательных расходов
• Пересмотр подписок на сервисы
• Оптимизация транспортных расходов`;

  const formatted5 = formatAgentResponse(agentResponse, "financial-advisor", {
    addContextInfo: true,
    addSeparators: true,
  });
  console.log("Оригинал:", agentResponse);
  console.log("Отформатировано:", formatted5.text);
  console.log("Режим парсинга:", formatted5.parse_mode || "нет");

  // Пример 6: Длинный ответ с переносом строк
  console.log("\n📝 Пример 6: Длинный ответ с переносом строк");
  const longResponse = "Это очень длинный ответ, который содержит много информации и должен быть правильно отформатирован для удобного чтения в Telegram. Мы используем различные техники форматирования, включая добавление эмодзи, разделителей и правильное размещение переносов строк для максимального удобства пользователя.";

  const formatted6 = formatForTelegram(longResponse, {
    maxLineLength: 60,
    addSeparators: true,
  });
  console.log("Оригинал:", longResponse);
  console.log("Отформатировано:", formatted6.text);
  console.log("Режим парсинга:", formatted6.parse_mode || "нет");

  console.log("\n✅ Демонстрация завершена!");
  console.log("Все ответы теперь будут красиво отформатированы для Telegram");
}

/**
 * Тестирует форматирование для разных типов агентов
 */
export function testAgentSpecificFormatting() {
  console.log("\n🤖 Тестирование форматирования для разных типов агентов");
  console.log("=".repeat(60));

  const testResponse = "Анализ завершен. Результаты готовы к просмотру.";

  const agentTypes = [
    "qa-specialist",
    "financial-advisor",
    "data-analyst",
    "event-processor",
    "task-manager",
  ];

  agentTypes.forEach((agentType) => {
    const formatted = formatAgentResponse(testResponse, agentType);
    console.log(`\n${agentType}:`);
    console.log("  Ответ:", formatted.text);
    console.log("  Режим:", formatted.parse_mode || "нет");
  });
}

// Экспортируем функции для использования
export default {
  demonstrateTelegramFormatting,
  testAgentSpecificFormatting,
};
