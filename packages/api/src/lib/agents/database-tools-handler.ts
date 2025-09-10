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
import {
  getEventByIdSchema,
  getExpenseSummarySchema,
  getRecentEventsSchema,
  getUpcomingTasksSchema,
  getUserEventsSchema,
  getUserStatsSchema,
  searchEventsSchema,
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
        case "get_user_events": {
          const validationResult = getUserEventsSchema.safeParse(parameters);
          if (!validationResult.success) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Неверные параметры для get_user_events: ${validationResult.error.message}`,
            });
          }
          return await this.getUserEvents(validationResult.data);
        }

        case "get_event_by_id": {
          const validationResult = getEventByIdSchema.safeParse(parameters);
          if (!validationResult.success) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Неверные параметры для get_event_by_id: ${validationResult.error.message}`,
            });
          }
          return await this.getEventById(validationResult.data);
        }

        case "get_user_stats": {
          const validationResult = getUserStatsSchema.safeParse(parameters);
          if (!validationResult.success) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Неверные параметры для get_user_stats: ${validationResult.error.message}`,
            });
          }
          return await this.getUserStats(validationResult.data);
        }

        case "search_events": {
          const validationResult = searchEventsSchema.safeParse(parameters);
          if (!validationResult.success) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Неверные параметры для search_events: ${validationResult.error.message}`,
            });
          }
          return await this.searchEvents(validationResult.data);
        }

        case "get_recent_events": {
          const validationResult = getRecentEventsSchema.safeParse(parameters);
          if (!validationResult.success) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Неверные параметры для get_recent_events: ${validationResult.error.message}`,
            });
          }
          return await this.getRecentEvents(validationResult.data);
        }

        case "get_upcoming_tasks": {
          const validationResult = getUpcomingTasksSchema.safeParse(parameters);
          if (!validationResult.success) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Неверные параметры для get_upcoming_tasks: ${validationResult.error.message}`,
            });
          }
          return await this.getUpcomingTasks(validationResult.data);
        }

        case "get_expense_summary": {
          const validationResult =
            getExpenseSummarySchema.safeParse(parameters);
          if (!validationResult.success) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Неверные параметры для get_expense_summary: ${validationResult.error.message}`,
            });
          }
          return await this.getExpenseSummary(validationResult.data);
        }

        default:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Неизвестный tool: ${toolName}`,
          });
      }
    } catch (error) {
      // Если это TRPCError с кодом BAD_REQUEST, перебрасываем без изменений
      if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
        throw error;
      }

      // Для всех остальных ошибок логируем и создаем INTERNAL_SERVER_ERROR
      console.error(`Error executing tool ${toolName}:`, error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Ошибка при выполнении tool ${toolName}${error instanceof Error ? `: ${error.message}` : ""}`,
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
