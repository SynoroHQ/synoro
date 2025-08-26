import { getPromptSafe, PROMPT_KEYS } from "@synoro/prompts";

import type {
  AgentCapability,
  AgentResult,
  AgentTask,
  AgentTelemetry,
} from "./types";
import { AbstractAgent } from "./base-agent";

export class DataAnalystAgent extends AbstractAgent {
  name = "Data Analyst";
  description =
    "Аналитик данных Synoro AI: анализ чисел, метрик, трендов и отчётов";
  capabilities: AgentCapability[] = [
    {
      name: "Data Analysis",
      description: "Интерпретация данных, метрик и трендов",
      category: "analytics",
      confidence: 0.85,
    },
    {
      name: "Visualization Advice",
      description: "Рекомендации по визуализации и отчётам",
      category: "analytics",
      confidence: 0.8,
    },
  ];
  constructor() {
    super("gpt-4o", 0.5);
  }

  canHandle(task: AgentTask): Promise<boolean> {
    const input = task.input.toLowerCase();
    return Promise.resolve(
      input.includes("анализ") ||
        input.includes("статистика") ||
        input.includes("данные") ||
        input.includes("отчет") ||
        input.includes("метрики") ||
        input.includes("trend") ||
        input.includes("график") ||
        input.includes("числа") ||
        input.includes("расчет"),
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
      return this.createSuccessResult(response, 0.85);
    } catch (err) {
      console.error("Error in DataAnalystAgent:", err);
      return this.createErrorResult(
        "Извините, произошла ошибка при анализе данных. Убедитесь, что данные корректно представлены.",
      );
    }
  }

  shouldLog(_task: AgentTask): Promise<boolean> {
    // Логируем все аналитические запросы
    return Promise.resolve(true);
  }
}
