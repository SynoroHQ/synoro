import { generateObject } from "ai";
import { z } from "zod";

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
    super("gpt-5-mini", 0.5);
  }

  async canHandle(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<boolean> {
    try {
      // Используем AI для определения типа запроса
      const { object: requestAnalysis } = await generateObject({
        model: this.getModel(),
        schema: z.object({
          isAnalyticsRequest: z
            .boolean()
            .describe("Требует ли запрос анализа данных"),
          analyticsType: z
            .enum([
              "data_analysis",
              "statistics",
              "trends",
              "visualization",
              "metrics",
              "reporting",
              "other",
            ])
            .describe("Тип аналитического запроса"),
          confidence: z
            .number()
            .min(0)
            .max(1)
            .describe("Уверенность в классификации"),
          reasoning: z.string().describe("Обоснование классификации"),
        }),
        system: getPromptSafe(PROMPT_KEYS.DATA_ANALYST),
        prompt: `Проанализируй запрос: "${task.input}"

Определи, является ли он аналитическим и требует ли анализа данных.`,
        temperature: 0.1,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry(
            "analytics-request-detection",
            task,
            telemetry,
          ),
          metadata: { inputLength: task.input.length },
        },
      });

      return requestAnalysis.isAnalyticsRequest;
    } catch (error) {
      console.error("Error in AI analytics request detection:", error);
      // Fallback к простой проверке
      const input = task.input.toLowerCase();
      return (
        input.includes("анализ") ||
        input.includes("статистика") ||
        input.includes("данные") ||
        input.includes("отчет") ||
        input.includes("метрики") ||
        input.includes("trend") ||
        input.includes("график") ||
        input.includes("числа") ||
        input.includes("расчет")
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
