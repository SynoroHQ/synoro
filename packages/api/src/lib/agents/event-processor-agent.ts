import { generateText, tool } from "ai";
import { z } from "zod";

import { getPromptSafe, PROMPT_KEYS } from "@synoro/prompts";

import type {
  AgentCapability,
  AgentResult,
  AgentTask,
  AgentTelemetry,
} from "./types";
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

  constructor() {
    super("gpt-5-nano", 0.2); // Низкая температура для точного парсинга
  }

  async canHandle(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<boolean> {
    try {
      // Используем AI для определения типа события
      const { text: eventAnalysisText } = await generateText({
        model: this.getModel(),
        system: `Ты - эксперт по определению типов сообщений в системе Synoro AI.

ТВОЯ ЗАДАЧА:
Определи, является ли сообщение пользователя событием для логирования в системе.

ТИПЫ СОБЫТИЙ:
- purchase: покупки, трата денег, расходы на товары/услуги
- task: задачи, дела, планы, todo-элементы
- meeting: встречи, собрания, созвоны, назначенные события
- note: заметки, записи, идеи, мысли для сохранения
- expense: расходы без конкретного товара, общие траты
- income: доходы, поступления, заработок, прибыль
- maintenance: обслуживание/ремонт/ТО, регулярные сервисные работы
- other: прочие события, не подходящие под другие категории
- none: не является событием (вопрос, обычное общение, спам)

ПРИЗНАКИ СОБЫТИЙ:
- Содержит информацию о действиях пользователя
- Включает детали, которые стоит запомнить
- Может содержать суммы, даты, места
- Описывает что произошло или планируется

ПРАВИЛА:
1. Если сообщение описывает действие/событие - это событие
2. Если это вопрос или обычное общение - не событие
3. Учитывай контекст и намерение пользователя`,
        prompt: `Проанализируй сообщение: "${task.input}"

Верни ответ в формате JSON:
{
  "isEvent": true_или_false,
  "eventType": "purchase|task|meeting|note|expense|income|maintenance|other|none",
  "confidence": число_от_0_до_1,
  "reasoning": "обоснование_классификации"
}

ВАЖНО: Верни только валидный JSON без дополнительного текста.`,
        temperature: 0.1,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("event-type-detection", task, telemetry),
          metadata: { inputLength: task.input.length },
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
   * Создает инструмент для категоризации событий
   */
  private getCategorizationTool(task: AgentTask, telemetry?: AgentTelemetry) {
    return tool({
      description: "Автоматическая категоризация события на основе описания",
      inputSchema: z.object({
        eventType: z.string(),
        description: z.string(),
      }),
      execute: async ({ eventType, description }) => {
        try {
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
Описание: "${description}"

Верни ответ в формате JSON:
{
  "category": "название_категории",
  "confidence": число_от_0_до_1,
  "reasoning": "обоснование_выбора"
}

ВАЖНО: Верни только валидный JSON без дополнительного текста.`,
            temperature: 0.2,
            experimental_telemetry: {
              isEnabled: true,
              ...this.createTelemetry("event-categorization", task, telemetry),
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
            return "прочее"; // Fallback
          }

          return parseResult.data.category;
        } catch (error) {
          console.error("Error in AI event categorization:", error);
          return "прочее"; // Fallback
        }
      },
    });
  }

  /**
   * Создает инструмент для извлечения финансовой информации
   */
  private getFinancialExtractionTool(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ) {
    return tool({
      description: "Извлечение суммы и валюты из текста",
      inputSchema: z.object({
        text: z.string(),
      }),
      execute: async ({ text }) => {
        try {
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
            prompt: `Извлеки финансовую информацию из текста: "${text}"

Верни ответ в формате JSON:
{
  "amount": число_или_null,
  "currency": "RUB|USD|EUR_или_null",
  "confidence": число_от_0_до_1
}

ВАЖНО: Верни только валидный JSON без дополнительного текста.`,
            temperature: 0.1,
            experimental_telemetry: {
              isEnabled: true,
              ...this.createTelemetry("financial-extraction", task, telemetry),
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

  async process(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<
    AgentResult<{
      parsedEvent: any;
      advice?: string;
      structuredData: any;
    }>
  > {
    try {
      // Структурированный парсинг с помощью AI
      const { text } = await generateText({
        model: this.getModel(),
        system: getPromptSafe(PROMPT_KEYS.EVENT_PROCESSOR),
        prompt: `Проанализируй и распарси это событие: "${task.input}"
        
Контекст: пользователь ${task.context?.userId || "anonymous"} в канале ${task.context?.channel || "unknown"}

ВАЖНО: Это событие ОБЯЗАТЕЛЬНО нужно записать в систему. НЕ спрашивай пользователя о необходимости записи.

Извлеки всю доступную информацию и структурируй её в формате JSON согласно этой схеме:
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
}

ВАЖНО: Верни только валидный JSON без дополнительного текста.`,
        temperature: this.defaultTemperature,
        tools: {
          categorizeEvent: this.getCategorizationTool(task, telemetry),
          extractFinancial: this.getFinancialExtractionTool(task, telemetry),
        },
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("parse-event", task, telemetry),
        },
      });

      // Парсим JSON ответ от AI с валидацией схемы
      const parseResult = parseAIJsonResponseWithSchema(text, eventSchema);
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

      let advice = undefined;

      // Генерируем совет, если нужно
      if (structuredEvent.data.needsAdvice) {
        try {
          const { text: adviceText } = await generateText({
            model: this.getModel(),
            system: getPromptSafe(PROMPT_KEYS.EVENT_PROCESSOR),
            prompt: `Дай краткий полезный совет для события: "${task.input}"`,
            temperature: 0.4,
            experimental_telemetry: {
              isEnabled: true,
              ...this.createTelemetry("generate-advice", task, telemetry),
            },
          });
          advice = adviceText;
        } catch (error) {
          console.warn("Failed to generate advice:", error);
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

      return this.createSuccessResult(
        {
          parsedEvent: structuredEvent.data,
          advice,
          structuredData: combinedData,
        },
        structuredEvent.data.confidence,
        `Parsed ${structuredEvent.data.type} event with confidence ${structuredEvent.data.confidence}`,
      );
    } catch (error) {
      console.error("Error in event processor agent:", error);
      return this.createErrorResult("Failed to process event");
    }
  }
}
