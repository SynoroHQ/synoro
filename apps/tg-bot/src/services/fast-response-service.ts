import { apiClient } from "../api/client";

export interface TelegramFastResponse {
  shouldSendFast: boolean;
  fastResponse: string;
  needsFullProcessing: boolean;
  confidence: number;
  processingType?: "fast" | "full" | "none";
}

/**
 * Сервис быстрых ответов для Telegram бота
 * Использует API для взаимодействия с FastResponseAgent
 */
export class TelegramFastResponseService {
  /**
   * Анализ сообщения и получение быстрого ответа
   */
  async analyzeMessage(
    text: string,
    userId: string,
    messageId?: string,
  ): Promise<TelegramFastResponse> {
    try {
      // Отправляем запрос через API
      const result = await apiClient.fastResponse.analyze.mutate({
        text,
        userId,
        messageId,
      });

      return result;
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
  async getStats() {
    try {
      return await apiClient.fastResponse.stats.query();
    } catch (error) {
      console.error("Ошибка при получении статистики:", error);
      return {
        agentStats: {},
        serviceName: "TelegramFastResponseService",
        version: "1.0.0",
      };
    }
  }

  /**
   * Очистка кэша агента
   */
  async clearCache() {
    try {
      await apiClient.fastResponse.clearCache.mutate();
    } catch (error) {
      console.error("Ошибка при очистке кэша:", error);
    }
  }
}

// Экспортируем singleton instance
export const telegramFastResponseService = new TelegramFastResponseService();
