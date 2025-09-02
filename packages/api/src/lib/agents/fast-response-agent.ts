import { generateObject, generateText } from "ai";
import { z } from "zod";

import type {
  AgentCapability,
  AgentResult,
  AgentTask,
  AgentTelemetry,
} from "./types";
import { AbstractAgent } from "./base-agent";

// Схема для быстрого анализа запроса
const fastAnalysisSchema = z.object({
  isSimpleQuery: z.boolean(),
  responseType: z.enum(["direct", "template", "ai_generated"]),
  confidence: z.number().min(0).max(1),
  suggestedResponse: z.string().optional(),
  needsFullProcessing: z.boolean(),
  reasoning: z.string(),
});

// Схема для генерации быстрого ответа
const fastResponseSchema = z.object({
  response: z.string(),
  confidence: z.number().min(0).max(1),
  responseTime: z.number(),
  usedTemplate: z.boolean(),
});

/**
 * Агент быстрых ответов с использованием ИИ
 * Обеспечивает мгновенные интеллектуальные ответы на простые запросы
 */
export class FastResponseAgent extends AbstractAgent {
  name = "Fast Response Agent";
  description =
    "Обеспечивает быстрые интеллектуальные ответы через ИИ для простых запросов";

  capabilities: AgentCapability[] = [
    {
      name: "Fast AI Analysis",
      description: "Быстрый анализ запросов с помощью ИИ",
      category: "analysis",
      confidence: 0.95,
    },
    {
      name: "Instant Response Generation",
      description: "Мгновенная генерация ответов через ИИ",
      category: "response",
      confidence: 0.9,
    },
    {
      name: "Template-based Responses",
      description: "Использование ИИ-шаблонов для типовых ответов",
      category: "templates",
      confidence: 0.85,
    },
  ];

  // Кэш для быстрых ИИ-ответов
  private aiResponseCache = new Map<
    string,
    {
      response: string;
      confidence: number;
      timestamp: number;
      usageCount: number;
    }
  >();

  // Шаблоны ответов, генерируемые ИИ
  private aiTemplates = new Map<
    string,
    {
      template: string;
      confidence: number;
      lastUpdated: number;
    }
  >();

  constructor() {
    super("gpt-5-mini", 0.1); // Низкая температура для быстрых точных ответов
    void this.initializeAITemplates();
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    // Анализируем сообщение, чтобы определить, подходит ли оно для быстрого ответа
    const analysis = await this.fastAnalyzeQuery(task);

    // Можем обработать только простые запросы, которые не требуют полной обработки
    return analysis.isSimpleQuery && !analysis.needsFullProcessing;
  }

  /**
   * Инициализация ИИ-шаблонов для быстрых ответов
   */
  private async initializeAITemplates(): Promise<void> {
    const commonQueries = [
      "приветствие",
      "благодарность",
      "вопрос о возможностях",
      "просьба о помощи",
      "подтверждение",
      "прощание",
    ];

    for (const queryType of commonQueries) {
      try {
        const templateData: Record<string, unknown> =
          await this.generateTemplateData(queryType);
        this.aiTemplates.set(queryType, {
          template: JSON.stringify(templateData),
          confidence: 0.9,
          lastUpdated: Date.now(),
        });
      } catch (error) {
        console.warn(`Не удалось создать ИИ-шаблон для ${queryType}:`, error);
      }
    }
  }

  /**
   * Генерация ИИ-шаблона для типа запроса
   */
  private async generateTemplateData(
    input: string,
  ): Promise<Record<string, unknown>> {
    const { text } = await generateText({
      model: this.getModel(),
      system: `Ты - эксперт по созданию шаблонов ответов для чат-бота. 
      Создай дружелюбный, полезный шаблон ответа для типа запроса: "${input}".
      Шаблон должен быть универсальным, но персонализированным.
      Используй переменные в формате {variable} где необходимо.`,
      prompt: `Создай шаблон ответа для: ${input}`,
      temperature: 0.3,
    });

    try {
      return JSON.parse(text.trim()) as Record<string, unknown>;
    } catch {
      return { template: text.trim() };
    }
  }

  /**
   * Быстрый анализ запроса с помощью ИИ
   */
  private async fastAnalyzeQuery(task: AgentTask): Promise<{
    isSimpleQuery: boolean;
    responseType: "direct" | "template" | "ai_generated";
    confidence: number;
    suggestedResponse?: string;
    needsFullProcessing: boolean;
    reasoning: string;
  }> {
    const cacheKey = `analysis-${this.createInputHash(task.input)}`;
    const cached = this.getCachedResult<{
      isSimpleQuery: boolean;
      responseType: "direct" | "template" | "ai_generated";
      confidence: number;
      suggestedResponse?: string;
      needsFullProcessing: boolean;
      reasoning: string;
    }>(cacheKey);
    if (cached) return cached;

    try {
      const { object } = await generateObject({
        model: this.getModel(),
        schema: fastAnalysisSchema,
        system: `Ты - эксперт по быстрому анализу пользовательских запросов.
        Определи, можно ли дать быстрый ответ на этот запрос или нужна полная обработка.
        
        КРИТЕРИИ ДЛЯ БЫСТРОГО ОТВЕТА (isSimpleQuery: true):
        - Простые приветствия: "привет", "здравствуй", "добрый день"
        - Благодарности: "спасибо", "благодарю"
        - Подтверждения: "да", "нет", "ок", "хорошо", "согласен"
        - Прощания: "пока", "до свидания", "увидимся"
        - Базовые вопросы о возможностях: "что ты умеешь?", "какие у тебя функции?"
        - Общие вопросы не по теме: "как дела?", "что нового?"
        
        КРИТЕРИИ ДЛЯ ПОЛНОЙ ОБРАБОТКИ (isSimpleQuery: false, needsFullProcessing: true):
        - Запись дел/задач: "записать", "добавить дело", "создать задачу", "запомни", "отметь"
        - Управление задачами: "показать дела", "удалить задачу", "отметить выполненным", "мои задачи"
        - Работа с событиями: "напомни", "создать событие", "планирование", "встреча", "дедлайн"
        - Анализ данных: "статистика", "отчет", "анализ", "сколько", "когда", "где"
        - Сложные запросы: многоэтапные задачи, требующие взаимодействия с базой данных
        - Любые запросы, связанные с продуктивностью и управлением временем
        - Запросы с конкретными датами, временем, местами
        - Запросы на поиск, фильтрацию, сортировку информации
        
        ВАЖНО: Если сообщение содержит слова "напомни", "завтра", "сегодня", "завтра", "послезавтра", 
        "в понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье" 
        или конкретные действия (купить, сделать, позвонить, встретиться и т.д.) - 
        это ВСЕГДА требует полной обработки через мультиагентов!
        
        ТИПЫ ОТВЕТОВ:
        - direct: Прямой короткий ответ
        - template: Использовать готовый шаблон
        - ai_generated: Сгенерировать новый ответ через ИИ`,
        prompt: `Проанализируй запрос: "${task.input}"`,
        temperature: 0.1,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("fast-analysis", task),
        },
      });

      const result = object as {
        isSimpleQuery: boolean;
        responseType: "direct" | "template" | "ai_generated";
        confidence: number;
        suggestedResponse?: string;
        needsFullProcessing: boolean;
        reasoning: string;
      };
      this.setCachedResult(cacheKey, result);
      return result;
    } catch (error: unknown) {
      console.warn("Ошибка быстрого анализа:", error);
      return {
        isSimpleQuery: false,
        responseType: "ai_generated",
        confidence: 0.3,
        needsFullProcessing: true,
        reasoning: "Ошибка анализа, требуется полная обработка",
      };
    }
  }

  /**
   * Генерация быстрого ответа через ИИ
   */
  private async generateFastAIResponse(
    input: string,
    task: AgentTask,
  ): Promise<string> {
    const cacheKey = `response-${this.createInputHash(input)}`;
    const cached = this.aiResponseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      cached.usageCount++;
      console.log("⚡ Использован кэшированный ИИ-ответ");
      return cached.response;
    }

    const startTime = Date.now();

    try {
      const { object } = await generateObject({
        model: this.getModel(),
        schema: fastResponseSchema,
        system: `Ты - дружелюбный и полезный ИИ-помощник в системе Synoro.
        Дай краткий, точный и полезный ответ на запрос пользователя.
        
        ПРИНЦИПЫ БЫСТРЫХ ОТВЕТОВ:
        - Будь дружелюбным и персонализированным
        - Отвечай кратко, но информативно
        - Предлагай дальнейшую помощь где уместно
        - Используй эмодзи для дружелюбности (умеренно)
        - Говори на русском языке`,
        prompt: `Дай быстрый ответ на: "${input}"`,
        temperature: 0.2,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("fast-ai-response", task),
        },
      });

      const responseTime = Date.now() - startTime;
      const response = object.response;

      // Кэшируем успешный ответ
      this.aiResponseCache.set(cacheKey, {
        response,
        confidence: object.confidence,
        timestamp: Date.now(),
        usageCount: 1,
      });

      console.log(`🤖 Сгенерирован быстрый ИИ-ответ за ${responseTime}ms`);
      return response;
    } catch (error: unknown) {
      console.error("Ошибка генерации быстрого ИИ-ответа:", error);
      return "Понял вас! Чем могу помочь? 😊";
    }
  }

  /**
   * Основная обработка быстрого ответа
   */
  async process(
    task: AgentTask,
    _telemetry?: AgentTelemetry,
  ): Promise<AgentResult<string>> {
    const startTime = Date.now();

    try {
      // 1. Быстрый анализ запроса через ИИ
      const analysis = await this.fastAnalyzeQuery(task);

      if (!analysis.isSimpleQuery || analysis.needsFullProcessing) {
        return this.createErrorResult(
          "Запрос требует полной обработки",
          analysis.confidence,
        );
      }

      let response: string;

      // 2. Выбираем стратегию ответа на основе ИИ-анализа
      switch (analysis.responseType) {
        case "direct":
          response = analysis.suggestedResponse ?? "Понял! 👍";
          break;

        case "template": {
          const templateType = this.detectTemplateType(task.input);

          // Если это напоминание или действие, не обрабатываем как простой запрос
          if (templateType === "напоминание" || templateType === "действие") {
            return this.createErrorResult(
              "Запрос требует полной обработки через мультиагентов",
              analysis.confidence,
            );
          }

          const template = this.aiTemplates.get(templateType);
          if (template) {
            const templateData = JSON.parse(template.template) as Record<
              string,
              unknown
            >;
            response = this.fillTemplate(templateData, task);
          } else {
            response = await this.generateFastAIResponse(task.input, task);
          }
          break;
        }

        case "ai_generated":
        default: {
          response = await this.generateFastAIResponse(task.input, task);
          break;
        }
      }

      const processingTime = Date.now() - startTime;

      return this.createSuccessResult(
        response,
        analysis.confidence,
        `Быстрый ИИ-ответ сгенерирован за ${processingTime}ms (${analysis.responseType})`,
      );
    } catch (error) {
      console.error("Ошибка в FastResponseAgent:", error);
      return this.createErrorResult(
        "Не удалось сгенерировать быстрый ответ",
        0.3,
      );
    }
  }

  /**
   * Определение типа шаблона на основе входного текста
   */
  private detectTemplateType(input: string): string {
    const lowerInput = input.toLowerCase();

    // Проверяем на напоминания и задачи - они НЕ должны обрабатываться как простые
    if (
      /напомни|завтра|сегодня|послезавтра|понедельник|вторник|среда|четверг|пятница|суббота|воскресенье/.test(
        lowerInput,
      )
    ) {
      return "напоминание"; // Это будет обработано как сложный запрос
    }

    // Проверяем на конкретные действия
    if (
      /купить|сделать|позвонить|встретиться|записать|добавить|создать|показать|удалить/.test(
        lowerInput,
      )
    ) {
      return "действие"; // Это будет обработано как сложный запрос
    }

    // Простые приветствия
    if (/привет|здравствуй|добрый/.test(lowerInput)) return "приветствие";

    // Благодарности
    if (/спасибо|благодарю/.test(lowerInput)) return "благодарность";

    // Базовые вопросы о возможностях (только общие, не конкретные)
    if (
      /что.*можешь|что.*умеешь|возможности/.test(lowerInput) &&
      !/записать|добавить|создать|показать|удалить/.test(lowerInput)
    ) {
      return "вопрос о возможностях";
    }

    // Простые просьбы о помощи (не связанные с задачами)
    if (
      /помоги|помощь/.test(lowerInput) &&
      !/записать|добавить|создать|показать|удалить/.test(lowerInput)
    ) {
      return "просьба о помощи";
    }

    // Подтверждения
    if (/^да$|^нет$|^ок$|^хорошо$|^согласен$/.test(lowerInput))
      return "подтверждение";

    // Прощания
    if (/пока|до свидания|увидимся/.test(lowerInput)) return "прощание";

    return "общий";
  }

  /**
   * Заполнение шаблона переменными
   */
  private fillTemplate(
    template: Record<string, unknown>,
    task: AgentTask,
  ): string {
    return JSON.stringify(template)
      .replace(/{user}/g, task.context.userId ?? "друг")
      .replace(/{time}/g, new Date().toLocaleTimeString("ru-RU"))
      .replace(/{date}/g, new Date().toLocaleDateString("ru-RU"));
  }

  /**
   * Получение статистики быстрых ответов
   */
  getStats(): {
    cacheSize: number;
    templatesCount: number;
    totalUsage: number;
    averageResponseTime: number;
  } {
    const totalUsage = Array.from(this.aiResponseCache.values()).reduce(
      (sum, item) => sum + item.usageCount,
      0,
    );

    return {
      cacheSize: this.aiResponseCache.size,
      templatesCount: this.aiTemplates.size,
      totalUsage,
      averageResponseTime: 50, // Примерное время для быстрых ответов
    };
  }

  /**
   * Очистка кэша быстрых ответов
   */
  clearCache(): void {
    this.aiResponseCache.clear();
    console.log("🧹 Кэш быстрых ИИ-ответов очищен");
  }
}
