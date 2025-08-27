/**
 * Тестовый скрипт для проверки работы агентной системы
 */

import { DEFAULT_AGENT_OPTIONS } from "../config/agents";
import { AgentMessageProcessor, createAgentSystem } from "../lib/agents";

async function testAgentSystem() {
  console.log("🚀 Тестирование агентной системы Synoro AI\n");

  const agentManager = createAgentSystem();
  const processor = new AgentMessageProcessor();

  // Получаем информацию о доступных агентах
  console.log("📋 Доступные агенты:");
  const agents = agentManager.getAvailableAgents();
  agents.forEach((agent) => {
    console.log(`- ${agent.name}: ${agent.description}`);
    agent.capabilities.forEach((cap) => {
      console.log(`  • ${cap.name} (${cap.confidence}): ${cap.description}`);
    });
  });

  console.log("\n" + "=".repeat(80) + "\n");

  // Тестовые сообщения
  const testMessages = [
    {
      input: "Что ты умеешь?",
      type: "question",
      description: "Вопрос о возможностях бота",
    },
    {
      input: "Купил хлеб за 45 рублей",
      type: "event",
      description: "Простое событие-покупка",
    },
    {
      input: "Привет! Как дела?",
      type: "chat",
      description: "Обычное общение",
    },
    {
      input:
        "Проанализируй мои расходы за последний месяц и дай рекомендации по оптимизации бюджета",
      type: "complex_task",
      description: "Сложная задача анализа",
    },
    {
      input: "Сколько я потратил на продукты?",
      type: "question",
      description: "Вопрос о данных",
    },
  ];

  // Контекст для тестирования
  const testContext = {
    userId: "test-user",
    chatId: "test-chat",
    channel: "telegram" as const,
    metadata: {
      testMode: true,
    },
  };

  // Обрабатываем каждое тестовое сообщение
  for (const testMessage of testMessages) {
    console.log(`🔍 Тест: ${testMessage.description}`);
    console.log(`📝 Сообщение: "${testMessage.input}"`);

    try {
      const startTime = Date.now();

      // Тестируем обработку через агентный менеджер
      const result = await agentManager.processMessage(
        testMessage.input,
        testContext,
        DEFAULT_AGENT_OPTIONS,
      );

      const processingTime = Date.now() - startTime;

      console.log(`✅ Результат (${processingTime}ms):`);
      console.log(`📤 Ответ: "${result.finalResponse}"`);
      console.log(`🤖 Агенты: ${result.agentsUsed.join(" → ")}`);
      console.log(`📊 Качество: ${result.qualityScore.toFixed(2)}`);
      console.log(`🔄 Шагов: ${result.totalSteps}`);

      if (result.metadata) {
        if (result.metadata.classification) {
          console.log(
            `🏷️ Классификация: ${result.metadata.classification.messageType} (${result.metadata.classification.confidence.toFixed(2)})`,
          );
        }
        if (result.metadata.routing) {
          console.log(
            `🎯 Маршрутизация: ${result.metadata.routing.targetAgent} (${result.metadata.routing.confidence.toFixed(2)})`,
          );
        }
      }
    } catch (error) {
      console.log(
        `❌ Ошибка: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    console.log("\n" + "-".repeat(80) + "\n");
  }

  // Тестируем гибридный процессор
  console.log("🔄 Тестирование гибридного процессора\n");

  const hybridTestMessage = "Создай подробный план экономии на следующий месяц";

  try {
    console.log(`📝 Гибридный тест: "${hybridTestMessage}"`);

    // Создаем фейковый messageType для теста
    const fakeMessageType = {
      type: "complex_task" as const,
      subtype: null,
      confidence: 0.9,
      need_logging: false,
    };

    const hybridResult = await processor.processHybrid(
      hybridTestMessage,
      fakeMessageType,
      {
        ...testContext,
        conversationId: "test-conversation",
        context: [],
      },
      {
        ...DEFAULT_AGENT_OPTIONS,
        forceAgentMode: true,
      },
    );

    console.log(`✅ Гибридный результат:`);
    console.log(`📤 Ответ: "${hybridResult.response}"`);
    console.log(`🔧 Режим: ${hybridResult.processingMode}`);

    if (hybridResult.agentMetadata) {
      console.log(
        `🤖 Агенты: ${hybridResult.agentMetadata.agentsUsed.join(" → ")}`,
      );
      console.log(
        `📊 Качество: ${hybridResult.agentMetadata.qualityScore.toFixed(2)}`,
      );
    }
  } catch (error) {
    console.log(
      `❌ Ошибка гибридного теста: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  console.log("\n" + "=".repeat(80));
  console.log("🎉 Тестирование завершено!");
}

// Запускаем тест
if (require.main === module) {
  testAgentSystem().catch(console.error);
}

export { testAgentSystem };
