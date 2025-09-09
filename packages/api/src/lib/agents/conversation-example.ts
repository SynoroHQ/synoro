/**
 * Пример использования системы истории сообщений для мультиагентных разговоров
 */

import { AgentManager } from "./agent-manager";
import type { AgentContext } from "./agent-context";

// Создаем экземпляр менеджера агентов
const agentManager = new AgentManager();

/**
 * Пример простого разговора с агентом
 */
async function simpleConversationExample() {
  console.log("🚀 Пример простого разговора с агентом");

  const context: AgentContext = {
    userId: "user123",
    channel: "telegram",
    metadata: {
      userId: "user123",
      channel: "telegram",
    },
  };

  try {
    // Первое сообщение - создает новый разговор
    const result1 = await agentManager.processMessageWithConversation(
      "Привет! Помоги мне создать план изучения TypeScript",
      context
    );

    console.log("📝 Первый ответ:", result1.finalResponse);
    console.log("🆔 ID разговора:", result1.conversationId);

    // Второе сообщение - продолжает разговор
    const result2 = await agentManager.processMessageWithConversation(
      "Сколько времени это займет?",
      context,
      result1.conversationId // Передаем ID разговора
    );

    console.log("📝 Второй ответ:", result2.finalResponse);

    // Третье сообщение - еще одно уточнение
    const result3 = await agentManager.processMessageWithConversation(
      "А какие ресурсы ты рекомендуешь?",
      context,
      result1.conversationId
    );

    console.log("📝 Третий ответ:", result3.finalResponse);

    // Получаем полную историю разговора
    const history = agentManager.getConversationHistory(result1.conversationId);
    console.log("📚 История разговора:", history);

  } catch (error) {
    console.error("❌ Ошибка в разговоре:", error);
  }
}

/**
 * Пример разговора с несколькими пользователями
 */
async function multiUserConversationExample() {
  console.log("👥 Пример разговора с несколькими пользователями");

  // Контекст для первого пользователя
  const user1Context: AgentContext = {
    userId: "alice",
    channel: "web",
    metadata: { userId: "alice", channel: "web" },
  };

  // Контекст для второго пользователя
  const user2Context: AgentContext = {
    userId: "bob",
    channel: "telegram",
    metadata: { userId: "bob", channel: "telegram" },
  };

  try {
    // Разговор с первым пользователем
    const aliceResult = await agentManager.processMessageWithConversation(
      "Как настроить Docker для Node.js приложения?",
      user1Context
    );

    console.log("👩 Alice получила ответ:", aliceResult.finalResponse);

    // Разговор со вторым пользователем (отдельная история)
    const bobResult = await agentManager.processMessageWithConversation(
      "Объясни что такое микросервисы",
      user2Context
    );

    console.log("👨 Bob получил ответ:", bobResult.finalResponse);

    // Продолжение разговора с Alice
    const aliceFollowUp = await agentManager.processMessageWithConversation(
      "А как добавить базу данных в Docker Compose?",
      user1Context,
      aliceResult.conversationId
    );

    console.log("👩 Alice получила продолжение:", aliceFollowUp.finalResponse);

  } catch (error) {
    console.error("❌ Ошибка в мультипользовательском разговоре:", error);
  }
}

/**
 * Пример работы с историей разговора
 */
async function conversationHistoryExample() {
  console.log("📚 Пример работы с историей разговора");

  const context: AgentContext = {
    userId: "developer",
    channel: "api",
    metadata: { userId: "developer", channel: "api" },
  };

  try {
    // Создаем разговор
    const result = await agentManager.processMessageWithConversation(
      "Расскажи про React hooks",
      context
    );

    const conversationId = result.conversationId;

    // Добавляем еще несколько сообщений
    await agentManager.processMessageWithConversation(
      "Что такое useEffect?",
      context,
      conversationId
    );

    await agentManager.processMessageWithConversation(
      "Приведи пример использования useState",
      context,
      conversationId
    );

    // Получаем историю разговора
    const fullHistory = agentManager.getConversationHistory(conversationId);
    console.log("📖 Полная история:", fullHistory?.length, "сообщений");

    // Получаем ограниченную историю
    const limitedHistory = agentManager.getConversationHistory(conversationId, 3);
    console.log("📄 Ограниченная история:", limitedHistory?.length, "сообщений");

    // Очищаем историю
    agentManager.clearConversationHistory(conversationId);
    console.log("🧹 История очищена");

    const clearedHistory = agentManager.getConversationHistory(conversationId);
    console.log("📭 История после очистки:", clearedHistory?.length, "сообщений");

  } catch (error) {
    console.error("❌ Ошибка при работе с историей:", error);
  }
}

// Экспортируем примеры для использования
export {
  simpleConversationExample,
  multiUserConversationExample,
  conversationHistoryExample,
};

// Если файл запускается напрямую, выполняем примеры
if (require.main === module) {
  async function runExamples() {
    console.log("🎯 Запуск примеров использования истории сообщений\n");

    await simpleConversationExample();
    console.log("\n" + "=".repeat(50) + "\n");

    await multiUserConversationExample();
    console.log("\n" + "=".repeat(50) + "\n");

    await conversationHistoryExample();
    console.log("\n✅ Все примеры выполнены!");
  }

  runExamples().catch(console.error);
}
