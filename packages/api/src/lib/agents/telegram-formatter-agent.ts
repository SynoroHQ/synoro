import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { AbstractAgent } from "./base-agent";

export class TelegramFormatterAgent extends AbstractAgent {
  name = "Telegram Formatter";
  description =
    "Агент для форматирования готовых ответов для Telegram с использованием HTML разметки. Только форматирует текст для узких окон без изменения содержимого.";
  capabilities: AgentCapability[] = [
    {
      name: "Text Formatting",
      description:
        "Форматирование готового текста для Telegram с использованием HTML без изменения содержания",
      category: "formatting",
      confidence: 0.95,
    },
    {
      name: "Telegram Response",
      description:
        "Преобразование готовых ответов в структурированный формат для узких окон Telegram",
      category: "messaging",
      confidence: 0.9,
    },
  ];

  constructor() {
    super("gpt-5-nano");
  }

  canHandle(task: AgentTask): Promise<boolean> {
    // Агент может обрабатывать задачи форматирования готовых ответов для Telegram
    const isFormattingTask =
      task.type === "telegram-formatting" ||
      task.type === "formatting" ||
      task.type === "telegram-response";

    const isTelegramChannel = task.context.channel === "telegram";

    // Участвуем для Telegram канала или задач форматирования
    return Promise.resolve(isFormattingTask || isTelegramChannel);
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    const systemPrompt = await getPrompt(PROMPT_KEYS.TELEGRAM_FORMATTER);

    try {
      const response = await this.generateResponse(
        task.input,
        systemPrompt,
        task,
        {
          useContextAnalysis: false,
          useQualityAssessment: false,
          useStructuredContext: false,
        },
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
