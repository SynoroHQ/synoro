import { generateObject } from "ai";
import { z } from "zod";

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

  async canHandle(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<boolean> {
    try {
      // Используем AI для определения типа сообщения для чата
      const { object: chatAnalysis } = await generateObject({
        model: this.getModel(),
        schema: z.object({
          isChatMessage: z
            .boolean()
            .describe("Является ли сообщение обычным общением"),
          chatType: z
            .enum([
              "greeting",
              "farewell",
              "gratitude",
              "casual_chat",
              "small_talk",
              "other",
            ])
            .describe("Тип сообщения для чата"),
          confidence: z
            .number()
            .min(0)
            .max(1)
            .describe("Уверенность в классификации"),
          reasoning: z.string().describe("Обоснование классификации"),
        }),
        system: getPromptSafe(PROMPT_KEYS.CHAT_ASSISTANT),
        prompt: `Проанализируй сообщение: "${task.input}"

Определи, является ли это обычным общением для чата.`,
        temperature: 0.1,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("chat-message-detection", task, telemetry),
          metadata: { inputLength: task.input.length },
        },
      });

      return chatAnalysis.isChatMessage;
    } catch (error) {
      console.error("Error in AI chat message detection:", error);
      // Fallback к простой проверке
      const input = task.input.toLowerCase();
      return (
        input.includes("привет") ||
        input.includes("здравствуй") ||
        input.includes("спасибо") ||
        input.includes("как ты") ||
        input.includes("hello") ||
        input.includes("hi") ||
        input.includes("thanks") ||
        input.includes("bye") ||
        input.includes("how are you") ||
        input.length < 20
      );
    }
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
