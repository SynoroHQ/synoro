import { generateObject, generateText, tool } from "ai";
import { z } from "zod";

import type {
  AgentCapability,
  AgentResult,
  AgentTask,
  AgentTelemetry,
} from "./types";
import { advise } from "../ai/advisor";
import { parseTask } from "../ai/parser";
import { AbstractAgent } from "./base-agent";

// Схемы для структурированного парсинга событий
const eventSchema = z.object({
  type: z.enum([
    "purchase",
    "task",
    "meeting",
    "note",
    "expense",
    "income",
    "other",
  ]),
  description: z.string(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  date: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1),
  needsAdvice: z.boolean(),
  reasoning: z.string(),
});

const adviceRequestSchema = z.object({
  eventContext: z.string(),
  adviceType: z.enum(["financial", "productivity", "health", "general"]),
  priority: z.enum(["low", "medium", "high"]),
});

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
    super("gpt-4o-mini", 0.2); // Низкая температура для точного парсинга
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    // Ключевые слова для событий
    const eventKeywords = [
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
    ];

    const text = task.input.toLowerCase();
    const hasEventPattern = eventKeywords.some((keyword) =>
      text.includes(keyword),
    );

    // Проверяем тип задачи
    const isEventType =
      task.type === "event" ||
      task.type === "logging" ||
      task.type === "general";

    // Проверяем наличие числовых значений (суммы)
    const hasNumbers = /\d+/.test(task.input);

    return (hasEventPattern || hasNumbers) && isEventType;
  }

  /**
   * Создает инструмент для категоризации событий
   */
  private getCategorizationTool() {
    return tool({
      description: "Автоматическая категоризация события на основе описания",
      inputSchema: z.object({
        eventType: z.string(),
        description: z.string(),
      }),
      execute: async ({ eventType, description }) => {
        const categories = {
          purchase: {
            продукты: [
              "хлеб",
              "молоко",
              "мясо",
              "овощи",
              "фрукты",
              "еда",
              "продукты",
            ],
            транспорт: [
              "такси",
              "автобус",
              "метро",
              "бензин",
              "топливо",
              "проезд",
            ],
            развлечения: [
              "кино",
              "театр",
              "концерт",
              "игра",
              "книга",
              "развлечение",
            ],
            одежда: ["рубашка", "брюки", "обувь", "куртка", "платье", "одежда"],
            здоровье: ["лекарство", "врач", "аптека", "анализы", "медицина"],
            дом: [
              "мебель",
              "ремонт",
              "коммунальные",
              "электричество",
              "интернет",
            ],
            образование: ["курс", "книга", "обучение", "семинар", "тренинг"],
          },
          task: {
            работа: ["проект", "отчет", "встреча", "презентация", "задача"],
            дом: ["уборка", "готовка", "покупки", "ремонт", "стирка"],
            здоровье: ["тренировка", "врач", "спорт", "диета", "анализы"],
            личное: ["хобби", "друзья", "семья", "отдых", "развитие"],
          },
        };

        const eventCategories =
          categories[eventType as keyof typeof categories] || {};
        const descLower = description.toLowerCase();

        for (const [category, keywords] of Object.entries(eventCategories)) {
          if (keywords.some((keyword) => descLower.includes(keyword))) {
            return category;
          }
        }

        return "общее";
      },
    });
  }

  /**
   * Создает инструмент для извлечения финансовой информации
   */
  private getFinancialExtractionTool() {
    return tool({
      description: "Извлечение суммы и валюты из текста",
      inputSchema: z.object({
        text: z.string(),
      }),
      execute: async ({ text }) => {
        // Регулярные выражения для поиска сумм
        const rublePatterns = [
          /(\d+(?:\.\d+)?)\s*(?:руб|рублей?|р\.?|₽)/i,
          /(\d+(?:\.\d+)?)\s*р(?:\s|$)/i,
        ];

        const dollarPatterns = [
          /\$(\d+(?:\.\d+)?)/i,
          /(\d+(?:\.\d+)?)\s*(?:доллар|долларов|usd)/i,
        ];

        const euroPatterns = [
          /€(\d+(?:\.\d+)?)/i,
          /(\d+(?:\.\d+)?)\s*(?:евро|eur)/i,
        ];

        // Проверяем рубли
        for (const pattern of rublePatterns) {
          const match = text.match(pattern);
          if (match) {
            return { amount: parseFloat(match[1]), currency: "RUB" };
          }
        }

        // Проверяем доллары
        for (const pattern of dollarPatterns) {
          const match = text.match(pattern);
          if (match) {
            return { amount: parseFloat(match[1]), currency: "USD" };
          }
        }

        // Проверяем евро
        for (const pattern of euroPatterns) {
          const match = text.match(pattern);
          if (match) {
            return { amount: parseFloat(match[1]), currency: "EUR" };
          }
        }

        // Если не нашли валюту, но есть число
        const numberMatch = /(\d+(?:\.\d+)?)/.exec(text);
        if (numberMatch) {
          return { amount: parseFloat(numberMatch[1]), currency: "RUB" }; // По умолчанию рубли
        }

        return null;
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
      // Используем существующую функцию парсинга как fallback
      const legacyParsed = await parseTask(
        task.input,
        this.createTelemetry("legacy-parse", task, telemetry),
      );

      // Структурированный парсинг с помощью AI
      const { object: structuredEvent } = await generateObject({
        model: this.getModel(),
        schema: eventSchema,
        system: `Ты - специалист по парсингу событий в системе Synoro AI.

Твоя задача - извлечь структурированную информацию из описания события.

ТИПЫ СОБЫТИЙ:
- purchase: покупки, трата денег
- task: задачи, дела, планы
- meeting: встречи, собрания, созвоны
- note: заметки, записи, идеи
- expense: расходы без конкретного товара
- income: доходы, поступления
- other: прочие события

Всегда указывай уровень уверенности в правильности парсинга.
Определи, нужен ли совет пользователю по этому событию.`,
        prompt: `Проанализируй и распарси это событие: "${task.input}"
        
Контекст: пользователь ${task.context.userId || "anonymous"} в канале ${task.context.channel}
        
Извлеки всю доступную информацию и структурируй её.`,
        temperature: this.defaultTemperature,
        tools: {
          categorizeEvent: this.getCategorizationTool(),
          extractFinancial: this.getFinancialExtractionTool(),
        },
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("parse-event", task, telemetry),
        },
      });

      let advice = undefined;

      // Генерируем совет, если нужно
      if (structuredEvent.needsAdvice) {
        try {
          advice = await advise(
            task.input,
            this.createTelemetry("generate-advice", task, telemetry),
          );
        } catch (error) {
          console.warn("Failed to generate advice:", error);
        }
      }

      // Комбинируем структурированные данные
      const combinedData = {
        ...legacyParsed,
        structured: structuredEvent,
        metadata: {
          processingTimestamp: new Date().toISOString(),
          agentName: this.name,
          confidence: structuredEvent.confidence,
        },
      };

      return this.createSuccessResult(
        {
          parsedEvent: legacyParsed,
          advice,
          structuredData: combinedData,
        },
        structuredEvent.confidence,
        `Parsed ${structuredEvent.type} event with confidence ${structuredEvent.confidence}`,
      );
    } catch (error) {
      console.error("Error in event processor agent:", error);
      return this.createErrorResult("Failed to process event");
    }
  }
}
