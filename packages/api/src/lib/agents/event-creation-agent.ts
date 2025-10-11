import { generateObject } from "ai";
import { z } from "zod";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";
import { EventCategory } from "@synoro/validators";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { EventLogService } from "../services/event-log-service";
import { EventService } from "../services/event-service";
import { safeParseDate } from "../utils/date-helpers";
import { mapRussianPriorityToCanonical } from "../utils/priority-mapper";
import { AbstractAgent } from "./base-agent";

// Константы для локализованных сообщений
const EVENT_LOG_MESSAGES = {
  eventCreated: (title: string) => `Event created: ${title}`,
  eventCreatedRu: (title: string) => `Создано событие: ${title}`,
} as const;

// Интерфейс для созданного события (возвращается из EventService)
interface Event {
  id: string;
  householdId: string;
  userId: string | null;
  source: "telegram" | "web" | "mobile" | "api";
  type: z.infer<typeof EventCategory>;
  status: "active" | "archived" | "deleted";
  priority: "low" | "medium" | "high" | "urgent";
  occurredAt: Date;
  ingestedAt: Date;
  updatedAt: Date;
  title: string | null;
  notes: string | null;
  amount: string | null; // decimal в БД возвращается как string
  currency: string;
  data: Record<string, unknown> | null;
}

// Интерфейс для извлеченной информации о событии
interface ExtractedInfo {
  type: z.infer<typeof EventCategory>;
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  occurredAt: string | number | Date;
  confidence?: number;
  priority: "low" | "medium" | "high" | "urgent";
  properties?: Record<string, unknown>;
  tags?: string[];
}

// Схема для извлечения информации о событии из текста
const eventExtractionSchema = z.object({
  title: z.string().describe("Заголовок события"),
  description: z.string().optional().describe("Описание события"),
  type: EventCategory.describe("Тип события"),
  priority: z
    .string()
    .transform((val) => mapRussianPriorityToCanonical(val))
    .describe("Приоритет события"),
  amount: z.number().optional().describe("Сумма (для расходов)"),
  currency: z.string().default("RUB").describe("Валюта"),
  occurredAt: z.string().describe("Дата и время события в ISO формате"),
  tags: z.array(z.string()).optional().describe("Теги для категоризации"),
  properties: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Дополнительные свойства"),
  confidence: z.number().min(0).max(1).describe("Уверенность в извлечении"),
  needsConfirmation: z
    .boolean()
    .describe("Требует ли подтверждения от пользователя"),
});

// Экспортируем тип, выведенный из схемы
export type EventInfo = z.infer<typeof eventExtractionSchema>;

/**
 * Специализированный агент для создания событий из естественного языка
 * Основная задача - парсинг текста и создание структурированных событий
 */
export class EventCreationAgent extends AbstractAgent {
  name = "Event Creation Agent";
  description =
    "Специализированный агент для создания событий из естественного языка";

  capabilities: AgentCapability[] = [
    {
      name: "Event Creation",
      description: "Создание событий из текста на естественном языке",
      category: "event",
      confidence: 0.95,
    },
    {
      name: "Text Parsing",
      description: "Парсинг естественного языка в структурированные данные",
      category: "parsing",
      confidence: 0.9,
    },
    {
      name: "Data Extraction",
      description: "Извлечение временной информации и контекста",
      category: "extraction",
      confidence: 0.85,
    },
  ];

  private eventService: EventService;
  private eventLogService: EventLogService;

  constructor() {
    super("gpt-5");
    this.eventService = new EventService();
    this.eventLogService = new EventLogService();
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    // Проверяем, связана ли задача с созданием событий
    if (task.type === "event" || task.type === "create_event") {
      return true;
    }

    // Анализируем текст на предмет связи с событиями
    const input = task.input.toLowerCase();
    const eventKeywords = [
      "трат",
      "потратил",
      "покупк",
      "деньг",
      "расход",
      "задач",
      "дела",
      "напомин",
      "событи",
      "ремонт",
      "починк",
      "обслуж",
      "встреч",
      "важно",
      "срочно",
      "завтра",
      "сегодня",
    ];

    return eventKeywords.some((keyword) => input.includes(keyword));
  }

  async process(task: AgentTask): Promise<AgentResult<any>> {
    try {
      const telemetry = this.createTelemetry("create-event", task);

      // Извлекаем информацию о событии из текста
      const extractedInfo = await this.extractEventInfo(task);

      if (extractedInfo.confidence < 0.5) {
        return this.createErrorResult(
          "Недостаточно информации для создания события",
          extractedInfo.confidence,
        );
      }

      // Создаем событие в базе данных
      const event = await this.createEvent(extractedInfo, task);

      // Создаем лог события
      await this.createEventLog(task, event, extractedInfo);

      // Если событие успешно записано, не запрашиваем подтверждение
      const needsConfirmation = false;

      return this.createSuccessResult(
        {
          event,
          confidence: extractedInfo.confidence,
          needsConfirmation,
        },
        extractedInfo.confidence,
        `Создано событие "${event.title}" типа ${event.type}`,
      );
    } catch (error) {
      console.error("Error in EventCreationAgent:", error);
      return this.createErrorResult(
        `Ошибка создания события: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
      );
    }
  }

  shouldLog(_task: AgentTask): Promise<boolean> {
    return Promise.resolve(true);
  }

  /**
   * Извлекает информацию о событии из текста
   */
  private async extractEventInfo(task: AgentTask): Promise<EventInfo> {
    const timezone = task.context?.timezone || "Europe/Moscow";
    const currentTime = new Date().toISOString();

    try {
      const prompt = await getPrompt(
        PROMPT_KEYS.EVENT_CREATION_EXTRACTION,
        "latest",
        {
          currentTime,
          timezone,
        },
      );
      const { object } = await generateObject({
        model: this.getModel(),
        schema: eventExtractionSchema,
        system: prompt,
        prompt: this.createPromptWithHistory(
          `Текст: "${task.input}"
Контекст: ${JSON.stringify(task.context || {})}`,
          {
            input: task.input,
            context: task.context,
            messageHistory: [],
          } as any,
          { includeSummary: true },
        ),
      });

      return object;
    } catch (error) {
      console.error("Ошибка извлечения информации о событии:", error);
      throw new Error(
        `Не удалось извлечь информацию о событии: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
      );
    }
  }

  /**
   * Создает событие в базе данных
   */
  private async createEvent(
    extractedInfo: ExtractedInfo,
    task: AgentTask,
  ): Promise<Event> {
    const householdId = task.context?.householdId;
    const userId = task.context?.userId;

    if (!householdId) {
      throw new Error("Не указан householdId");
    }

    // Валидация и нормализация даты occurredAt с использованием безопасной утилиты
    const occurredAt = safeParseDate(extractedInfo.occurredAt, task.createdAt);

    // Безопасный расчет processing_time
    const processingTime = Date.now() - task.createdAt.getTime();

    const eventData = {
      householdId,
      userId,
      source: "api" as const,
      type: extractedInfo.type,
      title: extractedInfo.title,
      notes: extractedInfo.description,
      amount: extractedInfo.amount,
      currency: extractedInfo.currency,
      occurredAt,
      priority: extractedInfo.priority,
      status: "active" as const,
      data: {
        agentName: this.name,
        taskId: task.id,
        originalInput: task.input,
        channel: task.context?.channel,
        messageId: task.context?.messageId,
        extractedConfidence: extractedInfo.confidence,
      },
      properties: {
        agent_confidence: extractedInfo.confidence,
        processing_time: processingTime,
        ...extractedInfo.properties,
      },
      tags: extractedInfo.tags,
    };

    return await this.eventService.createEvent(eventData);
  }

  /**
   * Создает лог события
   */
  private async createEventLog(
    task: AgentTask,
    event: Event,
    extractedInfo: ExtractedInfo,
  ): Promise<void> {
    try {
      // Используем nullish coalescing для опциональных полей
      const eventTitle = event.title ?? "Untitled Event";
      const extractedConfidence = extractedInfo.confidence ?? 0;

      await this.eventLogService.createEventLog({
        source: "event-creation-agent",
        chatId: task.context?.channel ?? "unknown",
        type: "text",
        text: EVENT_LOG_MESSAGES.eventCreatedRu(eventTitle),
        originalText: task.input,
        meta: {
          messageId: task.context?.messageId,
          userId: task.context?.userId,
          taskId: task.id,
          eventId: event.id,
          agentName: this.name,
          householdId: task.context?.householdId,
          extractedConfidence,
        },
      });
    } catch (error) {
      console.error("Failed to create event log:", error);
      // Не прерываем выполнение, только логируем ошибку
    }
  }
}
