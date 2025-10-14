import { generateText } from "ai";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

import type { EventWithDetails } from "../services/event-service";
import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { DatabaseToolsService } from "../services/database-tools-service";
import { EventLogService } from "../services/event-log-service";
import { EventService } from "../services/event-service";
import { AbstractAgent } from "./base-agent";
import { preparePromptVariables } from "./prompt-variables-helper";

/**
 * Упрощенный агент для обработки и логирования событий
 * Основная задача - сохранять события и предоставлять информацию о них
 */
export class EventProcessorAgent extends AbstractAgent {
  name = "Event Processor";
  description = "Агент для логирования событий и предоставления информации";

  capabilities: AgentCapability[] = [
    {
      name: "Event Logging",
      description: "Логирование и сохранение событий в базу данных",
      category: "event",
      confidence: 0.95,
    },
    {
      name: "Event Information",
      description: "Предоставление информации о сохраненных событиях",
      category: "event",
      confidence: 0.9,
    },
  ];

  private eventService: EventService;
  private eventLogService: EventLogService;
  private databaseService: DatabaseToolsService;

  constructor() {
    super("gpt-5-nano");
    this.eventService = new EventService();
    this.eventLogService = new EventLogService();
    this.databaseService = new DatabaseToolsService();
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    return true; // Обрабатываем все запросы через AI
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    try {
      // Проверяем, запрашивает ли пользователь информацию о событиях
      const isEventQuery = this.detectEventQuery(task.input);

      let eventContext = "";
      if (isEventQuery && task.context.householdId) {
        try {
          const eventRequest = this.parseEventQuery(task.input);
          const events = await this.databaseService.getUserEvents({
            userId: task.context.userId,
            householdId: task.context.householdId,
            limit: 20,
            startDate: eventRequest.startDate,
            endDate: eventRequest.endDate,
            type: eventRequest.type,
          });

          eventContext = this.formatEventsForPrompt(events);
        } catch (error) {
          console.error("Failed to fetch events:", error);
          eventContext = "Не удалось получить события из базы данных";
        }
      }

      // Подготавливаем переменные с eventContext
      const variables = preparePromptVariables(task, {
        eventContext: eventContext || "События не запрашивались",
      });

      // Получаем промпт из Langfuse и компилируем с переменными
      const systemPrompt = await getPrompt(
        PROMPT_KEYS.EVENT_PROCESSOR_AGENT,
        "latest",
        variables,
      );

      const { text: response } = await generateText({
        model: this.getModel(),
        system: systemPrompt,
        prompt: task.input,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("event-processing", task),
        },
      });

      // Создаем событие в базе данных только если это не запрос информации
      if (!isEventQuery) {
        await this.createEventFromTask(task, response);
        await this.createEventLog(task, response);
      }

      return this.createSuccessResult(response, 0.95);
    } catch (error) {
      console.error("Error in EventProcessorAgent:", error);
      return this.createErrorResult(
        "Извините, произошла ошибка при обработке события",
      );
    }
  }

  shouldLog(_task: AgentTask): Promise<boolean> {
    // Логируем все события для отслеживания
    return Promise.resolve(true);
  }

  /**
   * Создает событие в базе данных на основе задачи агента
   */
  private async createEventFromTask(
    task: AgentTask,
    response: string,
  ): Promise<void> {
    try {
      const householdId = task.context?.householdId;
      const userId = task.context?.userId;

      if (!householdId) {
        console.warn("No householdId provided, skipping event creation");
        return;
      }

      // Определяем тип события на основе контекста
      const eventType = this.determineEventType(task);

      // Создаем событие
      await this.eventService.createEvent({
        householdId,
        userId,
        source: "api",
        type: eventType,
        title: this.extractEventTitle(task.input),
        notes: response,
        occurredAt: new Date(),
        priority: "medium",
        status: "active",
        data: {
          agentName: this.name,
          taskId: task.id,
          originalInput: task.input,
          channel: task.context?.channel,
          messageId: task.context?.messageId,
        },
        properties: {
          agent_confidence: 0.95,
          processing_time: Date.now() - task.createdAt.getTime(),
          response_length: response.length,
        },
        tags: this.extractTags(task.input),
      });

      console.log(
        `Event created for task ${task.id} in household ${householdId}`,
      );
    } catch (error) {
      console.error("Failed to create event:", error);
      // Не прерываем выполнение, только логируем ошибку
    }
  }

  /**
   * Создает лог события для отслеживания
   */
  private async createEventLog(
    task: AgentTask,
    response: string,
  ): Promise<void> {
    try {
      await this.eventLogService.createEventLog({
        source: "event-processor-agent",
        chatId: task.context?.channel || "unknown",
        type: "text",
        text: response,
        originalText: task.input,
        meta: {
          messageId: task.context?.messageId,
          userId: task.context?.userId,
          taskId: task.id,
          agentName: this.name,
          householdId: task.context?.householdId,
        },
      });

      console.log(`Event log created for task ${task.id}`);
    } catch (error) {
      console.error("Failed to create event log:", error);
      // Не прерываем выполнение, только логируем ошибку
    }
  }

  /**
   * Определяет тип события на основе контекста задачи
   */
  private determineEventType(
    task: AgentTask,
  ):
    | "purchase"
    | "maintenance"
    | "health"
    | "work"
    | "personal"
    | "transport"
    | "home"
    | "finance"
    | "education"
    | "entertainment"
    | "travel"
    | "food"
    | "other" {
    const input = task.input.toLowerCase();

    if (
      input.includes("трат") ||
      input.includes("потратил") ||
      input.includes("покупк") ||
      input.includes("деньг")
    ) {
      return "purchase";
    }

    if (
      input.includes("задач") ||
      input.includes("дела") ||
      input.includes("напомин") ||
      input.includes("работа") ||
      input.includes("проект")
    ) {
      return "work";
    }

    if (
      input.includes("ремонт") ||
      input.includes("починк") ||
      input.includes("обслуж")
    ) {
      return "maintenance";
    }

    if (
      input.includes("здоров") ||
      input.includes("врач") ||
      input.includes("лекарств") ||
      input.includes("больниц")
    ) {
      return "health";
    }

    if (
      input.includes("еда") ||
      input.includes("ресторан") ||
      input.includes("кафе") ||
      input.includes("продукт")
    ) {
      return "food";
    }

    if (
      input.includes("машин") ||
      input.includes("транспорт") ||
      input.includes("бензин") ||
      input.includes("такси")
    ) {
      return "transport";
    }

    if (
      input.includes("дом") ||
      input.includes("квартир") ||
      input.includes("жилье")
    ) {
      return "home";
    }

    if (
      input.includes("финанс") ||
      input.includes("банк") ||
      input.includes("кредит") ||
      input.includes("инвест")
    ) {
      return "finance";
    }

    if (
      input.includes("учеба") ||
      input.includes("образован") ||
      input.includes("курс") ||
      input.includes("книг")
    ) {
      return "education";
    }

    if (
      input.includes("развлечен") ||
      input.includes("кино") ||
      input.includes("театр") ||
      input.includes("игр")
    ) {
      return "entertainment";
    }

    if (
      input.includes("путешеств") ||
      input.includes("отпуск") ||
      input.includes("отель") ||
      input.includes("билет")
    ) {
      return "travel";
    }

    if (
      input.includes("личн") ||
      input.includes("семья") ||
      input.includes("друз")
    ) {
      return "personal";
    }

    return "other";
  }

  /**
   * Извлекает заголовок события из входного текста
   */
  private extractEventTitle(input: string): string {
    // Простая логика извлечения заголовка
    const words = input.split(" ");
    if (words.length <= 5) {
      return input;
    }
    return words.slice(0, 5).join(" ") + "...";
  }

  /**
   * Извлекает теги из входного текста
   */
  private extractTags(input: string): string[] {
    const tags: string[] = [];
    const inputLower = input.toLowerCase();

    // Простая логика извлечения тегов
    if (inputLower.includes("важно") || inputLower.includes("срочно")) {
      tags.push("важное");
    }

    if (inputLower.includes("работа") || inputLower.includes("офис")) {
      tags.push("работа");
    }

    if (inputLower.includes("дом") || inputLower.includes("квартир")) {
      tags.push("дом");
    }

    if (inputLower.includes("покупк") || inputLower.includes("магазин")) {
      tags.push("покупки");
    }

    return tags;
  }

  /**
   * Определяет, является ли запрос запросом информации о событиях
   */
  private detectEventQuery(input: string): boolean {
    const inputLower = input.toLowerCase();

    const queryKeywords = [
      "покажи",
      "список",
      "какие",
      "что было",
      "мои события",
      "мои дела",
      "история",
      "расскажи о",
      "информация о",
      "найди",
      "поиск",
    ];

    return queryKeywords.some((keyword) => inputLower.includes(keyword));
  }

  /**
   * Парсит запрос о событиях для извлечения параметров фильтрации
   */
  private parseEventQuery(input: string): {
    startDate?: string;
    endDate?: string;
    type?: string;
  } {
    const inputLower = input.toLowerCase();

    // Определяем период
    let startDate: string | undefined;
    let endDate = new Date().toISOString();

    if (inputLower.includes("вчера")) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      startDate = yesterday.toISOString();

      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      endDate = endOfYesterday.toISOString();
    } else if (inputLower.includes("сегодня")) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate = today.toISOString();
    } else if (inputLower.includes("неделю") || inputLower.includes("7 дней")) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString();
    } else if (inputLower.includes("месяц") || inputLower.includes("30 дней")) {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      startDate = monthAgo.toISOString();
    } else {
      // По умолчанию - последние 7 дней
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString();
    }

    // Определяем тип события
    let type: string | undefined;
    if (
      inputLower.includes("покупк") ||
      inputLower.includes("трат") ||
      inputLower.includes("расход")
    ) {
      type = "purchase";
    } else if (
      inputLower.includes("работ") ||
      inputLower.includes("задач") ||
      inputLower.includes("дела")
    ) {
      type = "work";
    }

    return {
      startDate,
      endDate,
      type,
    };
  }

  /**
   * Форматирует события для включения в промпт
   */
  private formatEventsForPrompt(events: EventWithDetails[]): string {
    if (events.length === 0) {
      return "События не найдены";
    }

    const formatted = events
      .map((event) => {
        const date = new Date(event.occurredAt).toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const tags =
          event.tags?.map((t: { name: string }) => t.name).join(", ") ?? "";
        const amount = event.amount
          ? ` (${event.amount} ${event.currency ?? "RUB"})`
          : "";

        return `- [${date}] ${event.title}${amount}${tags ? ` #${tags}` : ""}${event.notes ? `\n  ${event.notes}` : ""}`;
      })
      .join("\n");

    return `СОБЫТИЯ ПОЛЬЗОВАТЕЛЯ (${events.length} шт.):\n${formatted}`;
  }
}
