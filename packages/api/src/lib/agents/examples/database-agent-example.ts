/**
 * Пример использования DatabaseAgent и DatabaseToolsHandler
 * Демонстрирует, как агенты могут получать информацию о делах и событиях пользователя
 */

import type { AgentContext } from "../types";
import { DatabaseAgent } from "../database-agent";
import { DatabaseToolsHandler } from "../database-tools-handler";

// Пример контекста пользователя
const exampleContext: AgentContext = {
  userId: "user_123",
  householdId: "household_456",
  channel: "telegram",
  conversationId: "conv_789",
  metadata: {
    telegramUserId: "123456789",
    username: "example_user",
  },
};

// Примеры запросов пользователей
const exampleQueries = [
  "Покажи мои недавние события",
  "Найди все расходы за последний месяц",
  "Какая у меня статистика по задачам?",
  "Покажи предстоящие дела на неделю",
  "Найди события с тегом 'важно'",
  "Сколько я потратил на продукты?",
  "Покажи все активные задачи",
  "Какие у меня были расходы вчера?",
];

/**
 * Демонстрация работы DatabaseAgent
 */
async function demonstrateDatabaseAgent() {
  console.log("🤖 Демонстрация DatabaseAgent\n");

  const agent = new DatabaseAgent();

  for (const query of exampleQueries) {
    console.log(`📝 Запрос: "${query}"`);

    // Проверяем, может ли агент обработать запрос
    const canHandle = await agent.canHandle({
      id: "example_task",
      input: query,
      context: exampleContext,
    });

    if (canHandle) {
      console.log("✅ Агент может обработать запрос");

      try {
        const result = await agent.process({
          id: "example_task",
          input: query,
          context: exampleContext,
        });

        if (result.success) {
          console.log("📊 Результат:");
          console.log(result.data?.response || "Нет ответа");
        } else {
          console.log("❌ Ошибка:", result.error);
        }
      } catch (error) {
        console.log("❌ Исключение:", error);
      }
    } else {
      console.log("❌ Агент не может обработать запрос");
    }

    console.log("─".repeat(50));
  }
}

/**
 * Демонстрация прямого использования DatabaseToolsHandler
 */
async function demonstrateDatabaseToolsHandler() {
  console.log("🔧 Демонстрация DatabaseToolsHandler\n");

  const handler = new DatabaseToolsHandler();

  // Пример 1: Получение событий пользователя
  console.log("1. Получение событий пользователя:");
  try {
    const events = await handler.executeTool("get_user_events", {
      userId: "user_123",
      householdId: "household_456",
      limit: 5,
    });
    console.log("События:", JSON.stringify(events, null, 2));
  } catch (error) {
    console.log("Ошибка:", error);
  }

  console.log("\n" + "─".repeat(50) + "\n");

  // Пример 2: Получение статистики
  console.log("2. Получение статистики пользователя:");
  try {
    const stats = await handler.executeTool("get_user_stats", {
      userId: "user_123",
      householdId: "household_456",
    });
    console.log("Статистика:", JSON.stringify(stats, null, 2));
  } catch (error) {
    console.log("Ошибка:", error);
  }

  console.log("\n" + "─".repeat(50) + "\n");

  // Пример 3: Поиск событий
  console.log("3. Поиск событий:");
  try {
    const searchResults = await handler.executeTool("search_events", {
      householdId: "household_456",
      userId: "user_123",
      query: "покупка",
      limit: 3,
    });
    console.log("Результаты поиска:", JSON.stringify(searchResults, null, 2));
  } catch (error) {
    console.log("Ошибка:", error);
  }

  console.log("\n" + "─".repeat(50) + "\n");

  // Пример 4: Получение недавних событий
  console.log("4. Получение недавних событий:");
  try {
    const recentEvents = await handler.executeTool("get_recent_events", {
      householdId: "household_456",
      userId: "user_123",
      days: 7,
      limit: 3,
    });
    console.log("Недавние события:", JSON.stringify(recentEvents, null, 2));
  } catch (error) {
    console.log("Ошибка:", error);
  }

  console.log("\n" + "─".repeat(50) + "\n");

  // Пример 5: Получение предстоящих задач
  console.log("5. Получение предстоящих задач:");
  try {
    const upcomingTasks = await handler.executeTool("get_upcoming_tasks", {
      householdId: "household_456",
      userId: "user_123",
      days: 7,
      limit: 3,
    });
    console.log("Предстоящие задачи:", JSON.stringify(upcomingTasks, null, 2));
  } catch (error) {
    console.log("Ошибка:", error);
  }

  console.log("\n" + "─".repeat(50) + "\n");

  // Пример 6: Анализ расходов
  console.log("6. Анализ расходов:");
  try {
    const expenseSummary = await handler.executeTool("get_expense_summary", {
      householdId: "household_456",
      userId: "user_123",
      currency: "RUB",
    });
    console.log("Сводка по расходам:", JSON.stringify(expenseSummary, null, 2));
  } catch (error) {
    console.log("Ошибка:", error);
  }
}

/**
 * Демонстрация доступных tools
 */
function demonstrateAvailableTools() {
  console.log("🛠️ Доступные Database Tools:\n");

  const handler = new DatabaseToolsHandler();
  const tools = handler.getAvailableTools();

  tools.forEach((tool, index) => {
    console.log(`${index + 1}. ${tool}`);
  });

  console.log("\n" + "─".repeat(50) + "\n");

  // Проверка поддержки tools
  console.log("Проверка поддержки tools:");
  const testTools = ["get_user_events", "unknown_tool", "get_user_stats"];

  testTools.forEach((tool) => {
    const isSupported = handler.isToolSupported(tool);
    console.log(
      `${tool}: ${isSupported ? "✅ Поддерживается" : "❌ Не поддерживается"}`,
    );
  });
}

/**
 * Главная функция демонстрации
 */
async function main() {
  console.log("🚀 Демонстрация Database Tools для мультиагентов\n");
  console.log("=".repeat(60));

  // Демонстрация доступных tools
  demonstrateAvailableTools();

  // Демонстрация DatabaseToolsHandler
  await demonstrateDatabaseToolsHandler();

  // Демонстрация DatabaseAgent
  await demonstrateDatabaseAgent();

  console.log("\n✅ Демонстрация завершена!");
}

// Экспорт для использования в других модулях
export {
  demonstrateDatabaseAgent,
  demonstrateDatabaseToolsHandler,
  demonstrateAvailableTools,
  main,
};

// Запуск демонстрации, если файл выполняется напрямую
if (require.main === module) {
  main().catch(console.error);
}
