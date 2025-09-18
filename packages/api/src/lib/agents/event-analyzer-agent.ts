import { generateText } from "ai";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { AbstractAgent } from "./base-agent";

/**
 * Агент для анализа событий и предоставления статистики
 * Основная задача - анализ данных и генерация отчетов
 */
export class EventAnalyzerAgent extends AbstractAgent {
  name = "Event Analyzer";
  description = "Агент для анализа событий и предоставления статистики";

  capabilities: AgentCapability[] = [
    {
      name: "Data Analysis",
      description: "Анализ данных событий и генерация отчетов",
      category: "analysis",
      confidence: 0.9,
    },
    {
      name: "Statistics",
      description: "Предоставление статистической информации по событиям",
      category: "analysis",
      confidence: 0.85,
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
        PROMPT_KEYS.EVENT_ANALYZER_AGENT,
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
          ...this.createTelemetry("event-analysis", task),
        },
      });

      return this.createSuccessResult(response, 0.9);
    } catch (error) {
      console.error("Error in EventAnalyzerAgent:", error);
      return this.createErrorResult(
        "Извините, произошла ошибка при анализе данных",
      );
    }
  }

  shouldLog(_task: AgentTask): Promise<boolean> {
    return Promise.resolve(true);
  }
}
