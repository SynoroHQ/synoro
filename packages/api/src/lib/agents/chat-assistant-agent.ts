import { generateObject } from "ai";
import { z } from "zod";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

import type { AgentResult, AgentTask } from "./types";
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
    super("gpt-5"); // Temperature removed
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    try {
      // Добавляем историю сообщений в промпт, если она есть
      const historyContext =
        task.messageHistory && task.messageHistory.length > 0
          ? `\n\nИСТОРИЯ ДИАЛОГА:\n${this.formatMessageHistory(task, 1000)}`
          : "";

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
        system: await getPrompt(PROMPT_KEYS.CHAT_ASSISTANT),
        prompt: `Проанализируй сообщение: "${task.input}"${historyContext}

Определи, является ли это обычным общением для чата.`,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("chat-message-detection", task),
          metadata: {
            inputLength: task.input.length,
            hasHistory: Boolean(
              task.messageHistory && task.messageHistory.length > 0,
            ),
            historyLength: task.messageHistory?.length || 0,
          },
        },
      });

      return chatAnalysis.isChatMessage;
    } catch (error) {
      console.error("Error in AI chat message detection:", error);
      throw new Error("Ошибка определения типа сообщения для чата");
    }
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    const systemPrompt = await getPrompt(PROMPT_KEYS.CHAT_ASSISTANT);

    try {
      const response = await this.generateResponse(
        task.input,
        systemPrompt,
        task,
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
