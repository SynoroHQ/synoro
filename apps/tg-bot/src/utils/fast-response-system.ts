/**
 * 🚀 Fast Response System - Система быстрых ответов через AI
 *
 * Использует AI для анализа сообщений и определения необходимости быстрого ответа
 * Все решения принимаются через AI, никаких локальных алгоритмов
 */

export interface FastResponse {
  shouldSendFast: boolean;
  fastResponse: string;
  needsFullProcessing: boolean;
  processingType?: "agents" | "simple" | "none";
}

export interface AIAnalysisResult {
  shouldSendFast: boolean;
  fastResponse: string;
  needsFullProcessing: boolean;
  confidence: number;
  reasoning: string;
}

export class FastResponseSystem {
  private apiClient: any;

  constructor(apiClient: any) {
    this.apiClient = apiClient;
  }

  /**
   * Анализ сообщения через AI для определения быстрого ответа
   */
  async analyzeMessage(message: string): Promise<FastResponse> {
    try {
      console.log(`🤖 AI analyzing message for fast response: "${message}"`);

      // Используем AI для анализа сообщения
      const aiResult = await this.analyzeMessageWithAI(message);

      if (aiResult.shouldSendFast) {
        console.log(`⚡ AI decided to send fast response: ${aiResult.reasoning}`);
        
        return {
          shouldSendFast: true,
          fastResponse: aiResult.fastResponse,
          needsFullProcessing: aiResult.needsFullProcessing,
          processingType: aiResult.needsFullProcessing ? "agents" : "simple",
        };
      }

      // Если AI решил не давать быстрый ответ
      console.log(`🤔 AI decided not to send fast response: ${aiResult.reasoning}`);
      
      return {
        shouldSendFast: false,
        fastResponse: "",
        needsFullProcessing: true,
        processingType: "agents",
      };

    } catch (error) {
      console.error("Error in AI analysis for fast response:", error);
      
      // В случае ошибки AI, отправляем на полную обработку
      return {
        shouldSendFast: false,
        fastResponse: "",
        needsFullProcessing: true,
        processingType: "agents",
      };
    }
  }

  /**
   * Анализ сообщения через AI
   */
  private async analyzeMessageWithAI(message: string): Promise<AIAnalysisResult> {
    try {
      // Используем API для анализа через AI
      const result = await this.apiClient.messages.analyzeMessageForFastResponse.mutate({
        text: message,
        context: "telegram_bot_fast_response"
      });

      if (result.success) {
        return {
          shouldSendFast: result.shouldSendFast,
          fastResponse: result.fastResponse || "",
          needsFullProcessing: result.needsFullProcessing,
          confidence: result.confidence || 0.8,
          reasoning: result.reasoning || "AI analysis completed"
        };
      }

      // Fallback если API недоступен
      throw new Error("AI analysis API returned unsuccessful result");

    } catch (error) {
      console.error("Error calling AI analysis API:", error);
      
      // Fallback: отправляем на полную обработку
      return {
        shouldSendFast: false,
        fastResponse: "",
        needsFullProcessing: true,
        confidence: 0.0,
        reasoning: "AI analysis failed, falling back to full processing"
      };
    }
  }

  /**
   * Получение статистики использования AI
   */
  async getStats() {
    try {
      const result = await this.apiClient.analytics.getFastResponseStats.mutate();
      
      if (result.success) {
        return {
          aiAnalysisCount: result.totalAnalyses,
          fastResponseCount: result.fastResponsesSent,
          fullProcessingCount: result.fullProcessingCount,
          averageConfidence: result.averageConfidence,
          lastUpdated: result.lastUpdated
        };
      }

      return {
        aiAnalysisCount: 0,
        fastResponseCount: 0,
        fullProcessingCount: 0,
        averageConfidence: 0,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error("Error getting AI stats:", error);
      return {
        aiAnalysisCount: 0,
        fastResponseCount: 0,
        fullProcessingCount: 0,
        averageConfidence: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }
}

// Экспортируем класс для создания экземпляра с API клиентом
