import type { StructuredAgentContext } from "../context-manager";
import type { AgentTask, MessageHistoryItem } from "../types";
import { AgentContextManager } from "../context-manager";

/**
 * Пример использования новой системы структурированного контекста
 * Демонстрирует best practices для передачи контекста между агентами
 */

/**
 * Пример создания структурированного контекста
 */
export async function createContextExample() {
  const contextManager = new AgentContextManager();

  // Создаем пример задачи с историей сообщений
  const task: AgentTask = {
    id: "example-task-1",
    type: "question",
    input: "Как мне лучше организовать свой рабочий день?",
    context: {
      userId: "user123",
      channel: "telegram",
      metadata: {
        conversationId: "conv456",
        contextMessageCount: 5,
      },
    },
    priority: 1,
    createdAt: new Date(),
    messageHistory: [
      {
        id: "msg1",
        role: "user",
        content: "Привет! Меня зовут Анна, я работаю менеджером проекта",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 минут назад
        metadata: { userId: "user123", channel: "telegram" },
      },
      {
        id: "msg2",
        role: "assistant",
        content:
          "Привет, Анна! Рад познакомиться. Расскажи, с какими задачами ты обычно сталкиваешься в работе?",
        timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 минут назад
        metadata: { userId: "user123", channel: "telegram" },
      },
      {
        id: "msg3",
        role: "user",
        content:
          "У меня много встреч, дедлайны, команда из 5 человек. Иногда не успеваю все сделать",
        timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 минут назад
        metadata: { userId: "user123", channel: "telegram" },
      },
      {
        id: "msg4",
        role: "assistant",
        content:
          "Понимаю, это типичная ситуация для менеджера проекта. Какие инструменты ты используешь для планирования?",
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 минут назад
        metadata: { userId: "user123", channel: "telegram" },
      },
    ],
  };

  // Создаем структурированный контекст
  const structuredContext = await contextManager.createStructuredContext(
    task,
    "Productivity Assistant",
    "Помогает с планированием и организацией рабочего времени",
  );

  console.log("📋 Структурированный контекст:");
  console.log(JSON.stringify(structuredContext, null, 2));

  // Форматируем для промпта
  const promptContext =
    contextManager.formatContextForPrompt(structuredContext);
  console.log("\n📝 Контекст для промпта:");
  console.log(promptContext);

  // Создаем сжатую версию
  const compressedContext = contextManager.createCompressedContext(
    structuredContext,
    300,
  );
  console.log("\n🗜️ Сжатый контекст (300 символов):");
  console.log(compressedContext);

  return structuredContext;
}

/**
 * Пример сравнения старого и нового подхода
 */
export function compareContextApproaches() {
  console.log("🔄 Сравнение подходов к передаче контекста:\n");

  console.log("❌ СТАРЫЙ ПОДХОД (проблемы):");
  console.log("- Передача сырого чата целиком");
  console.log("- Отсутствие структурированности");
  console.log("- Нет извлечения ключевой информации");
  console.log("- Смешивание инструкций с контекстом");
  console.log("- Неэффективное использование токенов\n");

  console.log("✅ НОВЫЙ ПОДХОД (best practices):");
  console.log("1. 🔹 Инструкция (роль агента) - четко определена");
  console.log("2. 🔹 Краткий контекст - извлечена ключевая информация");
  console.log("3. 🔹 Последние шаги - только релевантные сообщения");
  console.log("4. 🔹 Конкретная задача - четко сформулирована");
  console.log("5. 🔹 Метаданные - для отладки и оптимизации\n");

  console.log("📊 ПРЕИМУЩЕСТВА:");
  console.log("- Экономия токенов (до 70% меньше)");
  console.log("- Лучшее понимание контекста агентами");
  console.log("- Более точные и релевантные ответы");
  console.log("- Легче отлаживать и оптимизировать");
  console.log("- Масштабируемость для разных типов агентов");
}

/**
 * Пример использования в разных типах агентов
 */
export async function agentSpecificExamples() {
  const contextManager = new AgentContextManager();

  const task: AgentTask = {
    id: "example-task-2",
    type: "event",
    input: "Купил кофе за 150 рублей в Starbucks",
    context: {
      userId: "user456",
      channel: "telegram",
    },
    priority: 1,
    createdAt: new Date(),
    messageHistory: [
      {
        id: "msg1",
        role: "user",
        content: "Начал вести учет расходов",
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 час назад
        metadata: { userId: "user456", channel: "telegram" },
      },
    ],
  };

  // Для роутера (ограниченный контекст)
  const routerContext = await contextManager.createStructuredContext(
    task,
    "Message Router",
    "Классифицирует сообщения и направляет к подходящим агентам",
  );
  const routerPrompt = contextManager.createCompressedContext(
    routerContext,
    400,
  );
  console.log("🔀 Контекст для роутера (400 символов):");
  console.log(routerPrompt);

  // Для специализированного агента (больше контекста)
  const specialistContext = await contextManager.createStructuredContext(
    task,
    "Event Processor",
    "Обрабатывает события и записывает их в базу данных",
  );
  const specialistPrompt =
    contextManager.formatContextForPrompt(specialistContext);
  console.log("\n📊 Контекст для специализированного агента:");
  console.log(specialistPrompt);
}

// Запуск примеров
if (require.main === module) {
  console.log("🚀 Запуск примеров новой системы контекста\n");

  createContextExample()
    .then(() => {
      console.log("\n" + "=".repeat(50) + "\n");
      compareContextApproaches();
      console.log("\n" + "=".repeat(50) + "\n");
      return agentSpecificExamples();
    })
    .then(() => {
      console.log("\n✅ Примеры завершены!");
    })
    .catch(console.error);
}
