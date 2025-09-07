import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { AbstractAgent } from "./base-agent";

export class GeneralAssistantAgent extends AbstractAgent {
  name = "General Assistant";
  description = "Универсальный помощник Synoro AI для общих вопросов и задач";
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

  canHandle(_task: AgentTask): Promise<boolean> {
    // Универсальный агент может обработать любое сообщение
    return Promise.resolve(true);
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    const systemPrompt = await getPrompt(PROMPT_KEYS.ASSISTANT);

    try {
      // Используем историю сообщений для лучшего понимания контекста
      const response = await this.generateResponse(
        task.input,
        this.createPromptWithHistory(systemPrompt, task, {
          includeSummary: true,
        }),
        task,
      );

      return this.createSuccessResult(response, 0.8);
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
