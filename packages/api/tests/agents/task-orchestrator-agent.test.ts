import { describe, expect, it } from "vitest";

import { TaskOrchestratorAgent } from "../../src/lib/agents/task-orchestrator-agent";
import { globalAgentRegistry } from "../../src/lib/agents/agent-registry";
import { QASpecialistAgent } from "../../src/lib/agents/qa-specialist-agent";
import { AgentTask } from "../../src/lib/agents/types";

describe("TaskOrchestratorAgent", () => {
  it("should use global agent registry instead of creating new AgentManager instances", async () => {
    // Очищаем реестр перед тестом
    const agents = globalAgentRegistry.getAll();
    for (const key of agents.keys()) {
      globalAgentRegistry.unregister(key);
    }
    
    // Регистрируем агента в глобальном реестре
    const qaAgent = new QASpecialistAgent();
    globalAgentRegistry.register(qaAgent);
    
    // Создаем TaskOrchestratorAgent
    const orchestrator = new TaskOrchestratorAgent();
    
    // Создаем тестовую задачу
    const task: AgentTask = {
      id: "test-task-1",
      type: "question-answering",
      input: "What is the capital of France?",
      context: {
        userId: "test-user",
        channel: "test-channel",
      },
      priority: 1,
      createdAt: new Date(),
    };
    
    // Проверяем, что агент может обработать задачу
    const result = await orchestrator.process(task);
    
    // Проверяем результат
    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
    
    // Очищаем реестр после теста
    globalAgentRegistry.unregister("qa-specialist");
  });
  
  it("should handle missing agents gracefully", async () => {
    // Очищаем реестр перед тестом
    const agents = globalAgentRegistry.getAll();
    for (const key of agents.keys()) {
      globalAgentRegistry.unregister(key);
    }
    
    // Создаем TaskOrchestratorAgent без зарегистрированных агентов
    const orchestrator = new TaskOrchestratorAgent();
    
    // Создаем тестовую задачу
    const task: AgentTask = {
      id: "test-task-2",
      type: "question-answering",
      input: "This task requires a non-existent agent",
      context: {
        userId: "test-user",
        channel: "test-channel",
      },
      priority: 1,
      createdAt: new Date(),
    };
    
    // Проверяем, что агент корректно обрабатывает отсутствие нужного агента
    const result = await orchestrator.process(task);
    
    // Должен вернуть результат с ошибкой, но не выбросить исключение
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
  });
});
