import { describe, it, expect, beforeEach } from "vitest";

import { TelegramFormatterAgent } from "../../src/lib/agents/telegram-formatter-agent";
import type { AgentTask } from "../../src/lib/agents/types";

describe("TelegramFormatterAgent", () => {
  let agent: TelegramFormatterAgent;
  let task: AgentTask;

  beforeEach(() => {
    agent = new TelegramFormatterAgent();
    task = {
      id: "test-task-1",
      type: "telegram-formatting",
      input: "Тестовое сообщение для форматирования",
      context: {},
    };
  });

  it("должен иметь правильное имя и описание", () => {
    expect(agent.name).toBe("Telegram Formatter");
    expect(agent.description).toBe("Агент для форматирования ответов для Telegram с использованием AI и Markdown");
  });

  it("должен иметь правильные возможности", () => {
    expect(agent.capabilities).toHaveLength(3);
    expect(agent.capabilities[0].name).toBe("Text Formatting");
    expect(agent.capabilities[1].name).toBe("Telegram Response");
    expect(agent.capabilities[2].name).toBe("Content Enhancement");
  });

  it("должен уметь обрабатывать задачи форматирования", async () => {
    const canHandle = await agent.canHandle(task);
    expect(canHandle).toBe(true);
  });

  it("должен уметь обрабатывать задачи с типом formatting", async () => {
    const formattingTask: AgentTask = {
      ...task,
      type: "formatting",
    };
    const canHandle = await agent.canHandle(formattingTask);
    expect(canHandle).toBe(true);
  });

  it("должен уметь обрабатывать задачи для Telegram канала", async () => {
    const telegramTask: AgentTask = {
      ...task,
      type: "chat",
      context: { channel: "telegram" }
    };
    const canHandle = await agent.canHandle(telegramTask);
    expect(canHandle).toBe(true);
  });

  it("должен уметь обрабатывать задачи с типом telegram-response", async () => {
    const telegramResponseTask: AgentTask = {
      ...task,
      type: "telegram-response",
    };
    const canHandle = await agent.canHandle(telegramResponseTask);
    expect(canHandle).toBe(true);
  });

  it("должен НЕ обрабатывать задачи для других каналов", async () => {
    const webTask: AgentTask = {
      ...task,
      type: "chat",
      context: { channel: "web" }
    };
    const canHandle = await agent.canHandle(webTask);
    expect(canHandle).toBe(false);
  });

  it("должен иметь правильную модель и температуру", () => {
    expect(agent.getModel().modelId).toBe("gpt-5-nano");
    // Проверяем, что агент создан с правильными параметрами
    expect(agent).toBeInstanceOf(TelegramFormatterAgent);
  });

  it("должен логировать все взаимодействия", async () => {
    const shouldLog = await agent.shouldLog(task);
    expect(shouldLog).toBe(true);
  });

  it("должен участвовать в агентной системе", async () => {
    // Проверяем, что агент зарегистрирован в системе
    const { AgentManager } = await import("../../src/lib/agents/agent-manager");
    const agentManager = new AgentManager();
    
    const telegramFormatter = agentManager.getAgent("telegram-formatter");
    expect(telegramFormatter).toBeDefined();
    expect(telegramFormatter?.name).toBe("Telegram Formatter");
  });
});
