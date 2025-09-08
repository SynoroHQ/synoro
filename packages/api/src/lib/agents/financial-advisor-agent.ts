import { generateObject, generateText, tool } from "ai";
import { z } from "zod";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { EventService } from "../services/event-service";
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
  private eventService: EventService;

  constructor() {
    super("gpt-5-mini");
    this.eventService = new EventService();
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
        system: await getPrompt(PROMPT_KEYS.FINANCIAL_ADVISOR),
        prompt: `Проанализируй запрос: "${task.input}"

Определи, является ли он финансовым и требует ли финансового совета.`,
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

  /**
   * Создает инструмент для получения финансовых событий
   */
  private getFinancialEventsTool(task: AgentTask) {
    return tool({
      description:
        "Получить финансовые события (расходы и доходы) из базы данных",
      inputSchema: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        type: z.enum(["expense"]).optional(),
        limit: z.number().optional(),
      }),
      execute: async (filters) => {
        try {
          const householdId =
            (task.context?.householdId as string) ?? "default";
          const userId = task.context?.userId;

          const events = await this.eventService.getEvents(
            {
              householdId,
              userId,
              type: filters.type,
              startDate: filters.startDate
                ? new Date(filters.startDate)
                : undefined,
              endDate: filters.endDate ? new Date(filters.endDate) : undefined,
            },
            {
              limit: filters.limit ?? 20,
              offset: 0,
            },
          );

          // Фильтруем только финансовые события
          const financialEvents = events.filter(
            (event) => event.type === "expense",
          );

          return {
            success: true,
            events: financialEvents.map((event) => ({
              id: event.id,
              type: event.type,
              title: event.title,
              amount: event.amount,
              currency: event.currency,
              occurredAt: event.occurredAt,
              category: event.properties.find((p) => p.key === "category")
                ?.value,
            })),
            totalAmount: financialEvents.reduce((sum, event) => {
              const amount = event.amount ? parseFloat(event.amount) : 0;
              return sum - amount; // только расходы
            }, 0),
          };
        } catch (error) {
          console.error("Error getting financial events:", error);
          return {
            success: false,
            error: "Не удалось получить финансовые события",
          };
        }
      },
    });
  }

  /**
   * Создает инструмент для получения финансовой статистики
   */
  private getFinancialStatsTool(task: AgentTask) {
    return tool({
      description: "Получить финансовую статистику",
      inputSchema: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
      execute: async (filters) => {
        try {
          const householdId =
            (task.context?.householdId as string) ?? "default";

          // Получаем статистику по всем событиям
          const allStats = await this.eventService.getEventStats(householdId, {
            startDate: filters.startDate
              ? new Date(filters.startDate)
              : undefined,
            endDate: filters.endDate ? new Date(filters.endDate) : undefined,
          });

          // Получаем детальную статистику по финансовым событиям
          const financialEvents = await this.eventService.getEvents(
            {
              householdId,
              userId: task.context?.userId,
              startDate: filters.startDate
                ? new Date(filters.startDate)
                : undefined,
              endDate: filters.endDate ? new Date(filters.endDate) : undefined,
            },
            { limit: 1000, offset: 0 },
          );

          const expenses = financialEvents.filter((e) => e.type === "expense");
          const income: never[] = []; // нет типа income в схеме

          const totalExpenses = expenses.reduce(
            (sum, event) => sum + (event.amount ? parseFloat(event.amount) : 0),
            0,
          );
          const totalIncome = 0; // нет типа income в схеме

          return {
            success: true,
            stats: {
              totalEvents: allStats.total,
              totalExpenses,
              totalIncome,
              netIncome: totalIncome - totalExpenses,
              expenseCount: expenses.length,
              incomeCount: income.length,
              averageExpense:
                expenses.length > 0 ? totalExpenses / expenses.length : 0,
              averageIncome:
                income.length > 0 ? totalIncome / income.length : 0,
              byType: allStats.byType,
            },
          };
        } catch (error) {
          console.error("Error getting financial stats:", error);
          return {
            success: false,
            error: "Не удалось получить финансовую статистику",
          };
        }
      },
    });
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    const systemPrompt = await getPrompt(PROMPT_KEYS.FINANCIAL_ADVISOR);

    try {
      const { text } = await generateText({
        model: this.getModel(),
        system: systemPrompt,
        prompt: task.input,
        tools: {
          getFinancialEvents: this.getFinancialEventsTool(task),
          getFinancialStats: this.getFinancialStatsTool(task),
        },
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("financial-advisor", task),
        },
      });

      return this.createSuccessResult(text, 0.85);
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
