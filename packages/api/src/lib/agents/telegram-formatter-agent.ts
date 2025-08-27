import { getPromptSafe, PROMPT_KEYS } from "@synoro/prompts";

import type {
  AgentCapability,
  AgentResult,
  AgentTask,
  AgentTelemetry,
} from "./types";
import { AbstractAgent } from "./base-agent";

export class TelegramFormatterAgent extends AbstractAgent {
  name = "Telegram Formatter";
  description = "Агент для форматирования ответов для Telegram с использованием AI и Markdown";
  capabilities: AgentCapability[] = [
    {
      name: "Text Formatting",
      description: "Форматирование текста для Telegram с использованием Markdown",
      category: "formatting",
      confidence: 0.95,
    },
    {
      name: "Telegram Response",
      description: "Создание структурированных ответов для Telegram",
      category: "messaging",
      confidence: 0.9,
    },
    {
      name: "Content Enhancement",
      description: "Улучшение читабельности контента с эмодзи и структурой",
      category: "content",
      confidence: 0.85,
    },
  ];

  constructor() {
    super("gpt-5-nano", 0.3);
  }

  canHandle(_task: AgentTask): Promise<boolean> {
    // Агент может обрабатывать задачи форматирования
    return Promise.resolve(true);
  }

  async process(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<AgentResult<string>> {
    const systemPrompt = getPromptSafe(PROMPT_KEYS.TELEGRAM_FORMATTER);

    try {
      const response = await this.generateResponse(
        task.input,
        systemPrompt,
        task,
        telemetry,
      );

      return this.createSuccessResult(response, 0.9);
    } catch (error) {
      console.error("Error in TelegramFormatterAgent:", error);
      return this.createErrorResult(
        "Извините, произошла ошибка при форматировании ответа для Telegram.",
      );
    }
  }

  shouldLog(_task: AgentTask): Promise<boolean> {
    // Логируем все взаимодействия с агентом форматирования
    return Promise.resolve(true);
  }
}
