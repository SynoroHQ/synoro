import type { LanguageModel } from "ai";
import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

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

function getModelName(defaultModel = "gpt-5-nano"): string {
  if (process.env.AI_PROVIDER === "moonshot") {
    return process.env.MOONSHOT_ADVICE_MODEL ?? "moonshot-v1-8k";
  }
  return process.env.OPENAI_ADVICE_MODEL ?? defaultModel;
}

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

  constructor(defaultModel = "gpt-5-nano", defaultTemperature = 0.4) {
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
    baseTelemetry?: AgentTelemetry,
  ): AgentTelemetry {
    return {
      functionId:
        baseTelemetry?.functionId ?? this.generateFunctionId(operation),
      metadata: {
        ...baseTelemetry?.metadata,
        agentName: this.name,
        taskType: task.type,
        taskId: task.id,
        userId: task.context.userId ?? "anonymous",
        channel: task.context.channel,
        ...(task.context.chatId && { chatId: task.context.chatId }),
        ...(task.context.messageId && { messageId: task.context.messageId }),
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
   * Унифицированная генерация ответа с телеметрией
   */
  protected async generateResponse(
    input: string,
    system: string,
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<string> {
    const { text } = await generateText({
      model: this.getModel(),
      system,
      prompt: input,
      temperature: this.defaultTemperature,
      experimental_telemetry: {
        isEnabled: true,
        ...this.createTelemetry("respond", task, telemetry),
      },
    });
    return text.trim();
  }
}
