import { describe, it, expect, beforeEach, vi } from "vitest";

import { TelegramFormatterAgent } from "../../src/lib/agents/telegram-formatter-agent";
import type { AgentTask } from "../../src/lib/agents/types";

// Мокаем зависимости
vi.mock("@synoro/prompts", async () => {
  return {
    getPromptSafe: () => "Тестовый промпт для форматирования",
    PROMPT_KEYS: {
      TELEGRAM_FORMATTER: "telegram-formatter",
    },
  };
});

vi.mock("../../src/lib/agents/base-agent", async () => {
  const actual = await vi.importActual("../../src/lib/agents/base-agent");
  return {
    ...actual,
    AbstractAgent: class extends actual.AbstractAgent {
      async generateResponse() {
        return "Отформатированный ответ для Telegram";
      }
    },
  };
});

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

  it("должен форматировать ответы для Telegram", async () => {
    const result = await agent.process(task);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("Отформатированный ответ для Telegram");
      expect(result.confidence).toBe(0.9);
    }
  });

  it("должен возвращать ошибку при сбое форматирования", async () => {
    // Переопределяем метод generateResponse для симуляции ошибки
    agent.generateResponse = vi.fn().mockRejectedValue(new Error("Ошибка форматирования"));
    
    const result = await agent.process(task);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Извините, произошла ошибка при форматировании ответа для Telegram.");
    }
  });

  it("должен логировать все взаимодействия", async () => {
    const shouldLog = await agent.shouldLog(task);
    expect(shouldLog).toBe(true);
  });
});
