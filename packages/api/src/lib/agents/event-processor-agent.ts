import { generateText, tool } from "ai";
import { z } from "zod";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { EventLogService } from "../services/event-log-service";
import { EventService } from "../services/event-service";
import { HouseholdService } from "../services/household-service";
import { parseAIJsonResponseWithSchema } from "../utils/ai-response-parser";
import { AbstractAgent } from "./base-agent";
import {
  categorizationSchema,
  eventAnalysisSchema,
  eventSchema,
  financialSchema,
} from "./schemas/event-schemas";

/**
 * Специализированный агент для обработки и парсинга событий
 * Извлекает структурированные данные и предоставляет советы
 */
export class EventProcessorAgent extends AbstractAgent {
  name = "Event Processor";
  description =
    "Специализированный агент для парсинга событий и извлечения структурированных данных";

  /**
   * Проверяет, запрашивает ли промпт только JSON-ответ
   */
  private isJsonOnlyRequest(prompt: string): boolean {
    const jsonOnlyFlags = [
      "только JSON",
      "JSON-only",
      "только json",
      "json-only",
      "только JSON-ответ",
      "JSON-only response",
      "верни только JSON",
      "return only JSON",
    ];

    const lowerPrompt = prompt.toLowerCase();
    return jsonOnlyFlags.some((flag) =>
      lowerPrompt.includes(flag.toLowerCase()),
    );
  }

  capabilities: AgentCapability[] = [
    {
      name: "Event Parsing",
      description: "Извлечение структурированных данных из описаний событий",
      category: "event",
      confidence: 0.95,
    },
    {
      name: "Purchase Detection",
      description: "Распознавание и парсинг покупок с суммами и категориями",
      category: "event",
      confidence: 0.9,
    },
    {
      name: "Task Extraction",
      description: "Извлечение задач и todo-элементов",
      category: "event",
      confidence: 0.85,
    },
    {
      name: "Event Categorization",
      description: "Автоматическая категоризация событий",
      category: "event",
      confidence: 0.8,
    },
    {
      name: "Contextual Advice",
      description: "Предоставление советов на основе событий",
      category: "event",
      confidence: 0.75,
    },
  ];

  private eventService: EventService;
  private eventLogService: EventLogService;
  private householdService: HouseholdService;

  constructor() {
    super("gpt-5-nano");
    this.eventService = new EventService();
    this.eventLogService = new EventLogService();
    this.householdService = new HouseholdService();
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    try {
      // Добавляем историю сообщений в промпт, если она есть
      const historyContext =
        task.messageHistory && task.messageHistory.length > 0
          ? `\n\nИСТОРИЯ ДИАЛОГА:\n${this.formatMessageHistory(task, 2000)}`
          : "";

      // Используем AI для определения типа события
      const { text: eventAnalysisText } = await generateText({
        model: this.getModel(),
        system: await getPrompt(PROMPT_KEYS.EVENT_PROCESSOR),
        prompt: `Проанализируй сообщение: "${task.input}"${historyContext}

Верни ответ в формате JSON:
{
  "isEvent": true_или_false,
  "eventType": "purchase|task|meeting|note|expense|income|maintenance|other|none",
  "confidence": число_от_0_до_1,
  "reasoning": "обоснование_классификации"
}

ВАЖНО: Верни только валидный JSON без дополнительного текста.`,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("event-type-detection", task),
          metadata: {
            inputLength: task.input.length,
            hasHistory: Boolean(
              task.messageHistory && task.messageHistory.length > 0,
            ),
            historyLength: task.messageHistory?.length || 0,
          },
        },
      });

      // Парсим JSON ответ используя импортированную схему

      const parseResult = parseAIJsonResponseWithSchema(
        eventAnalysisText,
        eventAnalysisSchema,
      );
      if (!parseResult.success) {
        console.error(
          "Failed to parse event analysis response:",
          parseResult.error,
        );
        throw new Error("Failed to parse AI response");
      }

      const eventAnalysis = parseResult.data;

      // Проверяем тип задачи
      const isEventType =
        task.type === "event" ||
        task.type === "logging" ||
        task.type === "general";

      return eventAnalysis.isEvent && isEventType;
    } catch (error) {
      console.error("Error in AI event detection:", error);
      // Fallback к простой проверке
      const text = task.input.toLowerCase();
      const hasEventKeywords = [
        "купил",
        "купила",
        "потратил",
        "потратила",
        "заплатил",
        "заплатила",
        "задача",
        "дело",
        "сделать",
        "выполнить",
        "запланировать",
        "встреча",
        "собрание",
        "созвон",
        "встретиться",
        "заметка",
        "записать",
        "запомнить",
        "напомнить",
        "доход",
        "заработал",
        "получил",
        "прибыль",
        "ремонт",
        "обслуживание",
        "техобслуживание",
        "то",
        "maintenance",
      ].some((keyword) => text.includes(keyword));

      const isEventType =
        task.type === "event" ||
        task.type === "logging" ||
        task.type === "general";
      return hasEventKeywords && isEventType;
    }
  }

  /**
   * Получает или создает домашнее хозяйство по умолчанию
   * @param task - задача агента
   * @returns ID домашнего хозяйства или null при ошибке
   */
  private async ensureHousehold(task: AgentTask): Promise<string | null> {
    // Читаем householdId из контекста задачи
    let householdId: string = (task.context?.householdId as string) || "";

    if (!householdId) {
      // Если не указан, создаем домашнее хозяйство по умолчанию
      const defaultHousehold =
        await this.householdService.getOrCreateDefaultHousehold();
      if (!defaultHousehold) {
        return null;
      }
      return defaultHousehold.id;
    } else {
      // Если указан, проверяем его существование
      const householdExists =
        await this.householdService.householdExists(householdId);
      if (!householdExists) {
        console.warn(
          `Household with ID ${householdId} not found, using default household`,
        );
        // Fallback к созданию домашнего хозяйства по умолчанию
        const defaultHousehold =
          await this.householdService.getOrCreateDefaultHousehold();
        if (!defaultHousehold) {
          return null;
        }
        return defaultHousehold.id;
      }
      return householdId;
    }
  }

  /**
   * Создает инструмент для категоризации событий
   */
  private getCategorizationTool(task: AgentTask) {
    return tool({
      description: "Автоматическая категоризация события на основе описания",
      inputSchema: z.object({
        eventType: z.string(),
        description: z.string(),
      }),
      execute: async ({ eventType, description }) => {
        try {
          // Добавляем историю сообщений в промпт, если она есть
          const historyContext =
            task.messageHistory && task.messageHistory.length > 0
              ? `\n\nИСТОРИЯ ДИАЛОГА:\n${this.formatMessageHistory(task, 2000)}`
              : "";

          // Используем AI для категоризации событий
          const { text: categorizationText } = await generateText({
            model: this.getModel(),
            system: `Ты - эксперт по категоризации событий в системе Synoro AI.

ТВОЯ ЗАДАЧА:
Определи наиболее подходящую категорию для события на основе его описания.

ДОСТУПНЫЕ КАТЕГОРИИ ДЛЯ ПОКУПОК (purchase):
- продукты: еда, напитки, продукты питания
- транспорт: проезд, топливо, такси, общественный транспорт
- развлечения: кино, театр, игры, книги, хобби
- одежда: одежда, обувь, аксессуары
- здоровье: лекарства, медицинские услуги, спорт
- дом: мебель, ремонт, коммунальные услуги, техника
- образование: курсы, обучение, семинары, книги
- услуги: различные платные услуги
- подарки: подарки для других людей
- прочее: не подходящее под другие категории

ДОСТУПНЫЕ КАТЕГОРИИ ДЛЯ ЗАДАЧ (task):
- работа: рабочие задачи, проекты, встречи
- дом: домашние дела, уборка, готовка
- здоровье: тренировки, диета, медицинские задачи
- личное: хобби, личные планы, саморазвитие
- семья: семейные дела, забота о близких
- финансы: финансовое планирование, учет расходов

ПРАВИЛА:
1. Выбирай наиболее специфичную категорию
2. Учитывай контекст и детали описания
3. Если событие подходит под несколько категорий, выбирай основную`,
            prompt: `Категоризируй событие:

Тип события: ${eventType}
Описание: "${description}"${historyContext}

Верни ответ в формате JSON:
{
  "category": "название_категории",
  "confidence": число_от_0_до_1,
  "reasoning": "обоснование_выбора"
}

ВАЖНО: Верни только валидный JSON без дополнительного текста.`,
            experimental_telemetry: {
              isEnabled: true,
              ...this.createTelemetry("event-categorization", task),
              metadata: { eventType, descriptionLength: description.length },
            },
          });

          // Парсим JSON ответ используя импортированную схему

          const parseResult = parseAIJsonResponseWithSchema(
            categorizationText,
            categorizationSchema,
          );
          if (!parseResult.success) {
            console.error(
              "Failed to parse categorization response:",
              parseResult.error,
            );
            throw new Error("Ошибка категоризации события");
          }

          return parseResult.data.category;
        } catch (error) {
          console.error("Error in AI event categorization:", error);
          throw new Error("Ошибка категоризации события");
        }
      },
    });
  }

  /**
   * Создает инструмент для сохранения события в базу данных
   */
  private getSaveEventTool(task: AgentTask) {
    return tool({
      description: "Сохранить событие в базу данных",
      inputSchema: z.object({
        type: z.enum(["expense", "task", "maintenance", "other"]),
        title: z.string().optional(),
        notes: z.string().optional(),
        amount: z.number().optional(),
        currency: z.string().optional(),
        occurredAt: z.string().optional(), // ISO date string
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        tags: z.array(z.string()).optional(),
        properties: z.record(z.string(), z.unknown()).optional(),
      }),
      execute: async (eventData) => {
        try {
          const householdId = await this.ensureHousehold(task);
          if (!householdId) {
            return this.createErrorResult("Failed to get default household");
          }
          const userId = task.context?.userId;

          const event = await this.eventService.createEvent({
            householdId,
            userId,
            source: "telegram", // или другой источник из контекста
            type: eventData.type,
            title: eventData.title,
            notes: eventData.notes,
            amount: eventData.amount,
            currency: eventData.currency ?? "RUB",
            occurredAt: eventData.occurredAt
              ? new Date(eventData.occurredAt)
              : new Date(),
            priority: eventData.priority ?? "medium",
            tags: eventData.tags,
            properties: eventData.properties,
          });

          return {
            success: true,
            eventId: event.id,
            message: `Событие "${eventData.type}" успешно сохранено с ID: ${event.id}`,
          };
        } catch (error) {
          console.error("Error saving event:", error);
          return {
            success: false,
            error: "Не удалось сохранить событие",
          };
        }
      },
    });
  }

  /**
   * Создает инструмент для получения событий из базы данных
   */
  private getGetEventsTool(task: AgentTask) {
    return tool({
      description: "Получить события из базы данных с фильтрацией",
      inputSchema: z.object({
        type: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        startDate: z.string().optional(), // ISO date string
        endDate: z.string().optional(), // ISO date string
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
        currency: z.string().optional(),
        tags: z.array(z.string()).optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }),
      execute: async (filters) => {
        try {
          const householdId = await this.ensureHousehold(task);
          if (!householdId) {
            return this.createErrorResult("Failed to get default household");
          }
          const userId = task.context?.userId;

          const events = await this.eventService.getEvents(
            {
              householdId,
              userId,
              type: filters.type,
              status: filters.status,
              priority: filters.priority,
              startDate: filters.startDate
                ? new Date(filters.startDate)
                : undefined,
              endDate: filters.endDate ? new Date(filters.endDate) : undefined,
              minAmount: filters.minAmount,
              maxAmount: filters.maxAmount,
              currency: filters.currency,
              tags: filters.tags,
              search: filters.search,
            },
            {
              limit: filters.limit ?? 10,
              offset: filters.offset ?? 0,
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
              priority: event.priority,
              status: event.status,
              tags: event.tags.map((tag) => tag.name),
              properties: event.properties.reduce(
                (acc, prop) => {
                  acc[prop.key] = prop.value;
                  return acc;
                },
                {} as Record<string, unknown>,
              ),
            })),
            total: events.length,
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
        startDate: z.string().optional(), // ISO date string
        endDate: z.string().optional(), // ISO date string
        type: z.string().optional(),
      }),
      execute: async (filters) => {
        try {
          const householdId = await this.ensureHousehold(task);
          if (!householdId) {
            return this.createErrorResult("Failed to get default household");
          }

          const stats = await this.eventService.getEventStats(householdId, {
            startDate: filters.startDate
              ? new Date(filters.startDate)
              : undefined,
            endDate: filters.endDate ? new Date(filters.endDate) : undefined,
            type: filters.type ?? undefined,
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

  /**
   * Создает инструмент для извлечения финансовой информации
   */
  private getFinancialExtractionTool(task: AgentTask) {
    return tool({
      description: "Извлечение суммы и валюты из текста",
      inputSchema: z.object({
        text: z.string(),
      }),
      execute: async ({ text }) => {
        try {
          // Добавляем историю сообщений в промпт, если она есть
          const historyContext =
            task.messageHistory && task.messageHistory.length > 0
              ? `\n\nИСТОРИЯ ДИАЛОГА:\n${this.formatMessageHistory(task, 2000)}`
              : "";

          // Используем AI для извлечения финансовой информации
          const { text: financialText } = await generateText({
            model: this.getModel(),
            system: `Ты - специалист по извлечению финансовой информации из текста.
            
Твоя задача - найти сумму и валюту в тексте пользователя.

ПОДДЕРЖИВАЕМЫЕ ФОРМАТЫ:
- Российские рубли: "1 299,90 ₽", "₽1 299,90", "1 299,90 р", "1 299,90 руб"
- Доллары США: "$1,299.90", "1 299,90 USD", "1 299,90 доллар"
- Евро: "€1.299,90", "1 299,90 EUR", "1 299,90 евро"

ПРАВИЛА:
1. Извлекай только явно указанные суммы
2. Определяй валюту по символам или словам
3. Обрабатывай различные разделители (пробелы, запятые, точки)
4. Если валюта не указана, используй RUB по умолчанию`,
            prompt: `Извлеки финансовую информацию из текста: "${text}"${historyContext}

Верни ответ в формате JSON:
{
  "amount": число_или_null,
  "currency": "RUB|USD|EUR_или_null",
  "confidence": число_от_0_до_1
}

ВАЖНО: Верни только валидный JSON без дополнительного текста.`,
            experimental_telemetry: {
              isEnabled: true,
              ...this.createTelemetry("financial-extraction", task),
              metadata: { textLength: text.length },
            },
          });

          // Парсим JSON ответ используя импортированную схему

          const parseResult = parseAIJsonResponseWithSchema(
            financialText,
            financialSchema,
          );
          if (!parseResult.success) {
            console.error(
              "Failed to parse financial extraction response:",
              parseResult.error,
            );
            return null; // Fallback
          }

          return parseResult.data;
        } catch (error) {
          console.error("Error in AI financial extraction:", error);
          return null;
        }
      },
    });
  }

  async process(task: AgentTask): Promise<
    AgentResult<{
      parsedEvent: any;
      advice?: string;
      structuredData: any;
    }>
  > {
    let eventLogId: string | null = null;

    try {
      // 1. Создаем лог события пользователя для отслеживания процесса обработки
      try {
        const source = task.context?.channel || "unknown";
        const chatId = task.context?.messageId || task.id;

        const eventLog = await this.eventLogService.createEventLog({
          source,
          chatId,
          type: "text",
          text: task.input,
          originalText: task.input,
          meta: {
            userId: task.context?.userId,
            messageId: task.context?.messageId,
            status: "processing",
            userMessage: task.input, // Сохраняем оригинальное сообщение пользователя
          },
        });
        eventLogId = eventLog.id;

        // Обновляем статус на "processing"
        await this.eventLogService.updateEventLogStatus(
          eventLogId,
          "processing",
        );
      } catch (error) {
        console.warn("Failed to create event log:", error);
      }

      // 2. Структурированный парсинг с помощью AI
      const basePrompt = await this.createOptimizedPrompt(
        `Проанализируй и распарси это событие: "${task.input}"
        
Контекст: пользователь ${task.context?.userId || "anonymous"} в канале ${task.context?.channel || "unknown"}

Извлеки всю доступную информацию и структурируй её в формате JSON согласно этой схеме:`,
        task,
        {
          useStructuredContext: true,
          maxContextLength: 2000,
          includeFullHistory: false,
        },
      );

      const schemaPrompt = `
{
  "type": "purchase|task|meeting|note|expense|income|maintenance|other",
  "description": "описание события",
  "amount": число_или_null,
  "currency": "RUB|USD|EUR_или_null",
  "date": "дата_или_null",
  "category": "категория_или_null",
  "location": "место_или_null",
  "tags": ["тег1", "тег2"]_или_null,
  "confidence": число_от_0_до_1,
  "needsAdvice": true_или_false,
  "reasoning": "обоснование"
}`;

      // Проверяем, запрашивается ли только JSON
      const isJsonOnly = this.isJsonOnlyRequest(task.input);
      const finalPrompt =
        basePrompt +
        schemaPrompt +
        (isJsonOnly
          ? "\n\nВАЖНО: Верни только валидный JSON без дополнительного текста."
          : "\n\nВАЖНО: Верни оба блока - сначала JSON, затем пользовательский текст.");

      const { text } = await generateText({
        model: this.getModel(),
        system: await getPrompt(PROMPT_KEYS.EVENT_PROCESSOR),
        prompt: finalPrompt,
        tools: {
          categorizeEvent: this.getCategorizationTool(task),
          extractFinancial: this.getFinancialExtractionTool(task),
          saveEvent: this.getSaveEventTool(task),
          getEvents: this.getGetEventsTool(task),
          getEventStats: this.getEventStatsTool(task),
        },
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("parse-event", task),
        },
      });

      // Парсим JSON ответ от AI с валидацией схемы
      let jsonText = text;
      let userResponseText = "";

      if (!isJsonOnly) {
        // Если не только JSON, пытаемся разделить ответ на JSON и пользовательский текст
        const jsonRegex = /\{[\s\S]*\}/;
        const jsonMatch = jsonRegex.exec(text);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
          // Извлекаем пользовательский текст после JSON
          const afterJson = text
            .substring(jsonMatch.index + jsonMatch[0].length)
            .trim();
          if (afterJson) {
            userResponseText = afterJson;
          }
        }
      }

      const parseResult = parseAIJsonResponseWithSchema(jsonText, eventSchema);
      if (!parseResult.success) {
        console.error("Failed to parse AI response:", parseResult.error);
        return this.createErrorResult(
          `Failed to parse AI response: ${parseResult.error}`,
        );
      }

      const structuredEvent = { success: true, data: parseResult.data };
      if (!structuredEvent.success) {
        return this.createErrorResult("Failed to parse event");
      }

      let advice;

      // Генерируем совет, если нужно
      if (structuredEvent.data.needsAdvice) {
        try {
          const { text: adviceText } = await generateText({
            model: this.getModel(),
            system: await getPrompt(PROMPT_KEYS.EVENT_PROCESSOR),
            prompt: `Дай краткий полезный совет для события: "${task.input}"`,
            experimental_telemetry: {
              isEnabled: true,
              ...this.createTelemetry("generate-advice", task),
              metadata: {
                operation: "generate-advice",
              },
            },
          });
          advice = adviceText;
        } catch (error) {
          console.warn("Failed to generate advice:", error);
        }
      }

      // Генерируем пользовательский ответ на основе структурированных данных
      let userResponse = "";

      if (isJsonOnly) {
        // Если запрашивался только JSON, генерируем пользовательский ответ отдельно
        try {
          const { text: generatedUserResponse } = await generateText({
            model: this.getModel(),
            system: await getPrompt(PROMPT_KEYS.EVENT_PROCESSOR),
            prompt: `Создай пользовательский ответ для события на основе этих данных:
            
Тип: ${structuredEvent.data.type}
Описание: ${structuredEvent.data.description}
Сумма: ${structuredEvent.data.amount || "не указана"}
Валюта: ${structuredEvent.data.currency || "RUB"}
Категория: ${structuredEvent.data.category || "не указана"}
Нужен совет: ${structuredEvent.data.needsAdvice ? "да" : "нет"}

Совет: ${advice || "нет"}

Создай готовый текст для пользователя в формате:
- Для покупок: "Записал покупку [товар] за [сумма] [валюта]"
- Для задач: "Записал задачу: [описание]"
- Для встреч: "Записал встречу: [описание]"
- Для заметок: "Записал заметку: [описание]"
- Для расходов: "Записал расход: [сумма] [валюта] на [категория]"
- Для доходов: "Записал доход: [сумма] [валюта] от [источник]"

Добавь совет в конце, если он есть.`,
            experimental_telemetry: {
              isEnabled: true,
              ...this.createTelemetry("generate-user-response", task),
              metadata: {
                operation: "generate-user-response",
              },
            },
          });
          userResponse = generatedUserResponse;
        } catch (error) {
          console.warn("Failed to generate user response:", error);
          // Fallback к простому ответу
          userResponse = `Записал: ${structuredEvent.data.description}`;
        }
      } else {
        // Если ответ уже содержит пользовательский текст, используем его
        if (userResponseText) {
          userResponse = userResponseText;
        } else {
          // Fallback к генерации, если текст не был извлечен
          try {
            const { text: generatedUserResponse } = await generateText({
              model: this.getModel(),
              system: await getPrompt(PROMPT_KEYS.EVENT_PROCESSOR),
              prompt: `Создай пользовательский ответ для события на основе этих данных:
              
Тип: ${structuredEvent.data.type}
Описание: ${structuredEvent.data.description}
Сумма: ${structuredEvent.data.amount || "не указана"}
Валюта: ${structuredEvent.data.currency || "RUB"}
Категория: ${structuredEvent.data.category || "не указана"}
Нужен совет: ${structuredEvent.data.needsAdvice ? "да" : "нет"}

Совет: ${advice || "нет"}

Создай готовый текст для пользователя в формате:
- Для покупок: "Записал покупку [товар] за [сумма] [валюта]"
- Для задач: "Записал задачу: [описание]"
- Для встреч: "Записал встречу: [описание]"
- Для заметок: "Записал заметку: [описание]"
- Для расходов: "Записал расход: [сумма] [валюта] на [категория]"
- Для доходов: "Записал доход: [сумма] [валюта] от [источник]"

Добавь совет в конце, если он есть.`,
              experimental_telemetry: {
                isEnabled: true,
                ...this.createTelemetry("generate-user-response", task),
                metadata: {
                  operation: "generate-user-response",
                },
              },
            });
            userResponse = generatedUserResponse;
          } catch (error) {
            console.warn("Failed to generate user response:", error);
            // Fallback к простому ответу
            userResponse = `Записал: ${structuredEvent.data.description}`;
          }
        }
      }

      // Комбинируем структурированные данные
      const combinedData = {
        structured: structuredEvent.data,
        metadata: {
          processingTimestamp: new Date().toISOString(),
          agentName: this.name,
          confidence: structuredEvent.data.confidence,
        },
      };

      // 3. Автоматически сохраняем событие в базу данных
      let savedEvent = null;
      try {
        const householdId = await this.ensureHousehold(task);
        if (!householdId) {
          return this.createErrorResult("Failed to get default household");
        }
        const userId = task.context?.userId;

        savedEvent = await this.eventService.createEvent({
          householdId,
          userId,
          source: "telegram", // или другой источник из контекста
          type: structuredEvent.data.type as
            | "expense"
            | "task"
            | "maintenance"
            | "other",
          title: structuredEvent.data.description,
          notes: structuredEvent.data.description,
          amount: structuredEvent.data.amount ?? undefined,
          currency: structuredEvent.data.currency ?? "RUB",
          occurredAt: structuredEvent.data.date
            ? new Date(structuredEvent.data.date)
            : new Date(),
          priority: "medium",
          tags: structuredEvent.data.tags ?? undefined,
          properties: {
            confidence: structuredEvent.data.confidence,
            reasoning: structuredEvent.data.reasoning,
            location: structuredEvent.data.location,
            category: structuredEvent.data.category,
          },
        });

        // Обновляем лог события пользователя с результатом
        if (eventLogId) {
          await this.eventLogService.updateEventLogText(
            eventLogId,
            `Пользователь сообщил: ${task.input} → Обработано как: ${structuredEvent.data.type} - ${structuredEvent.data.description}`,
            task.input,
          );
          await this.eventLogService.updateEventLogMeta(eventLogId, {
            userId: task.context?.userId,
            messageId: task.context?.messageId,
            savedEventId: savedEvent.id,
            eventType: structuredEvent.data.type,
            confidence: structuredEvent.data.confidence,
            amount: structuredEvent.data.amount,
            category: structuredEvent.data.category,
            userMessage: task.input, // Сохраняем оригинальное сообщение пользователя
            processedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.warn("Failed to save event to database:", error);

        // Обновляем лог события пользователя с ошибкой
        if (eventLogId) {
          await this.eventLogService.updateEventLogStatus(eventLogId, "failed");
          await this.eventLogService.updateEventLogMeta(eventLogId, {
            userId: task.context?.userId,
            messageId: task.context?.messageId,
            userMessage: task.input, // Сохраняем оригинальное сообщение пользователя
            error: error instanceof Error ? error.message : "Unknown error",
            failedAt: new Date().toISOString(),
          });
        }
      }

      // 4. Обновляем статус лога на "processed" если все успешно
      if (eventLogId && savedEvent) {
        await this.eventLogService.updateEventLogStatus(
          eventLogId,
          "processed",
        );
      }

      return this.createSuccessResult(
        {
          parsedEvent: structuredEvent.data,
          advice,
          structuredData: combinedData,
          userResponse, // Добавляем пользовательский ответ
          savedEvent: savedEvent
            ? {
                id: savedEvent.id,
                message: `Событие сохранено в базу данных с ID: ${savedEvent.id}`,
              }
            : null,
        },
        structuredEvent.data.confidence,
        userResponse, // Используем пользовательский ответ как основной текст
      );
    } catch (error) {
      console.error("Error in event processor agent:", error);

      // Обновляем лог события пользователя с ошибкой
      if (eventLogId) {
        try {
          await this.eventLogService.updateEventLogStatus(eventLogId, "failed");
          await this.eventLogService.updateEventLogMeta(eventLogId, {
            userId: task.context?.userId,
            messageId: task.context?.messageId,
            userMessage: task.input, // Сохраняем оригинальное сообщение пользователя
            error: error instanceof Error ? error.message : "Unknown error",
            failedAt: new Date().toISOString(),
          });
        } catch (logError) {
          console.warn("Failed to update event log with error:", logError);
        }
      }

      return this.createErrorResult("Failed to process event");
    }
  }
}
