import type { MessageTypeResult, ParsedTask } from "../ai/types";
import type {
  MessageContext,
  MessageProcessorOptions,
  ProcessClassifiedMessageResult,
} from "../message-processor/types";
import type { AgentContext } from "./types";
import { AgentManager } from "./agent-manager";

/**
 * Новый процессор сообщений с использованием мультиагентной системы
 * Интегрируется с существующей архитектурой, но использует агентов
 */
export class AgentMessageProcessor {
  private agentManager: AgentManager;
  private isParsedTask(value: unknown): value is ParsedTask {
    if (typeof value !== "object" || value === null) return false;
    const v = value as Record<string, unknown>;
    return typeof v.action === "string" && typeof v.object === "string";
  }

  constructor() {
    this.agentManager = new AgentManager();
  }

  /**
   * Процессор для работы с классифицированными сообщениями через агентов
   */
  async processWithAgents(
    text: string,
    messageType: MessageTypeResult,
    context: MessageContext,
    options: MessageProcessorOptions & {
      useQualityControl?: boolean;
      maxQualityIterations?: number;
      targetQuality?: number;
    } = {},
  ): Promise<
    ProcessClassifiedMessageResult & {
      agentMetadata?: {
        agentsUsed: string[];
        totalSteps: number;
        qualityScore: number;
        processingTime: number;
      };
    }
  > {
    try {
      // Преобразуем контекст для агентной системы
      const agentContext: AgentContext = {
        userId: context.userId,
        chatId: context.chatId,
        messageId: context.messageId,
        channel: context.channel,
        metadata: context.metadata,
      };

      // Формируем телеметрию
      const telemetry = {
        functionId: options.questionFunctionId || "agent-processing",
        metadata: {
          ...context.metadata,
          messageType: messageType.type,
          confidence: messageType.confidence,
          needLogging: messageType.need_logging,
        },
      };

      // Обрабатываем сообщение через агентную систему
      const orchestrationResult = await this.agentManager.processMessage(
        text,
        agentContext,
        {
          useQualityControl: options.useQualityControl ?? true,
          maxQualityIterations: options.maxQualityIterations ?? 2,
          targetQuality: options.targetQuality ?? 0.8,
        },
        telemetry,
      );

      // Извлекаем данные для совместимости с существующим API
      let parsed: ParsedTask | null = null;

      // Если это событие и у нас есть парсированные данные
      if (
        messageType.type === "event" &&
        orchestrationResult.metadata?.agentData
      ) {
        const agentData = orchestrationResult.metadata.agentData as Record<
          string,
          unknown
        >;
        const parsedEvent =
          typeof agentData === "object" && agentData
            ? (agentData as { parsedEvent?: unknown }).parsedEvent
            : undefined;
        const structuredData =
          typeof agentData === "object" && agentData
            ? (agentData as { structuredData?: unknown }).structuredData
            : undefined;
        if (this.isParsedTask(parsedEvent)) {
          parsed = parsedEvent;
        } else if (this.isParsedTask(structuredData)) {
          parsed = structuredData;
        }
      }

      // Определяем модель, которая была использована
      const model = this.getModelFromAgents(orchestrationResult.agentsUsed);

      return {
        response: orchestrationResult.finalResponse,
        parsed,
        model,
        agentMetadata: {
          agentsUsed: orchestrationResult.agentsUsed,
          totalSteps: orchestrationResult.totalSteps,
          qualityScore: orchestrationResult.qualityScore,
          processingTime: orchestrationResult.metadata.processingTime,
        },
      };
    } catch (error) {
      console.error("Error in agent message processing:", error);

      // Fallback к простому ответу
      return {
        response:
          "Извините, произошла ошибка при обработке сообщения. Попробуйте еще раз.",
        parsed: null,
        model: "gpt-5-nano",
        agentMetadata: {
          agentsUsed: ["error-handler"],
          totalSteps: 1,
          qualityScore: 0.3,
          processingTime: 0,
        },
      };
    }
  }

  /**
   * Гибридный процессор: использует агентов для сложных задач,
   * старую систему для простых
   */
  async processHybrid(
    text: string,
    messageType: MessageTypeResult,
    context: MessageContext,
    options: MessageProcessorOptions & {
      forceAgentMode?: boolean;
      useQualityControl?: boolean;
    } = {},
  ): Promise<
    ProcessClassifiedMessageResult & {
      processingMode: "agents" | "legacy";
      agentMetadata?: any;
    }
  > {
    // Определяем, нужно ли использовать агентов
    const shouldUseAgents = this.shouldUseAgentProcessing(
      text,
      messageType,
      options.forceAgentMode,
    );

    if (shouldUseAgents) {
      const result = await this.processWithAgents(
        text,
        messageType,
        context,
        options,
      );
      return {
        ...result,
        processingMode: "agents",
      };
    } else {
      // Используем существующую систему для простых случаев
      const { processClassifiedMessage } = await import(
        "../message-processor/processor"
      );
      const result = await processClassifiedMessage(
        text,
        messageType,
        context,
        options,
      );

      return {
        ...result,
        processingMode: "legacy",
      };
    }
  }

  /**
   * Определяет, нужно ли использовать агентную систему
   */
  private shouldUseAgentProcessing(
    text: string,
    messageType: MessageTypeResult,
    forceAgentMode?: boolean,
  ): boolean {
    if (forceAgentMode) return true;

    // Критерии для использования агентов:

    // 1. Сложные вопросы
    const complexQuestionKeywords = [
      "анализ",
      "статистика",
      "сравни",
      "найди паттерн",
      "оптимизируй",
      "улучши",
      "план",
      "стратегия",
    ];

    // 2. Длинные сообщения (обычно более сложные)
    const isLongMessage = text.length > 100;

    // 3. Низкая уверенность классификации
    const lowConfidence = messageType.confidence < 0.7;

    // 4. Определенные типы сообщений
    const complexTypes = ["complex_task", "analysis"];

    const textLower = text.toLowerCase();
    const hasComplexKeywords = complexQuestionKeywords.some((keyword) =>
      textLower.includes(keyword),
    );

    return (
      hasComplexKeywords ||
      isLongMessage ||
      lowConfidence ||
      complexTypes.includes(messageType.type)
    );
  }

  /**
   * Извлекает информацию о модели из списка использованных агентов
   */
  private getModelFromAgents(agentsUsed: string[]): string {
    // Простая эвристика: если использовался orchestrator, то более мощная модель
    if (agentsUsed.includes("Task Orchestrator")) {
      return "gpt-5-mini";
    }
    if (agentsUsed.includes("Q&A Specialist")) {
      return "gpt-5-nano";
    }
    return "gpt-5-nano"; // По умолчанию
  }

  /**
   * Получение статистики работы агентов
   */
  getAgentStats() {
    return this.agentManager.getAgentStats();
  }

  /**
   * Получение списка доступных агентов
   */
  getAvailableAgents() {
    return this.agentManager.getAvailableAgents();
  }
}
