import { beforeEach, describe, expect, it } from "vitest";

import type { FastResponseRule } from "../src/utils/fast-response-system";
import { FastResponseSystem } from "../src/utils/fast-response-system";

describe("Fast Response System", () => {
  let fastResponseSystem: FastResponseSystem;

  beforeEach(() => {
    fastResponseSystem = new FastResponseSystem();
  });

  describe("Default Rules", () => {
    it("should have default rules initialized", () => {
      const stats = fastResponseSystem.getStats();
      expect(stats.totalRules).toBeGreaterThan(0);
    });

    it("should handle greetings correctly", () => {
      const response = fastResponseSystem.analyzeMessage("Привет!");
      expect(response.shouldSendFast).toBe(true);
      expect(response.fastResponse).toContain("👋 Привет!");
      expect(response.needsFullProcessing).toBe(false);
    });

    it("should handle thanks correctly", () => {
      const response = fastResponseSystem.analyzeMessage("Спасибо!");
      expect(response.shouldSendFast).toBe(true);
      expect(response.fastResponse).toContain("🙏 Рад был помочь!");
      expect(response.needsFullProcessing).toBe(false);
    });

    it("should handle time questions correctly", () => {
      const response = fastResponseSystem.analyzeMessage("Который час?");
      expect(response.shouldSendFast).toBe(true);
      expect(response.fastResponse).toContain("🕐 Текущее время:");
      expect(response.needsFullProcessing).toBe(false);
    });

    it("should handle date questions correctly", () => {
      const response = fastResponseSystem.analyzeMessage("Какая сегодня дата?");
      expect(response.shouldSendFast).toBe(true);
      expect(response.fastResponse).toContain("📅 Сегодня:");
      expect(response.needsFullProcessing).toBe(false);
    });
  });

  describe("Custom Rules", () => {
    it("should add custom rule", () => {
      const customRule: FastResponseRule = {
        pattern: /тест/i,
        response: "🧪 Это тестовое правило!",
        confidence: 0.8,
        needsFullProcessing: false,
      };

      fastResponseSystem.addRule(customRule);
      const response = fastResponseSystem.analyzeMessage("Это тест");

      expect(response.shouldSendFast).toBe(true);
      expect(response.fastResponse).toBe("🧪 Это тестовое правило!");
    });

    it("should remove custom rule", () => {
      const customRule: FastResponseRule = {
        pattern: /удалить/i,
        response: "Удалить это правило",
        confidence: 0.8,
        needsFullProcessing: false,
      };

      fastResponseSystem.addRule(customRule);
      expect(fastResponseSystem.analyzeMessage("удалить").shouldSendFast).toBe(
        true,
      );

      fastResponseSystem.removeRule(/удалить/i);
      expect(fastResponseSystem.analyzeMessage("удалить").shouldSendFast).toBe(
        false,
      );
    });
  });

  describe("Message Analysis", () => {
    it("should return no fast response for complex messages", () => {
      const response = fastResponseSystem.analyzeMessage(
        "Как мне создать сложную систему для анализа данных с использованием машинного обучения?",
      );
      expect(response.shouldSendFast).toBe(false);
      expect(response.needsFullProcessing).toBe(true);
      expect(response.processingType).toBe("agents");
    });

    it("should handle case insensitive matching", () => {
      const response1 = fastResponseSystem.analyzeMessage("ПРИВЕТ");
      const response2 = fastResponseSystem.analyzeMessage("привет");

      expect(response1.shouldSendFast).toBe(true);
      expect(response2.shouldSendFast).toBe(true);
      expect(response1.fastResponse).toBe(response2.fastResponse);
    });

    it("should handle partial matches for string patterns", () => {
      const response = fastResponseSystem.analyzeMessage(
        "Спасибо большое за помощь!",
      );
      expect(response.shouldSendFast).toBe(true);
      expect(response.fastResponse).toContain("🙏 Рад был помочь!");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty messages", () => {
      const response = fastResponseSystem.analyzeMessage("");
      expect(response.shouldSendFast).toBe(false);
      expect(response.needsFullProcessing).toBe(true);
    });

    it("should handle whitespace only messages", () => {
      const response = fastResponseSystem.analyzeMessage("   ");
      expect(response.shouldSendFast).toBe(false);
      expect(response.needsFullProcessing).toBe(true);
    });

    it("should handle very long messages", () => {
      const longMessage = "Это очень длинное сообщение ".repeat(100);
      const response = fastResponseSystem.analyzeMessage(longMessage);
      expect(response.shouldSendFast).toBe(false);
      expect(response.needsFullProcessing).toBe(true);
    });
  });

  describe("Rule Management", () => {
    it("should get correct stats", () => {
      const stats = fastResponseSystem.getStats();
      expect(stats.totalRules).toBeGreaterThan(0);
      expect(stats.rules).toHaveLength(stats.totalRules);

      // Проверяем структуру правил
      stats.rules.forEach((rule) => {
        expect(rule).toHaveProperty("pattern");
        expect(rule).toHaveProperty("confidence");
        expect(rule).toHaveProperty("needsFullProcessing");
      });
    });
  });
});
