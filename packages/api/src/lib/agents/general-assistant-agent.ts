import { AbstractAgent } from "./base-agent";
import type { AgentTask, AgentTelemetry, AgentResult } from "./types";
import { getPromptSafe, PROMPT_KEYS } from "@synoro/prompts";

export class GeneralAssistantAgent extends AbstractAgent {
  name = "General Assistant";
  description = "Универсальный помощник Synoro AI для общих вопросов и задач";
  capabilities = [
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
    super("gpt-4o", 0.7);
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    // Универсальный агент может обработать любое сообщение
    return true;
  }

  async process(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<AgentResult<string>> {
    const systemPrompt = getPromptSafe(PROMPT_KEYS.ASSISTANT);

    try {
      const response = await this.generateResponse(
        task.input,
        systemPrompt,
        task,
        telemetry,
      );

      return this.createSuccessResult(response, 0.8);
    } catch (error) {
      console.error("Error in GeneralAssistantAgent:", error);
      return this.createErrorResult(
        "Извините, произошла ошибка при обработке вашего запроса. Попробуйте переформулировать вопрос.",
      );
    }
  }

  async shouldLog(task: AgentTask): Promise<boolean> {
    // Логируем только важные взаимодействия
    return task.input.length > 50 || task.context.channel === "telegram";
  }
}
