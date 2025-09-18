import { generateText } from "ai";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { AbstractAgent } from "./base-agent";

export class GeneralAssistantAgent extends AbstractAgent {
  name = "General Assistant";
  description =
    "Универсальный помощник для общего общения и ответов на вопросы";
  capabilities: AgentCapability[] = [
    {
      name: "General Help",
      description: "Ответы на общие вопросы и повседневные задачи",
      category: "general",
      confidence: 0.85,
    },
    {
      name: "Conversation",
      description: "Дружелюбная беседа и поддержка общения",
      category: "chat",
      confidence: 0.8,
    },
    {
      name: "Basic Q&A",
      description: "Базовые ответы без спец. экспертизы",
      category: "question",
      confidence: 0.75,
    },
  ];

  constructor() {
    super("gpt-5-mini");
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    return true; // Обрабатываем все запросы через AI
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    try {
      // Получаем промпт из Langfuse облака
      const systemPrompt = await getPrompt(
        PROMPT_KEYS.GENERAL_ASSISTANT_AGENT,
        "latest",
        {
          userId: task.context?.userId || "Неизвестен",
          householdId: task.context?.householdId || "Неизвестно",
          currentTime: new Date().toLocaleString("ru-RU"),
        },
      );

      const { text } = await generateText({
        model: this.getModel(),
        system: systemPrompt,
        prompt: task.input,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("general-assistant", task),
        },
      });

      return this.createSuccessResult(text, 0.8);
    } catch (error) {
      console.error("Error in GeneralAssistantAgent:", error);
      return this.createErrorResult(
        "Извините, произошла ошибка при обработке вашего запроса. Попробуйте переформулировать вопрос.",
      );
    }
  }

  shouldLog(task: AgentTask): Promise<boolean> {
    // Логируем только важные взаимодействия
    return Promise.resolve(
      task.input.length > 50 || task.context.channel === "telegram",
    );
  }
}
