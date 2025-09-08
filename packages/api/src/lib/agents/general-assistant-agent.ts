import { generateText, tool } from "ai";
import { z } from "zod";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { EventService } from "../services/event-service";
import { AbstractAgent } from "./base-agent";

export class GeneralAssistantAgent extends AbstractAgent {
  name = "General Assistant";
  description = "Универсальный помощник Synoro AI для общих вопросов и задач";
  capabilities: AgentCapability[] = [
    {
      name: "General Help",
      description: "Ответы на общие вопросы и повседневные задачи",
      category: "general",
      confidence: 0.85,
    },
    {
      name: "Conversation",
      description: "Дружелюбная беседа и поддержка общения",
      category: "chat",
      confidence: 0.8,
    },
    {
      name: "Basic Q&A",
      description: "Базовые ответы без спец. экспертизы",
      category: "question",
      confidence: 0.75,
    },
  ];
  private eventService: EventService;

  constructor() {
    super("gpt-5-mini");
    this.eventService = new EventService();
  }

  canHandle(_task: AgentTask): Promise<boolean> {
    // Универсальный агент может обработать любое сообщение
    return Promise.resolve(true);
  }

  /**
   * Создает инструмент для получения событий
   */
  private getGetEventsTool(task: AgentTask) {
    return tool({
      description: "Получить события из базы данных",
      inputSchema: z.object({
        type: z.string().optional(),
        limit: z.number().optional(),
        search: z.string().optional(),
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
              search: filters.search,
            },
            {
              limit: filters.limit ?? 5,
              offset: 0,
            },
          );

          return {
            success: true,
            events: events.map((event) => ({
              id: event.id,
              type: event.type,
              title: event.title,
              notes: event.notes,
              amount: event.amount,
              currency: event.currency,
              occurredAt: event.occurredAt,
              tags: event.tags.map((tag) => tag.name),
            })),
          };
        } catch (error) {
          console.error("Error getting events:", error);
          return {
            success: false,
            error: "Не удалось получить события",
          };
        }
      },
    });
  }

  /**
   * Создает инструмент для получения статистики событий
   */
  private getEventStatsTool(task: AgentTask) {
    return tool({
      description: "Получить статистику событий",
      inputSchema: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
      execute: async (filters) => {
        try {
          const householdId =
            (task.context?.householdId as string) ?? "default";

          const stats = await this.eventService.getEventStats(householdId, {
            startDate: filters.startDate
              ? new Date(filters.startDate)
              : undefined,
            endDate: filters.endDate ? new Date(filters.endDate) : undefined,
          });

          return {
            success: true,
            stats,
          };
        } catch (error) {
          console.error("Error getting event stats:", error);
          return {
            success: false,
            error: "Не удалось получить статистику событий",
          };
        }
      },
    });
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    const systemPrompt = await getPrompt(PROMPT_KEYS.ASSISTANT);

    try {
      // Используем generateText с инструментами для работы с событиями
      const { text } = await generateText({
        model: this.getModel(),
        system: this.createPromptWithHistory(systemPrompt, task, {
          includeSummary: true,
        }),
        prompt: task.input,
        tools: {
          getEvents: this.getGetEventsTool(task),
          getEventStats: this.getEventStatsTool(task),
        },
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("general-assistant", task),
        },
      });

      return this.createSuccessResult(text, 0.8);
    } catch (error) {
      console.error("Error in GeneralAssistantAgent:", error);
      return this.createErrorResult(
        "Извините, произошла ошибка при обработке вашего запроса. Попробуйте переформулировать вопрос.",
      );
    }
  }

  shouldLog(task: AgentTask): Promise<boolean> {
    // Логируем только важные взаимодействия
    return Promise.resolve(
      task.input.length > 50 || task.context.channel === "telegram",
    );
  }
}
