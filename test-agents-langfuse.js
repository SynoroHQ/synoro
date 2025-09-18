// Тест для проверки, что агенты используют промпты из Langfuse
import { AgentManager } from "./packages/api/src/lib/agents/index.js";

async function testAgentsLangfuse() {
  console.log("🧪 Тестирование агентов с промптами из Langfuse...\n");

  const agentManager = new AgentManager();

  // Тестовые запросы для каждого агента
  const testCases = [
    {
      name: "Event Processor Agent",
      input: "Купил хлеб за 50 рублей в магазине",
      expectedAgent: "event-processor",
    },
    {
      name: "Event Analyzer Agent",
      input: "Покажи статистику моих расходов за месяц",
      expectedAgent: "event-analyzer",
    },
    {
      name: "General Assistant Agent",
      input: "Привет! Как дела?",
      expectedAgent: "general-assistant",
    },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📝 Тестируем: ${testCase.name}`);
      console.log(`   Запрос: "${testCase.input}"`);

      const result = await agentManager.processRequest(testCase.input, {
        userId: "test-user",
        householdId: "test-household",
      });

      if (result.success) {
        console.log(`   ✅ Успешно обработано`);
        console.log(`   📊 Уверенность: ${result.confidence || "N/A"}`);
        console.log(`   💬 Ответ: ${result.data?.substring(0, 100)}...`);
      } else {
        console.log(`   ❌ Ошибка: ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Исключение: ${error.message}`);
    }

    console.log("");
  }

  console.log("🏁 Тестирование завершено!");
}

// Запускаем тест
testAgentsLangfuse().catch(console.error);
