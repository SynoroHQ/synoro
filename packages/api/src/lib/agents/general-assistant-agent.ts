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
    super("gpt-5");
  }

  canHandle(_task: AgentTask): Promise<boolean> {
    return Promise.resolve(true); // Обрабатываем все запросы через AI
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    try {
      // Get prompt from Langfuse cloud (without variables if USE_PROMPT_CONTEXT_SERVICE is enabled)
      const basePrompt = await getPrompt(
        PROMPT_KEYS.GENERAL_ASSISTANT_AGENT,
        "latest",
      );

      // Process prompt with PromptContextService to replace all placeholders
      const processed = this.promptContextService.processPrompt(
        basePrompt,
        task,
        {
          maxHistoryLength: 1500,
          maxHistoryMessages: 10,
          includeSystemMessages: false,
          maxHistoryTokens: 500,
        },
      );

      if (process.env.DEBUG_PROMPTS === "true") {
        console.log(
          "GeneralAssistantAgent prompt metadata:",
          processed.metadata,
        );
      }

      const { text } = await generateText({
        model: this.getModel(),
        system: processed.prompt,
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
    // Log important interactions
    return Promise.resolve(
      task.input.length > 50 || task.context.channel === "telegram",
    );
  }
}
