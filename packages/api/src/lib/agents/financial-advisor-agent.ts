import { generateObject } from "ai";
import { z } from "zod";

import { getPromptSafe, PROMPT_KEYS } from "@synoro/prompts";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { AbstractAgent } from "./base-agent";

export class FinancialAdvisorAgent extends AbstractAgent {
  name = "Financial Advisor";
  description =
    "Финансовый помощник Synoro AI: бюджет, расходы, базовые советы";
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
    super("gpt-5-mini", 0.6);
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    try {
      // Используем AI для определения типа финансового запроса
      const { object: financialAnalysis } = await generateObject({
        model: this.getModel(),
        schema: z.object({
          isFinancialRequest: z
            .boolean()
            .describe("Требует ли запрос финансового совета"),
          financialType: z
            .enum([
              "budget_planning",
              "expense_analysis",
              "savings_advice",
              "investment_advice",
              "financial_planning",
              "other",
            ])
            .describe("Тип финансового запроса"),
          confidence: z
            .number()
            .min(0)
            .max(1)
            .describe("Уверенность в классификации"),
          reasoning: z.string().describe("Обоснование классификации"),
        }),
        system: getPromptSafe(PROMPT_KEYS.FINANCIAL_ADVISOR),
        prompt: `Проанализируй запрос: "${task.input}"

Определи, является ли он финансовым и требует ли финансового совета.`,
        temperature: 0.1,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("financial-request-detection", task),
          metadata: { inputLength: task.input.length },
        },
      });

      return financialAnalysis.isFinancialRequest;
    } catch (error) {
      console.error("Error in AI financial request detection:", error);
      throw new Error("Ошибка определения типа финансового запроса");
    }
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    const systemPrompt = getPromptSafe(PROMPT_KEYS.ASSISTANT);

    try {
      const response = await this.generateResponse(
        task.input,
        systemPrompt,
        task,
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
