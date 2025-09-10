import type { LanguageModel } from "ai";
import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateObject, generateText } from "ai";
import { z } from "zod";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

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

  constructor(defaultModel = "gpt-5-mini") {
    this.defaultModel = defaultModel;
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
        userId: context.userId ?? "anonymous",
        channel: context.channel ?? "unknown",
        ...(context.messageId ? { messageId: context.messageId } : undefined),
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
   * Анализ контекста задачи для лучшего понимания
   */
  protected async analyzeContext(task: AgentTask): Promise<{
    relevantInfo: string[];
    userIntent: string;
    complexity: "simple" | "medium" | "complex";
    suggestedApproach: string;
    confidence: number;
  }> {
    try {
      const { object } = await generateObject({
        model: this.getModel(),
        schema: contextAnalysisSchema,
        system: await getPrompt(PROMPT_KEYS.BASE_AGENT_CONTEXT),
        prompt: `Задача: ${task.input}\nКонтекст: ${JSON.stringify(task.context)}\nТип: ${task.type}`,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("analyze-context", task),
        },
      });

      return object;
    } catch (error) {
      console.warn("Context analysis failed:", error);
      throw new Error("Ошибка анализа контекста задачи");
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
        system: await getPrompt(PROMPT_KEYS.BASE_AGENT_QUALITY),
        prompt: `Запрос: ${input}\nОтвет: ${response}\nКонтекст: ${task.type}`,
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
   * Создание хеша для входных данных (для кэширования)
   */
  protected createInputHash(input: string): string {
    // Простая хеш-функция для создания уникального ключа
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Преобразование в 32-битное число
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Форматирует историю сообщений для включения в промпт
   * @param task - Задача агента
   * @param maxHistoryLength - Максимальная длина истории в символах
   * @returns Форматированная история сообщений
   */
  protected formatMessageHistory(
    task: AgentTask,
    maxHistoryLength = 1500,
  ): string {
    if (!task.messageHistory || task.messageHistory.length === 0) {
      return "";
    }

    const historyText = task.messageHistory
      .map((msg) => {
        const timestamp = msg.timestamp.toLocaleString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const role =
          msg.role === "user"
            ? "Пользователь"
            : msg.role === "assistant"
              ? "Ассистент"
              : msg.role === "system"
                ? "Система"
                : "Инструмент";

        return `[${timestamp}] ${role}: ${msg.content}`;
      })
      .join("\n");

    // Обрезаем если слишком длинно
    if (historyText.length > maxHistoryLength) {
      return historyText.substring(0, maxHistoryLength - 3) + "...";
    }

    return historyText;
  }

  /**
   * Получает краткую сводку истории для контекста
   * @param task - Задача агента
   * @param maxMessages - Максимальное количество сообщений для сводки
   * @returns Краткая сводка истории
   */
  protected getHistorySummary(task: AgentTask, maxMessages = 3): string {
    if (!task.messageHistory || task.messageHistory.length === 0) {
      return "История диалога пуста";
    }

    const recentMessages = task.messageHistory.slice(-maxMessages);
    const summary = recentMessages
      .map((msg, index) => {
        const role = msg.role === "user" ? "Пользователь" : "Ассистент";
        const content =
          msg.content.length > 100
            ? msg.content.substring(0, 100) + "..."
            : msg.content;
        return `${index + 1}. ${role}: ${content}`;
      })
      .join("\n");

    return `Последние ${recentMessages.length} сообщений:\n${summary}`;
  }

  /**
   * Создает расширенный промпт с учетом истории сообщений
   * @param basePrompt - Базовый промпт
   * @param task - Задача агента
   * @param options - Опции форматирования
   * @returns Расширенный промпт с историей
   */
  protected createPromptWithHistory(
    basePrompt: string,
    task: AgentTask,
    options: {
      includeFullHistory?: boolean;
      maxHistoryLength?: number;
      includeSummary?: boolean;
    } = {},
  ): string {
    const {
      includeFullHistory = false,
      maxHistoryLength = 1500,
      includeSummary = true,
    } = options;

    let historySection = "";

    if (task.messageHistory && task.messageHistory.length > 0) {
      if (includeFullHistory) {
        const fullHistory = this.formatMessageHistory(task, maxHistoryLength);
        historySection = `\n\nИСТОРИЯ ДИАЛОГА:\n${fullHistory}`;
      } else if (includeSummary) {
        const summary = this.getHistorySummary(task);
        historySection = `\n\nКОНТЕКСТ ДИАЛОГА:\n${summary}`;
      }
    }

    return basePrompt + historySection;
  }

  /**
   * Анализирует историю сообщений для понимания контекста
   * @param task - Задача агента
   * @returns Анализ истории сообщений
   */
  protected async analyzeMessageHistory(task: AgentTask): Promise<{
    conversationTopic: string;
    userIntent: string;
    conversationMood: "positive" | "neutral" | "negative";
    keyTopics: string[];
    needsFollowUp: boolean;
  }> {
    if (!task.messageHistory || task.messageHistory.length === 0) {
      return {
        conversationTopic: "Новый диалог",
        userIntent: "Неизвестно",
        conversationMood: "neutral",
        keyTopics: [],
        needsFollowUp: false,
      };
    }

    try {
      const { object } = await generateObject({
        model: this.getModel(),
        schema: z.object({
          conversationTopic: z.string().describe("Основная тема разговора"),
          userIntent: z.string().describe("Намерение пользователя"),
          conversationMood: z
            .enum(["positive", "neutral", "negative"])
            .describe("Настроение диалога"),
          keyTopics: z.array(z.string()).describe("Ключевые темы"),
          needsFollowUp: z.boolean().describe("Нужно ли продолжение диалога"),
        }),
        system: `Ты - эксперт по анализу диалогов. Проанализируй историю сообщений и определи:
1. Основную тему разговора
2. Намерение пользователя
3. Настроение диалога (позитивное, нейтральное, негативное)
4. Ключевые темы, которые обсуждались
5. Нужно ли продолжение диалога

Будь кратким и точным в анализе.`,
        prompt: `Проанализируй историю диалога:\n${this.formatMessageHistory(task, 2000)}`,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("analyze-history", task),
        },
      });

      return object;
    } catch (error) {
      console.warn("History analysis failed:", error);
      return {
        conversationTopic: "Анализ недоступен",
        userIntent: "Неизвестно",
        conversationMood: "neutral",
        keyTopics: [],
        needsFollowUp: false,
      };
    }
  }
}
