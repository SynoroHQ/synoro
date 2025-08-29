import type { AgentTask } from "@synoro/api/lib/agents/types";
import { FastResponseAgent } from "@synoro/api/lib/agents/fast-response-agent";

export interface TelegramFastResponse {
  shouldSendFast: boolean;
  fastResponse: string;
  needsFullProcessing: boolean;
  confidence: number;
  processingType?: "fast" | "full" | "none";
}

/**
 * Сервис быстрых ответов для Telegram бота
 * Использует FastResponseAgent для интеллектуальной обработки
 */
export class TelegramFastResponseService {
  private fastAgent: FastResponseAgent;

  constructor() {
    this.fastAgent = new FastResponseAgent();
  }

  /**
   * Анализ сообщения и получение быстрого ответа
   */
  async analyzeMessage(
    text: string,
    userId: string,
    chatId: string,
    messageId?: string
  ): Promise<TelegramFastResponse> {
    try {
      // Создаем задачу для агента
      const task: AgentTask = {
        id: `tg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "chat",
        input: text,
        context: {
          userId,
          chatId,
          messageId,
          channel: "telegram",
          timestamp: new Date().toISOString(),
        },
      };

      // Проверяем, может ли агент обработать задачу
      const canHandle = await this.fastAgent.canHandle(task);
      if (!canHandle) {
        return {
          shouldSendFast: false,
          fastResponse: "",
          needsFullProcessing: true,
          confidence: 0,
          processingType: "full",
        };
      }

      // Обрабатываем через FastResponseAgent
      const result = await this.fastAgent.process(task);

      if (result.success && result.data) {
        return {
          shouldSendFast: true,
          fastResponse: result.data as string,
          needsFullProcessing: false,
          confidence: result.confidence,
          processingType: "fast",
        };
      } else {
        // Если агент не смог дать быстрый ответ, отправляем на полную обработку
        return {
          shouldSendFast: false,
          fastResponse: "",
          needsFullProcessing: true,
          confidence: result.confidence,
          processingType: "full",
        };
      }
    } catch (error) {
      console.error("Ошибка в TelegramFastResponseService:", error);
      
      // В случае ошибки отправляем на полную обработку
      return {
        shouldSendFast: false,
        fastResponse: "",
        needsFullProcessing: true,
        confidence: 0,
        processingType: "full",
      };
    }
  }

  /**
   * Получение статистики работы сервиса
   */
  getStats() {
    return {
      agentStats: this.fastAgent.getStats(),
      serviceName: "TelegramFastResponseService",
      version: "1.0.0",
    };
  }

  /**
   * Очистка кэша агента
   */
  clearCache() {
    this.fastAgent.clearCache();
  }
}

// Экспортируем singleton instance
export const telegramFastResponseService = new TelegramFastResponseService();
