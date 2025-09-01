import { beforeEach, describe, expect, it, vi } from "vitest";

import { FastResponseSystem } from "../src/utils/fast-response-system";

// Мокаем API клиент
const mockApiClient = {
  messages: {
    analyzeMessageForFastResponse: {
      mutate: vi.fn(),
    },
  },
  analytics: {
    getFastResponseStats: {
      mutate: vi.fn(),
    },
  },
};

describe("Fast Response System with AI", () => {
  let fastResponseSystem: FastResponseSystem;

  beforeEach(() => {
    fastResponseSystem = new FastResponseSystem(mockApiClient);
    vi.clearAllMocks();
  });

  describe("AI Message Analysis", () => {
    it("should analyze message through AI and return fast response", async () => {
      // Мокаем успешный ответ от AI
      mockApiClient.messages.analyzeMessageForFastResponse.mutate.mockResolvedValue({
        success: true,
        shouldSendFast: true,
        fastResponse: "👋 Привет! Чем могу помочь?",
        needsFullProcessing: false,
        confidence: 0.9,
        reasoning: "Simple greeting detected",
      });

      const response = await fastResponseSystem.analyzeMessage("Привет!");

      expect(response.shouldSendFast).toBe(true);
      expect(response.fastResponse).toBe("👋 Привет! Чем могу помочь?");
      expect(response.needsFullProcessing).toBe(false);
      expect(response.processingType).toBe("simple");

      expect(mockApiClient.messages.analyzeMessageForFastResponse.mutate).toHaveBeenCalledWith({
        text: "Привет!",
        context: "telegram_bot_fast_response",
      });
    });

    it("should analyze message through AI and decide not to send fast response", async () => {
      // Мокаем ответ от AI о том, что быстрый ответ не нужен
      mockApiClient.messages.analyzeMessageForFastResponse.mutate.mockResolvedValue({
        success: true,
        shouldSendFast: false,
        fastResponse: "",
        needsFullProcessing: true,
        confidence: 0.8,
        reasoning: "Complex question requires full processing",
      });

      const response = await fastResponseSystem.analyzeMessage(
        "Как мне создать сложную систему для анализа данных?"
      );

      expect(response.shouldSendFast).toBe(false);
      expect(response.fastResponse).toBe("");
      expect(response.needsFullProcessing).toBe(true);
      expect(response.processingType).toBe("agents");
    });

    it("should handle AI analysis failure gracefully", async () => {
      // Мокаем ошибку API
      mockApiClient.messages.analyzeMessageForFastResponse.mutate.mockRejectedValue(
        new Error("API Error")
      );

      const response = await fastResponseSystem.analyzeMessage("Привет!");

      expect(response.shouldSendFast).toBe(false);
      expect(response.fastResponse).toBe("");
      expect(response.needsFullProcessing).toBe(true);
      expect(response.processingType).toBe("agents");
    });

    it("should handle unsuccessful AI response", async () => {
      // Мокаем неуспешный ответ от API
      mockApiClient.messages.analyzeMessageForFastResponse.mutate.mockResolvedValue({
        success: false,
        error: "AI service unavailable",
      });

      const response = await fastResponseSystem.analyzeMessage("Привет!");

      expect(response.shouldSendFast).toBe(false);
      expect(response.fastResponse).toBe("");
      expect(response.needsFullProcessing).toBe(true);
      expect(response.processingType).toBe("agents");
    });
  });

  describe("AI Statistics", () => {
    it("should get AI usage statistics successfully", async () => {
      const mockStats = {
        success: true,
        totalAnalyses: 150,
        fastResponsesSent: 45,
        fullProcessingCount: 105,
        averageConfidence: 0.87,
        lastUpdated: "2024-01-15T10:30:00Z",
      };

      mockApiClient.analytics.getFastResponseStats.mutate.mockResolvedValue(mockStats);

      const stats = await fastResponseSystem.getStats();

      expect(stats.aiAnalysisCount).toBe(150);
      expect(stats.fastResponseCount).toBe(45);
      expect(stats.fullProcessingCount).toBe(105);
      expect(stats.averageConfidence).toBe(0.87);
      expect(stats.lastUpdated).toBe("2024-01-15T10:30:00Z");

      expect(mockApiClient.analytics.getFastResponseStats.mutate).toHaveBeenCalled();
    });

    it("should handle statistics API failure gracefully", async () => {
      mockApiClient.analytics.getFastResponseStats.mutate.mockRejectedValue(
        new Error("Statistics API Error")
      );

      const stats = await fastResponseSystem.getStats();

      expect(stats.aiAnalysisCount).toBe(0);
      expect(stats.fastResponseCount).toBe(0);
      expect(stats.fullProcessingCount).toBe(0);
      expect(stats.averageConfidence).toBe(0);
      expect(stats.lastUpdated).toBeDefined();
    });

    it("should handle unsuccessful statistics response", async () => {
      mockApiClient.analytics.getFastResponseStats.mutate.mockResolvedValue({
        success: false,
        error: "Statistics service unavailable",
      });

      const stats = await fastResponseSystem.getStats();

      expect(stats.aiAnalysisCount).toBe(0);
      expect(stats.fastResponseCount).toBe(0);
      expect(stats.fullProcessingCount).toBe(0);
      expect(stats.averageConfidence).toBe(0);
      expect(stats.lastUpdated).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty messages", async () => {
      mockApiClient.messages.analyzeMessageForFastResponse.mutate.mockResolvedValue({
        success: true,
        shouldSendFast: false,
        fastResponse: "",
        needsFullProcessing: true,
        confidence: 0.0,
        reasoning: "Empty message detected",
      });

      const response = await fastResponseSystem.analyzeMessage("");

      expect(response.shouldSendFast).toBe(false);
      expect(response.needsFullProcessing).toBe(true);
    });

    it("should handle very long messages", async () => {
      const longMessage = "Это очень длинное сообщение ".repeat(100);
      
      mockApiClient.messages.analyzeMessageForFastResponse.mutate.mockResolvedValue({
        success: true,
        shouldSendFast: false,
        fastResponse: "",
        needsFullProcessing: true,
        confidence: 0.3,
        reasoning: "Long message requires full analysis",
      });

      const response = await fastResponseSystem.analyzeMessage(longMessage);

      expect(response.shouldSendFast).toBe(false);
      expect(response.needsFullProcessing).toBe(true);
    });

    it("should handle special characters and emojis", async () => {
      const specialMessage = "Привет! 👋 Как дела? 😊";
      
      mockApiClient.messages.analyzeMessageForFastResponse.mutate.mockResolvedValue({
        success: true,
        shouldSendFast: true,
        fastResponse: "😊 Привет! У меня все отлично!",
        needsFullProcessing: false,
        confidence: 0.95,
        reasoning: "Friendly greeting with emojis",
      });

      const response = await fastResponseSystem.analyzeMessage(specialMessage);

      expect(response.shouldSendFast).toBe(true);
      expect(response.fastResponse).toBe("😊 Привет! У меня все отлично!");
      expect(response.needsFullProcessing).toBe(false);
    });
  });

  describe("AI Confidence Levels", () => {
    it("should handle high confidence AI responses", async () => {
      mockApiClient.messages.analyzeMessageForFastResponse.mutate.mockResolvedValue({
        success: true,
        shouldSendFast: true,
        fastResponse: "🙏 Рад был помочь!",
        needsFullProcessing: false,
        confidence: 0.98,
        reasoning: "High confidence thanks response",
      });

      const response = await fastResponseSystem.analyzeMessage("Спасибо!");

      expect(response.shouldSendFast).toBe(true);
      expect(response.fastResponse).toBe("🙏 Рад был помочь!");
      expect(response.needsFullProcessing).toBe(false);
    });

    it("should handle low confidence AI responses", async () => {
      mockApiClient.messages.analyzeMessageForFastResponse.mutate.mockResolvedValue({
        success: true,
        shouldSendFast: false,
        fastResponse: "",
        needsFullProcessing: true,
        confidence: 0.45,
        reasoning: "Low confidence, requires full processing",
      });

      const response = await fastResponseSystem.analyzeMessage("Что-то непонятное");

      expect(response.shouldSendFast).toBe(false);
      expect(response.needsFullProcessing).toBe(true);
    });
  });
});
