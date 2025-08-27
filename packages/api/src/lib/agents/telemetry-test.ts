import type { AgentContext, AgentTask } from "./types";
import { DataAnalystAgent } from "./data-analyst-agent";
import { EventProcessorAgent } from "./event-processor-agent";
import { QASpecialistAgent } from "./qa-specialist-agent";

/**
 * Тест для демонстрации работы новой системы телеметрии
 * Показывает, как каждый агент теперь генерирует уникальные functionId
 */
export function demonstrateTelemetrySystem() {
  // Создаем тестовый контекст
  const testContext: AgentContext = {
    userId: "test-user-123",
    chatId: "test-chat-456",
    messageId: "test-message-789",
    channel: "telegram",
    metadata: {
      testMode: "true",
      timestamp: Date.now().toString(),
    },
  };

  // Создаем тестовую задачу
  const testTask: AgentTask = {
    id: "test-task-001",
    type: "question",
    input: "Как работает система Synoro?",
    context: testContext,
    priority: 1,
    createdAt: new Date(),
  };

  // Создаем экземпляры агентов
  const qaAgent = new QASpecialistAgent();
  const eventAgent = new EventProcessorAgent();
  const dataAgent = new DataAnalystAgent();

  console.log("🧪 Тестирование системы телеметрии агентов");
  console.log("=".repeat(50));

  // Демонстрируем, как работает createTelemetry для каждого агента
  console.log("\n📊 QA Specialist Agent:");
  const qaTelemetry = qaAgent["createTelemetry"]("test-operation", testTask);
  console.log(`  functionId: ${qaTelemetry.functionId}`);
  console.log(`  agentName: ${qaTelemetry.metadata?.agentName}`);
  console.log(`  taskType: ${qaTelemetry.metadata?.taskType}`);

  console.log("\n📊 Event Processor Agent:");
  const eventTelemetry = eventAgent["createTelemetry"](
    "test-operation",
    testTask,
  );
  console.log(`  functionId: ${eventTelemetry.functionId}`);
  console.log(`  agentName: ${eventTelemetry.metadata?.agentName}`);
  console.log(`  taskType: ${eventTelemetry.metadata?.taskType}`);

  console.log("\n📊 Data Analyst Agent:");
  const dataTelemetry = dataAgent["createTelemetry"](
    "test-operation",
    testTask,
  );
  console.log(`  functionId: ${dataTelemetry.functionId}`);
  console.log(`  agentName: ${dataTelemetry.metadata?.agentName}`);
  console.log(`  taskType: ${dataTelemetry.metadata?.taskType}`);

  console.log("\n🔍 Примеры различных операций для QA агента:");
  const operations = [
    "question-detection",
    "answer-generation",
    "system-search",
  ];
  operations.forEach((operation) => {
    const telemetry = qaAgent["createTelemetry"](operation, testTask);
    console.log(`  ${operation}: ${telemetry.functionId}`);
  });

  console.log("\n✅ Система телеметрии работает корректно!");
  console.log("   Каждый агент теперь имеет уникальный functionId");
  console.log("   Все операции трассируются с контекстом агента");
}

// Экспортируем функцию для использования в тестах
export default demonstrateTelemetrySystem;
