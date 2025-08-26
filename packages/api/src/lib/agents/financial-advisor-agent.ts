import { AbstractAgent } from "./base-agent";
import type { AgentTask, AgentTelemetry, AgentResult, AgentCapability } from "./types";
import { getPromptSafe, PROMPT_KEYS } from "@synoro/prompts";

export class FinancialAdvisorAgent extends AbstractAgent {
  name = "Financial Advisor";
  description = "Финансовый помощник Synoro AI: бюджет, расходы, базовые советы";
  capabilities: AgentCapability[] = [
    {
      name: "Budget Planning",
      description: "Планирование бюджета и анализ расходов/доходов",
      category: "finance",
      confidence: 0.85,
    },
    {
      name: "Savings Advice",
      description: "Советы по экономии и финансовой гигиене",
      category: "finance",
      confidence: 0.8,
    },
  ];
  constructor() {
    super("gpt-4o", 0.6);
  }

  canHandle(task: AgentTask): Promise<boolean> {
    const input = task.input.toLowerCase();
    return Promise.resolve(
      input.includes("финанс") ||
        input.includes("деньги") ||
        input.includes("бюджет") ||
        input.includes("расход") ||
        input.includes("доход") ||
        input.includes("инвестиц") ||
        input.includes("сбережен") ||
        input.includes("экономия") ||
        input.includes("планирование") ||
        input.includes("cost") ||
        input.includes("budget") ||
        input.includes("expense"),
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
      console.error("Error in FinancialAdvisorAgent:", error);
      return this.createErrorResult(
        "Извините, произошла ошибка при анализе финансов. Попробуйте описать вашу ситуацию более подробно.",
      );
    }
  }

  shouldLog(_task: AgentTask): Promise<boolean> {
    // Логируем финансовые запросы для анализа
    return Promise.resolve(true);
  }
}
