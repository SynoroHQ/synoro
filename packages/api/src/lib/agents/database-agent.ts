import type {
  EventWithDetails,
  ExpenseSummary,
  SearchResult,
  UserStats,
} from "@synoro/prompts/tools/database-tools";

import type { AgentContext } from "./agent-context";
import type { AgentResult, AgentTask, AgentTelemetry } from "./types";
import { AbstractAgent } from "./base-agent";
import { DatabaseToolsHandler } from "./database-tools-handler";

/**
 * Агент для работы с базой данных
 * Специализируется на получении информации о делах и событиях пользователя
 */
export class DatabaseAgent extends AbstractAgent {
  name = "Database Agent";
  description =
    "Агент для получения информации о делах и событиях пользователя из базы данных";

  capabilities = [
    {
      name: "User Events Retrieval",
      description: "Получение событий пользователя с фильтрацией",
      category: "database",
      confidence: 0.95,
    },
    {
      name: "Event Details",
      description: "Получение детальной информации о событиях",
      category: "database",
      confidence: 0.95,
    },
    {
      name: "User Statistics",
      description: "Получение статистики по событиям пользователя",
      category: "database",
      confidence: 0.9,
    },
    {
      name: "Event Search",
      description: "Поиск событий по тексту",
      category: "database",
      confidence: 0.9,
    },
    {
      name: "Recent Events",
      description: "Получение недавних событий",
      category: "database",
      confidence: 0.95,
    },
    {
      name: "Upcoming Tasks",
      description: "Получение предстоящих задач",
      category: "database",
      confidence: 0.9,
    },
    {
      name: "Expense Analysis",
      description: "Анализ расходов пользователя",
      category: "database",
      confidence: 0.85,
    },
  ];

  private databaseToolsHandler: DatabaseToolsHandler;

  constructor() {
    super("gpt-4o-mini");
    this.databaseToolsHandler = new DatabaseToolsHandler();
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    // Агент может обрабатывать задачи, связанные с получением данных из БД
    const keywords = [
      "события",
      "дела",
      "задачи",
      "расходы",
      "статистика",
      "история",
      "events",
      "tasks",
      "expenses",
      "stats",
      "history",
      "recent",
      "показать",
      "найти",
      "получить",
      "посмотреть",
      "анализ",
      "show",
      "find",
      "get",
      "view",
      "analyze",
    ];

    const input = task.input.toLowerCase();
    return keywords.some((keyword) => input.includes(keyword));
  }

  async process(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<AgentResult> {
    try {
      console.log(`🗄️ [DATABASE AGENT] Обработка запроса: ${task.input}`);

      // Анализируем запрос и определяем, какие tools использовать
      const toolCalls = await this.analyzeAndPlanTools(task, task.context);

      if (toolCalls.length === 0) {
        return {
          success: false,
          error: "Не удалось определить подходящие tools для запроса",
          data: null,
        };
      }

      // Выполняем tools
      const results = await this.executeTools(toolCalls);

      // Формируем ответ на основе результатов
      const response = await this.formatResponse(
        task.input,
        results,
        task.context,
      );

      return {
        success: true,
        data: {
          response,
          toolResults: results,
        },
      };
    } catch (error) {
      console.error("Error in DatabaseAgent.process:", error);
      return {
        success: false,
        error: `Ошибка при обработке запроса: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        data: null,
      };
    }
  }

  /**
   * Анализирует запрос и планирует использование tools
   */
  private async analyzeAndPlanTools(
    task: AgentTask,
    context: AgentContext,
  ): Promise<{ tool: string; parameters: Record<string, unknown> }[]> {
    const input = task.input.toLowerCase();
    const tools: { tool: string; parameters: Record<string, unknown> }[] = [];

    // Извлекаем householdId и userId из контекста
    const householdId = context.householdId || "default";
    const userId = context.userId;

    if (!userId) {
      throw new Error("User ID не найден в контексте");
    }

    // Анализируем запрос и определяем нужные tools
    if (input.includes("статистика") || input.includes("stats")) {
      tools.push({
        tool: "get_user_stats",
        parameters: {
          userId,
          householdId,
        },
      });
    }

    if (input.includes("недавн") || input.includes("recent")) {
      const days = this.extractDays(input) || 7;
      tools.push({
        tool: "get_recent_events",
        parameters: {
          userId,
          householdId,
          days,
        },
      });
    }

    if (
      input.includes("предстоящ") ||
      input.includes("upcoming") ||
      input.includes("задач")
    ) {
      const days = this.extractDays(input) || 7;
      tools.push({
        tool: "get_upcoming_tasks",
        parameters: {
          userId,
          householdId,
          days,
        },
      });
    }

    if (input.includes("расход") || input.includes("expense")) {
      tools.push({
        tool: "get_expense_summary",
        parameters: {
          userId,
          householdId,
        },
      });
    }

    if (
      input.includes("найди") ||
      input.includes("поиск") ||
      input.includes("search")
    ) {
      const searchQuery = this.extractSearchQuery(input);
      if (searchQuery) {
        tools.push({
          tool: "search_events",
          parameters: {
            userId,
            householdId,
            query: searchQuery,
          },
        });
      }
    }

    // Если не найдено специфических запросов, получаем общие события
    if (tools.length === 0) {
      tools.push({
        tool: "get_user_events",
        parameters: {
          userId,
          householdId,
          limit: 10,
        },
      });
    }

    return tools;
  }

  /**
   * Выполняет tools и собирает результаты
   */
  private async executeTools(
    toolCalls: { tool: string; parameters: Record<string, unknown> }[],
  ): Promise<{ tool: string; result: unknown }[]> {
    const results = [];

    for (const toolCall of toolCalls) {
      try {
        const result = await this.databaseToolsHandler.executeTool(
          toolCall.tool,
          toolCall.parameters,
        );
        results.push({
          tool: toolCall.tool,
          result,
        });
      } catch (error) {
        console.error(`Error executing tool ${toolCall.tool}:`, error);
        results.push({
          tool: toolCall.tool,
          result: { error: `Ошибка выполнения tool: ${error}` },
        });
      }
    }

    return results;
  }

  /**
   * Форматирует ответ на основе результатов tools
   */
  private async formatResponse(
    input: string,
    results: { tool: string; result: unknown }[],
    context: AgentContext,
  ): Promise<string> {
    let response = "";

    for (const { tool, result } of results) {
      switch (tool) {
        case "get_user_events":
          response += this.formatEventsResponse(
            result as EventWithDetails[],
            "События",
          );
          break;

        case "get_user_stats":
          response += this.formatStatsResponse(result as UserStats);
          break;

        case "get_recent_events":
          response += this.formatEventsResponse(
            result as EventWithDetails[],
            "Недавние события",
          );
          break;

        case "get_upcoming_tasks":
          response += this.formatEventsResponse(
            result as EventWithDetails[],
            "Предстоящие задачи",
          );
          break;

        case "search_events":
          response += this.formatSearchResponse(result as SearchResult);
          break;

        case "get_expense_summary":
          response += this.formatExpenseResponse(result as ExpenseSummary);
          break;

        default:
          response += `Результат ${tool}: ${JSON.stringify(result, null, 2)}\n\n`;
      }
    }

    return response.trim();
  }

  /**
   * Форматирует ответ со списком событий
   */
  private formatEventsResponse(
    events: EventWithDetails[],
    title: string,
  ): string {
    if (!events || events.length === 0) {
      return `${title}: События не найдены.\n\n`;
    }

    let response = `## ${title}\n\n`;

    events.forEach((event, index) => {
      response += `${index + 1}. **${event.title || "Без названия"}**\n`;
      response += `   - Тип: ${event.type}\n`;
      response += `   - Статус: ${event.status}\n`;
      response += `   - Приоритет: ${event.priority}\n`;
      response += `   - Дата: ${new Date(event.occurredAt).toLocaleDateString("ru-RU")}\n`;

      if (event.amount) {
        response += `   - Сумма: ${event.amount} ${event.currency}\n`;
      }

      if (event.notes) {
        response += `   - Заметки: ${event.notes}\n`;
      }

      if (event.tags && Array.isArray(event.tags) && event.tags.length > 0) {
        const tagNames = event.tags
          .filter(
            (tag: any) =>
              tag && typeof tag === "object" && tag.name !== undefined,
          )
          .map((tag: any) => String(tag.name || "unknown"))
          .join(", ");

        if (tagNames) {
          response += `   - Теги: ${tagNames}\n`;
        }
      }

      response += "\n";
    });

    return response;
  }

  /**
   * Безопасно форматирует число с двумя знаками после запятой
   */
  private safeFormatNumber(value: unknown, fallback: string = "N/A"): string {
    if (typeof value === "number" && isFinite(value)) {
      return value.toFixed(2);
    }
    return fallback;
  }

  /**
   * Форматирует ответ со статистикой
   */
  private formatStatsResponse(stats: UserStats): string {
    let response = "## Статистика\n\n";

    response += `- **Всего событий**: ${stats.total}\n`;

    // Отображаем статистику по валютам
    if (stats.byCurrency && Object.keys(stats.byCurrency).length > 0) {
      response += "**По валютам:**\n";
      Object.entries(stats.byCurrency).forEach(
        ([currency, data]: [string, any]) => {
          const totalAmount = this.safeFormatNumber(data?.totalAmount, "0.00");
          const averageAmount = this.safeFormatNumber(
            data?.averageAmount,
            "0.00",
          );
          const count = typeof data?.count === "number" ? data.count : "N/A";
          response += `- ${currency}: ${totalAmount} (среднее: ${averageAmount}, количество: ${count})\n`;
        },
      );
      response += "\n";
    }

    if (stats.byType && Object.keys(stats.byType).length > 0) {
      response += "**По типам:**\n";
      Object.entries(stats.byType).forEach(([type, count]) => {
        response += `- ${type}: ${count}\n`;
      });
      response += "\n";
    }

    if (stats.byStatus && Object.keys(stats.byStatus).length > 0) {
      response += "**По статусам:**\n";
      Object.entries(stats.byStatus).forEach(([status, count]) => {
        response += `- ${status}: ${count}\n`;
      });
      response += "\n";
    }

    return response;
  }

  /**
   * Форматирует ответ поиска
   */
  private formatSearchResponse(searchResult: SearchResult): string {
    let response = `## Результаты поиска по запросу "${searchResult.query}"\n\n`;
    response += `Найдено: ${searchResult.total} событий\n\n`;

    if (searchResult.events && searchResult.events.length > 0) {
      response += this.formatEventsResponse(searchResult.events, "");
    } else {
      response += "События не найдены.\n";
    }

    return response;
  }

  /**
   * Форматирует ответ по расходам
   */
  private formatExpenseResponse(expense: ExpenseSummary): string {
    let response = "## Анализ расходов\n\n";

    const totalAmount = this.safeFormatNumber(expense?.totalAmount, "0.00");
    const currency = expense?.currency || "N/A";
    response += `- **Общая сумма**: ${totalAmount} ${currency}\n\n`;

    if (expense.topCategories && expense.topCategories.length > 0) {
      response += "**Топ категории:**\n";
      expense.topCategories.forEach((category: any, index: number) => {
        const amount = this.safeFormatNumber(category?.amount, "0.00");
        const currency = expense?.currency || "N/A";
        const count =
          typeof category?.count === "number" ? category.count : "N/A";
        response += `${index + 1}. ${category?.category || "N/A"}: ${amount} ${currency} (${count} операций)\n`;
      });
      response += "\n";
    }

    return response;
  }

  /**
   * Извлекает количество дней из текста
   */
  private extractDays(input: string): number | null {
    const match = /(\d+)\s*(дн|день|дней|days?)/i.exec(input);
    return match ? parseInt(match[1] ?? "0") : null;
  }

  /**
   * Извлекает поисковый запрос из текста
   */
  private extractSearchQuery(input: string): string | null {
    // Простая логика извлечения поискового запроса
    const searchPatterns = [/найди\s+(.+)/i, /поиск\s+(.+)/i, /search\s+(.+)/i];

    for (const pattern of searchPatterns) {
      const match = pattern.exec(input);
      if (match) {
        return match[1]?.trim() ?? null;
      }
    }

    return null;
  }
}
