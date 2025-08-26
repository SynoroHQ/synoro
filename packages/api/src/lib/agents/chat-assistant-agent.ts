import { getPromptSafe, PROMPT_KEYS } from "@synoro/prompts";

import type { AgentResult, AgentTask, AgentTelemetry } from "./types";
import { AbstractAgent } from "./base-agent";

export class ChatAssistantAgent extends AbstractAgent {
  name = "Chat Assistant";
  description = "Дружелюбный чат-ассистент Synoro AI для casual-общения";
  capabilities = [
    {
      name: "Small Talk",
      description: "Приветствия, прощания, поддержка коротких бесед",
      category: "chat",
      confidence: 0.9,
    },
    {
      name: "Empathy",
      description: "Вежливость, эмпатия и поддержка",
      category: "chat",
      confidence: 0.85,
    },
  ];
  constructor() {
    super("gpt-5o", 0.8);
  }

  canHandle(task: AgentTask): Promise<boolean> {
    const input = task.input.toLowerCase();
    return Promise.resolve(
      input.includes("привет") ||
        input.includes("здравствуй") ||
        input.includes("спасибо") ||
        input.includes("как ты") ||
        input.includes("hello") ||
        input.includes("hi") ||
        input.includes("thanks") ||
        input.includes("bye") ||
        input.includes("how are you") ||
        input.length < 20, // Короткие сообщения обычно для общения
    );
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
      console.error("Error in ChatAssistantAgent:", error);
      return this.createErrorResult(
        "Привет! Извините, у меня возникли технические сложности. Как дела?",
      );
    }
  }

  shouldLog(task: AgentTask): Promise<boolean> {
    // Логируем только важные или длинные сообщения
    return Promise.resolve(task.input.length > 30);
  }
}
