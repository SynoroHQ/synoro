import { AbstractAgent } from "./base-agent";
import type { AgentTask, AgentTelemetry, AgentResult, AgentCapability } from "./types";
import { getPromptSafe, PROMPT_KEYS } from "@synoro/prompts";

export class DataAnalystAgent extends AbstractAgent {
  name = "Data Analyst";
  description = "Специалист по анализу данных и статистики в Synoro AI";
  capabilities: AgentCapability[] = [
    {
      name: "Data Analysis",
      description: "Анализ данных, метрик и трендов",
      category: "analysis",
      confidence: 0.85,
    },
    {
      name: "Visualization Advice",
      description: "Рекомендации по визуализации и отчетам",
      category: "analysis",
      confidence: 0.8,
    },
  ];
  constructor() {
    super("gpt-4o", 0.5);
  }

  async canHandle(task: AgentTask): Promise<boolean> {
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
    } catch (error) {
      console.error("Error in DataAnalystAgent:", error);
      return this.createErrorResult(
        "Извините, произошла ошибка при анализе данных. Убедитесь, что данные корректно представлены.",
      );
    }
  }

  async shouldLog(task: AgentTask): Promise<boolean> {
    // Логируем все аналитические запросы
    return true;
  }
}
