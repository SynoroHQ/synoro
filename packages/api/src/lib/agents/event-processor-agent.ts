import { generateText } from "ai";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { EventLogService } from "../services/event-log-service";
import { EventService } from "../services/event-service";
import { AbstractAgent } from "./base-agent";

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

  constructor() {
    super("gpt-5-nano");
    this.eventService = new EventService();
    this.eventLogService = new EventLogService();
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    return true; // Обрабатываем все запросы через AI
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    try {
      // Получаем промпт из Langfuse облака
      const systemPrompt = await getPrompt(
        PROMPT_KEYS.EVENT_PROCESSOR_AGENT,
        "latest",
        {
          userId: task.context?.userId || "Неизвестен",
          householdId: task.context?.householdId || "Неизвестно",
          currentTime: new Date().toLocaleString("ru-RU"),
        },
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

      // Создаем событие в базе данных
      await this.createEventFromTask(task, response);

      // Создаем лог события
      await this.createEventLog(task, response);

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
  ): "expense" | "task" | "maintenance" | "other" {
    const input = task.input.toLowerCase();

    if (
      input.includes("трат") ||
      input.includes("потратил") ||
      input.includes("покупк") ||
      input.includes("деньг")
    ) {
      return "expense";
    }

    if (
      input.includes("задач") ||
      input.includes("дела") ||
      input.includes("напомин")
    ) {
      return "task";
    }

    if (
      input.includes("ремонт") ||
      input.includes("починк") ||
      input.includes("обслуж")
    ) {
      return "maintenance";
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
}
