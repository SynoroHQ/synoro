import { generateText } from "ai";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { DatabaseToolsService } from "../services/database-tools-service";
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

  private databaseService: DatabaseToolsService;

  constructor() {
    super("gpt-5-nano");
    this.databaseService = new DatabaseToolsService();
  }

  canHandle(_task: AgentTask): Promise<boolean> {
    return Promise.resolve(true); // Обрабатываем все запросы через AI
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    try {
      // Получаем данные из базы для анализа
      const eventData = await this.getEventDataForAnalysis(task);

      // Получаем промпт из Langfuse облака (без переменных)
      const basePrompt = await getPrompt(
        PROMPT_KEYS.EVENT_ANALYZER_AGENT,
        "latest",
      );

      // Добавляем eventData в контекст задачи для обработки
      const taskWithEventData = {
        ...task,
        context: {
          ...task.context,
          eventContext: JSON.stringify(eventData, null, 2),
        },
      };

      // Process prompt with PromptContextService to replace all placeholders
      const processed = this.promptContextService.processPrompt(
        basePrompt,
        taskWithEventData,
        {
          maxHistoryLength: 1500,
          maxHistoryMessages: 10,
          includeSystemMessages: false,
          maxHistoryTokens: 500,
        },
      );

      if (process.env.DEBUG_PROMPTS === "true") {
        console.log("EventAnalyzerAgent prompt metadata:", processed.metadata);
      }

      const { text: response } = await generateText({
        model: this.getModel(),
        system: processed.prompt,
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

  /**
   * Получает данные событий для анализа
   */
  private async getEventDataForAnalysis(task: AgentTask): Promise<{
    events?: unknown[];
    stats?: unknown;
    totalEvents?: number;
    period?: string;
    queryType?: string;
    expenseData?: unknown;
    error?: string;
  }> {
    try {
      const householdId = task.context.householdId;
      const userId = task.context.userId;

      if (!householdId) {
        return { error: "No householdId provided" };
      }

      // Анализируем запрос для определения типа данных
      const queryType = this.analyzeQueryType(task.input);

      // Получаем события пользователя за последние 30 дней
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const events = await this.databaseService.getUserEvents({
        userId,
        householdId,
        limit: 100,
        offset: 0,
        startDate: thirtyDaysAgo.toISOString(),
        endDate: new Date().toISOString(),
      });

      // Получаем статистику событий
      const stats: unknown = await this.databaseService.getUserStats({
        userId: userId ?? undefined,
        householdId,
        startDate: thirtyDaysAgo.toISOString(),
        endDate: new Date().toISOString(),
      });

      // Если запрос о расходах, получаем детальную сводку по расходам
      let expenseData: unknown = null;
      if (queryType.isExpenseQuery) {
        expenseData = await this.databaseService.getExpenseSummary({
          userId: userId ?? undefined,
          householdId,
          startDate: queryType.startDate ?? thirtyDaysAgo.toISOString(),
          endDate: queryType.endDate ?? new Date().toISOString(),
          currency: "RUB",
        });
      }

      return {
        events: events.slice(0, 20), // Ограничиваем количество для промпта
        stats,
        totalEvents: events.length,
        period: "30 дней",
        queryType: queryType.type,
        expenseData,
      };
    } catch (error) {
      console.error("Failed to get event data for analysis:", error);
      return { error: "Failed to retrieve event data" };
    }
  }

  /**
   * Анализирует тип запроса для определения нужных данных
   */
  private analyzeQueryType(input: string): {
    type: string;
    isExpenseQuery: boolean;
    startDate?: string;
    endDate?: string;
  } {
    const inputLower = input.toLowerCase();

    // Проверяем, является ли запрос о расходах
    const isExpenseQuery =
      inputLower.includes("расход") ||
      inputLower.includes("трат") ||
      inputLower.includes("потратил") ||
      inputLower.includes("деньг") ||
      inputLower.includes("покупк");

    // Определяем период
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (
      inputLower.includes("последний месяц") ||
      inputLower.includes("за месяц")
    ) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      startDate = oneMonthAgo.toISOString();
      endDate = new Date().toISOString();
    } else if (
      inputLower.includes("последнюю неделю") ||
      inputLower.includes("за неделю")
    ) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      startDate = oneWeekAgo.toISOString();
      endDate = new Date().toISOString();
    } else if (
      inputLower.includes("последний год") ||
      inputLower.includes("за год")
    ) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      startDate = oneYearAgo.toISOString();
      endDate = new Date().toISOString();
    }

    return {
      type: isExpenseQuery ? "expense_analysis" : "general_analysis",
      isExpenseQuery,
      startDate,
      endDate,
    };
  }
}
