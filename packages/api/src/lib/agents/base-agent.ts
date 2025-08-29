import type { LanguageModel } from "ai";
import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateObject, generateText } from "ai";
import { z } from "zod";

import type {
  AgentCapability,
  AgentResult,
  AgentTask,
  AgentTelemetry,
  BaseAgent,
} from "./types";

// Инициализация AI провайдеров
const oai = openai;
const moonshotAI = createOpenAICompatible({
  name: "moonshot",
  apiKey: process.env.MOONSHOT_API_KEY,
  baseURL: "https://api.moonshot.ai/v1",
});

function getActiveProvider() {
  return process.env.AI_PROVIDER === "moonshot" ? moonshotAI : oai;
}

function getModelName(defaultModel = "gpt-5-mini"): string {
  if (process.env.AI_PROVIDER === "moonshot") {
    return process.env.MOONSHOT_ADVICE_MODEL ?? "moonshot-v1-32k";
  }
  return process.env.OPENAI_ADVICE_MODEL ?? defaultModel;
}

// Схема для анализа контекста
const contextAnalysisSchema = z.object({
  relevantInfo: z.array(z.string()),
  userIntent: z.string(),
  complexity: z.enum(["simple", "medium", "complex"]),
  suggestedApproach: z.string(),
  confidence: z.number().min(0).max(1),
});

// Схема для самооценки качества
const qualityAssessmentSchema = z.object({
  accuracy: z.number().min(0).max(1),
  completeness: z.number().min(0).max(1),
  relevance: z.number().min(0).max(1),
  clarity: z.number().min(0).max(1),
  overallScore: z.number().min(0).max(1),
  improvements: z.array(z.string()),
});

/**
 * Базовый класс для всех агентов
 * Предоставляет общую функциональность и интерфейс
 */
export abstract class AbstractAgent implements BaseAgent {
  abstract name: string;
  abstract description: string;
  abstract capabilities: AgentCapability[];

  protected defaultModel: string;
  protected defaultTemperature: number;

  protected cache = new Map<string, { result: any; timestamp: number }>();
  protected cacheTimeout = 5 * 60 * 1000; // 5 минут

  constructor(defaultModel = "gpt-5-mini", defaultTemperature = 0.3) {
    this.defaultModel = defaultModel;
    this.defaultTemperature = defaultTemperature;
  }

  /**
   * Получение модели для агента
   */
  getModel(): LanguageModel {
    return getActiveProvider()(getModelName(this.defaultModel));
  }

  /**
   * Проверка возможности обработки задачи агентом
   */
  abstract canHandle(task: AgentTask): Promise<boolean>;

  /**
   * Основная обработка задачи агентом
   */
  abstract process(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<AgentResult<unknown>>;

  /**
   * Генерация уникального ID для телеметрии
   */
  protected generateFunctionId(operation: string): string {
    return `agent-${this.name.toLowerCase().replace(/\s+/g, "-")}-${operation}`;
  }

  /**
   * Создание телеметрии для операции
   */
  protected createTelemetry(
    operation: string,
    task: AgentTask,
  ): AgentTelemetry {
    const context = task.context;

    return {
      functionId: this.generateFunctionId(operation),
      metadata: {
        agentName: this.name,
        taskType: task.type,
        taskId: task.id,
        userId: context?.userId ?? "anonymous",
        channel: context?.channel ?? "unknown",
        // Убираем лишние поля, оставляем только необходимые
        ...(context?.chatId && { chatId: context.chatId }),
        ...(context?.messageId && { messageId: context.messageId }),
      },
    };
  }

  /**
   * Создание результата с ошибкой
   */
  protected createErrorResult<T = string>(
    error: string,
    confidence = 0,
  ): AgentResult<T> {
    return {
      success: false,
      error,
      confidence,
    };
  }

  /**
   * Создание успешного результата
   */
  protected createSuccessResult<T>(
    data: T,
    confidence = 1,
    reasoning?: string,
  ): AgentResult<T> {
    return {
      success: true,
      data,
      confidence,
      reasoning,
    };
  }

  /**
   * Проверка соответствия возможности агента типу задачи
   */
  protected hasCapabilityForTask(taskType: string): boolean {
    return this.capabilities.some(
      (cap) =>
        cap.category === taskType ||
        cap.name.toLowerCase().includes(taskType.toLowerCase()),
    );
  }

  /**
   * Получение наиболее подходящей возможности для задачи
   */
  protected getBestCapabilityForTask(taskType: string): AgentCapability | null {
    const matching = this.capabilities.filter(
      (cap) =>
        cap.category === taskType ||
        cap.name.toLowerCase().includes(taskType.toLowerCase()),
    );

    if (matching.length === 0) return null;

    return matching.reduce((best, current) =>
      current.confidence > best.confidence ? current : best,
    );
  }

  /**
   * Кэширование результатов для повышения производительности
   */
  protected getCachedResult<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result as T;
    }
    this.cache.delete(key);
    return null;
  }

  protected setCachedResult<T>(key: string, result: T): void {
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  /**
   * Анализ контекста задачи для лучшего понимания
   */
  protected async analyzeContext(task: AgentTask): Promise<{
    relevantInfo: string[];
    userIntent: string;
    complexity: "simple" | "medium" | "complex";
    suggestedApproach: string;
    confidence: number;
  }> {
    const cacheKey = `context-${task.id}`;
    const cached = this.getCachedResult<any>(cacheKey);
    if (cached) return cached;

    try {
      const { object } = await generateObject({
        model: this.getModel(),
        schema: contextAnalysisSchema,
        system: `Ты - эксперт по анализу контекста. Проанализируй задачу и определи:
1. Ключевую релевантную информацию
2. Намерение пользователя
3. Сложность задачи
4. Рекомендуемый подход к решению
5. Уровень уверенности в анализе`,
        prompt: `Задача: ${task.input}\nКонтекст: ${JSON.stringify(task.context)}\nТип: ${task.type}`,
        temperature: 0.2,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("analyze-context", task),
        },
      });

      this.setCachedResult(cacheKey, object);
      return object;
    } catch (error) {
      console.warn("Context analysis failed, using fallback:", error);
      return {
        relevantInfo: [task.input],
        userIntent: "Обработать запрос пользователя",
        complexity: "medium" as const,
        suggestedApproach: "Стандартный подход обработки",
        confidence: 0.5,
      };
    }
  }

  /**
   * Самооценка качества ответа
   */
  protected async assessQuality(
    input: string,
    response: string,
    task: AgentTask,
  ): Promise<{
    accuracy: number;
    completeness: number;
    relevance: number;
    clarity: number;
    overallScore: number;
    improvements: string[];
  }> {
    try {
      const { object } = await generateObject({
        model: this.getModel(),
        schema: qualityAssessmentSchema,
        system: `Ты - эксперт по оценке качества ответов ИИ. Оцени ответ по критериям:
- Точность (accuracy): насколько ответ фактически корректен
- Полнота (completeness): насколько полно отвечает на вопрос
- Релевантность (relevance): насколько соответствует запросу
- Ясность (clarity): насколько понятен и структурирован
- Общая оценка (overallScore): средневзвешенная оценка
- Улучшения (improvements): конкретные предложения по улучшению`,
        prompt: `Запрос: ${input}\nОтвет: ${response}\nКонтекст: ${task.type}`,
        temperature: 0.1,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("assess-quality", task),
        },
      });

      return object;
    } catch (error) {
      console.warn("Quality assessment failed:", error);
      return {
        accuracy: 0.7,
        completeness: 0.7,
        relevance: 0.7,
        clarity: 0.7,
        overallScore: 0.7,
        improvements: [],
      };
    }
  }

  /**
   * Улучшенная генерация ответа с анализом контекста
   */
  protected async generateResponse(
    input: string,
    system: string,
    task: AgentTask,
    options: {
      useContextAnalysis?: boolean;
      useQualityAssessment?: boolean;
      maxRetries?: number;
    } = {},
  ): Promise<string> {
    const {
      useContextAnalysis = true,
      useQualityAssessment = false,
      maxRetries = 2,
    } = options;

    let contextInfo = "";
    if (useContextAnalysis) {
      const analysis = await this.analyzeContext(task);
      contextInfo = `\n\nАНАЛИЗ КОНТЕКСТА:\n- Намерение: ${analysis.userIntent}\n- Сложность: ${analysis.complexity}\n- Подход: ${analysis.suggestedApproach}\n- Ключевая информация: ${analysis.relevantInfo.join(", ")}`;
    }

    const enhancedSystem = system + contextInfo;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const { text } = await generateText({
          model: this.getModel(),
          system: enhancedSystem,
          prompt: input,
          temperature: this.defaultTemperature + attempt * 0.1, // Увеличиваем креативность при повторах
          experimental_telemetry: {
            isEnabled: true,
            ...this.createTelemetry(`respond-attempt-${attempt}`, task),
          },
        });

        const response = text.trim();

        // Оценка качества (если включена)
        if (useQualityAssessment && attempt < maxRetries) {
          const quality = await this.assessQuality(input, response, task);
          if (quality.overallScore < 0.7) {
            console.log(
              `Качество ответа низкое (${quality.overallScore.toFixed(2)}), повторяю попытку...`,
            );
            continue;
          }
        }

        return response;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        console.warn(`Попытка ${attempt + 1} не удалась, повторяю:`, error);
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1)),
        ); // Экспоненциальная задержка
      }
    }

    throw new Error("Все попытки генерации ответа не удались");
  }

  /**
   * Очистка кэша для освобождения памяти
   */
  protected clearCache(): void {
    this.cache.clear();
  }

  /**
   * Создание хеша для входных данных (для кэширования)
   */
  protected createInputHash(input: string): string {
    // Простая хеш-функция для создания уникального ключа
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Преобразование в 32-битное число
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Получение статистики кэша
   */
  protected getCacheStats(): { size: number; hitRate: number } {
    const now = Date.now();
    let validEntries = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp < this.cacheTimeout) {
        validEntries++;
      } else {
        this.cache.delete(key);
      }
    }

    return {
      size: validEntries,
      hitRate: validEntries / Math.max(this.cache.size, 1),
    };
  }
}
