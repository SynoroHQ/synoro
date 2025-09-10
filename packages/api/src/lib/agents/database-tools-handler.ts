import { TRPCError } from "@trpc/server";

import type {
  EventWithDetails,
  ExpenseSummary,
  GetEventByIdInput,
  GetExpenseSummaryInput,
  GetRecentEventsInput,
  GetUpcomingTasksInput,
  GetUserEventsInput,
  GetUserStatsInput,
  SearchEventsInput,
  SearchResult,
  UserStats,
} from "@synoro/prompts/tools/database-tools";

import { DatabaseToolsService } from "../services/database-tools-service";

/**
 * Обработчик database tools для мультиагентов
 * Предоставляет методы для выполнения запросов к базе данных
 */
export class DatabaseToolsHandler {
  private databaseToolsService: DatabaseToolsService;

  constructor() {
    this.databaseToolsService = new DatabaseToolsService();
  }

  /**
   * Выполнить tool по имени с параметрами
   */
  async executeTool(
    toolName: string,
    parameters: Record<string, unknown>,
  ): Promise<unknown> {
    try {
      switch (toolName) {
        case "get_user_events":
          return await this.getUserEvents(parameters as GetUserEventsInput);

        case "get_event_by_id":
          return await this.getEventById(parameters as GetEventByIdInput);

        case "get_user_stats":
          return await this.getUserStats(parameters as GetUserStatsInput);

        case "search_events":
          return await this.searchEvents(parameters as SearchEventsInput);

        case "get_recent_events":
          return await this.getRecentEvents(parameters as GetRecentEventsInput);

        case "get_upcoming_tasks":
          return await this.getUpcomingTasks(
            parameters as GetUpcomingTasksInput,
          );

        case "get_expense_summary":
          return await this.getExpenseSummary(
            parameters as GetExpenseSummaryInput,
          );

        default:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Неизвестный tool: ${toolName}`,
          });
      }
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Ошибка при выполнении tool ${toolName}`,
      });
    }
  }

  /**
   * Получить события пользователя
   */
  private async getUserEvents(
    input: GetUserEventsInput,
  ): Promise<EventWithDetails[]> {
    return await this.databaseToolsService.getUserEvents(input);
  }

  /**
   * Получить событие по ID
   */
  private async getEventById(
    input: GetEventByIdInput,
  ): Promise<EventWithDetails | null> {
    return await this.databaseToolsService.getEventById(input);
  }

  /**
   * Получить статистику пользователя
   */
  private async getUserStats(input: GetUserStatsInput): Promise<UserStats> {
    return await this.databaseToolsService.getUserStats(input);
  }

  /**
   * Поиск событий
   */
  private async searchEvents(input: SearchEventsInput): Promise<SearchResult> {
    return await this.databaseToolsService.searchEvents(input);
  }

  /**
   * Получить недавние события
   */
  private async getRecentEvents(
    input: GetRecentEventsInput,
  ): Promise<EventWithDetails[]> {
    return await this.databaseToolsService.getRecentEvents(input);
  }

  /**
   * Получить предстоящие задачи
   */
  private async getUpcomingTasks(
    input: GetUpcomingTasksInput,
  ): Promise<EventWithDetails[]> {
    return await this.databaseToolsService.getUpcomingTasks(input);
  }

  /**
   * Получить сводку по расходам
   */
  private async getExpenseSummary(
    input: GetExpenseSummaryInput,
  ): Promise<ExpenseSummary> {
    return await this.databaseToolsService.getExpenseSummary(input);
  }

  /**
   * Получить список доступных tools
   */
  getAvailableTools(): string[] {
    return [
      "get_user_events",
      "get_event_by_id",
      "get_user_stats",
      "search_events",
      "get_recent_events",
      "get_upcoming_tasks",
      "get_expense_summary",
    ];
  }

  /**
   * Проверить, поддерживается ли tool
   */
  isToolSupported(toolName: string): boolean {
    return this.getAvailableTools().includes(toolName);
  }
}
