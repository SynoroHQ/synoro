import { generateText } from "ai";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { AbstractAgent } from "./base-agent";

/**
 * Упрощенный агент для обработки и логирования событий
 * Основная задача - сохранять события и предоставлять информацию о них
 */
export class EventProcessorAgent extends AbstractAgent {
  name = "Event Processor";
  description = "Агент для логирования событий и предоставления информации";

  capabilities: AgentCapability[] = [
    {
      name: "Event Logging",
      description: "Логирование и сохранение событий в базу данных",
      category: "event",
      confidence: 0.95,
    },
    {
      name: "Event Information",
      description: "Предоставление информации о сохраненных событиях",
      category: "event",
      confidence: 0.9,
    },
  ];

  constructor() {
    super("gpt-5-nano");
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    return true; // Обрабатываем все запросы через AI
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    try {
      // Получаем промпт из Langfuse облака
      const systemPrompt = await getPrompt(
        PROMPT_KEYS.EVENT_PROCESSOR_AGENT,
        "latest",
        {
          userId: task.context?.userId || "Неизвестен",
          householdId: task.context?.householdId || "Неизвестно",
          currentTime: new Date().toLocaleString("ru-RU"),
        },
      );

      const { text: response } = await generateText({
        model: this.getModel(),
        system: systemPrompt,
        prompt: task.input,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("event-processing", task),
        },
      });

      return this.createSuccessResult(response, 0.95);
    } catch (error) {
      console.error("Error in EventProcessorAgent:", error);
      return this.createErrorResult(
        "Извините, произошла ошибка при обработке события",
      );
    }
  }

  shouldLog(_task: AgentTask): Promise<boolean> {
    // Логируем все события для отслеживания
    return Promise.resolve(true);
  }
}
