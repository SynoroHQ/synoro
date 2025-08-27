import { AgentManager } from "../src/lib/agents/agent-manager";
import { globalAgentRegistry } from "../src/lib/agents/agent-registry";

/**
 * Пример использования TelegramFormatterAgent
 * Демонстрирует как агент форматирует ответы для Telegram
 */
async function telegramFormattingExample() {
  console.log("🚀 Запуск примера форматирования для Telegram");
  
  // Инициализируем менеджер агентов (это зарегистрирует все агенты)
  const agentManager = new AgentManager();
  
  // Получаем информацию о всех агентах
  const agentsInfo = agentManager.getAvailableAgents();
  console.log(`📋 Доступные агенты (${agentsInfo.length} шт.):`);
  agentsInfo.forEach(agent => {
    console.log(`  - ${agent.name} (${agent.key})`);
  });
  
  // Проверяем, что TelegramFormatterAgent зарегистрирован
  const telegramFormatter = globalAgentRegistry.get("telegram-formatter");
  if (!telegramFormatter) {
    console.error("❌ TelegramFormatterAgent не найден в реестре");
    return;
  }
  
  console.log(`\n✅ Найден агент: ${telegramFormatter.name}`);
  
  // Создаем тестовую задачу для форматирования
  const testTask = {
    id: "example-task-1",
    type: "telegram-formatting",
    input: "Ваш запрос обработан успешно. Результат: сумма расходов за этот месяц составляет 15000 рублей. Рекомендуем проверить категории расходов.",
    context: {
      userId: "user-123",
      platform: "telegram"
    }
  };
  
  // Проверяем, может ли агент обработать задачу
  const canHandle = await telegramFormatter.canHandle(testTask);
  console.log(`\n🔍 Агент может обработать задачу: ${canHandle}`);
  
  if (canHandle) {
    // Обрабатываем задачу
    console.log("\n⚙️ Форматируем ответ для Telegram...");
    const result = await telegramFormatter.process(testTask);
    
    if (result.success) {
      console.log("\n✅ Форматирование успешно:");
      console.log(result.data);
      console.log(`\n⭐ Уровень уверенности: ${(result.confidence * 100).toFixed(1)}%`);
    } else {
      console.error(`\n❌ Ошибка форматирования: ${result.error}`);
    }
  }
  
  // Получаем статистику агентов
  const agentStats = agentManager.getAgentStats();
  console.log(`\n📊 Статистика агентов:`);
  console.log(`  Всего агентов: ${agentStats.totalAgents}`);
  console.log(`  Список агентов: ${agentStats.agentList.join(", ")}`);
  
  console.log("\n🏁 Пример завершен");
}

// Запускаем пример
if (require.main === module) {
  telegramFormattingExample().catch(console.error);
}

export { telegramFormattingExample };
