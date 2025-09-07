import type { AgentContext } from "./agent-context";
import type { MessageHistoryItem } from "./types";
import { AgentManager } from "./agent-manager";

/**
 * Процессор сообщений с использованием мультиагентной системы
 * Полностью заменяет старую систему обработки сообщений
 */
export class AgentMessageProcessor {
  private agentManager: AgentManager;

  constructor() {
    this.agentManager = new AgentManager();
  }

  /**
   * Процессор для работы с сообщениями через агентов
   */
  async processMessage(
    text: string,
    context: AgentContext,
    options: {
      useQualityControl?: boolean;
      maxQualityIterations?: number;
      targetQuality?: number;
      messageHistory?: MessageHistoryItem[];
    } = {},
  ): Promise<{
    response: string;
    parsed: any;
    model: string;
    agentMetadata: {
      agentsUsed: string[];
      totalSteps: number;
      qualityScore: number;
      processingTime: number;
      shouldLogEvent: boolean;
    };
  }> {
    try {
      // Формируем телеметрию для основного процессора
      const telemetry = {
        functionId: "agent-processor-main",
        metadata: {
          ...context.metadata,
          textLength: text.length,
        },
      };

      // Обрабатываем сообщение через агентную систему
      const orchestrationResult = await this.agentManager.processMessage(
        text,
        context,
        {
          useQualityControl: false, // Отключен контроль качества
          maxQualityIterations: 0,
          targetQuality: 0,
          messageHistory: options.messageHistory,
        },
        telemetry,
      );

      // Извлекаем данные для совместимости с существующим API
      let parsed: any = null;

      // Если у нас есть парсированные данные от агентов
      if (orchestrationResult.metadata?.agentData) {
        const agentData = orchestrationResult.metadata.agentData as Record<
          string,
          unknown
        >;
        parsed = agentData;
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
          qualityScore: 1.0, // Fixed quality score since evaluation is disabled
          processingTime: orchestrationResult.metadata.processingTime,
          // Передаем флаг для автоматического логирования событий
          shouldLogEvent: orchestrationResult.metadata.shouldLogEvent ?? false,
        },
      };
    } catch (error) {
      console.error("Error in agent message processing:", error);

      // Пробрасываем ошибку дальше
      throw error;
    }
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
