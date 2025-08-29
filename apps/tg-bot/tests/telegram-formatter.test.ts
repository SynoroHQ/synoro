import { describe, expect, it } from "vitest";

import {
  formatForTelegram,
  TelegramFormatter,
} from "../src/utils/telegram-formatter";

describe("TelegramFormatter", () => {
  const formatter = new TelegramFormatter();

  describe("formatAgentResponse", () => {
    it("should handle empty response", () => {
      const result = formatter.formatAgentResponse("");
      expect(result.text).toBe("❌ Пустой ответ");
    });

    it("should add emojis for error messages", () => {
      const result = formatter.formatAgentResponse(
        "Произошла ошибка при обработке",
      );
      expect(result.text).toContain("🔴");
    });

    it("should add emojis for success messages", () => {
      const result = formatter.formatAgentResponse(
        "Операция выполнена успешно",
      );
      expect(result.text).toContain("🟢");
    });

    it("should add emojis for warning messages", () => {
      const result = formatter.formatAgentResponse(
        "Внимание: важная информация",
      );
      expect(result.text).toContain("🟡");
    });

    it("should add emojis for question messages", () => {
      const result = formatter.formatAgentResponse("У вас есть вопрос?");
      expect(result.text).toContain("❓");
    });

    it("should add emojis for answer messages", () => {
      const result = formatter.formatAgentResponse("Вот ответ на ваш вопрос");
      expect(result.text).toContain("💡");
    });

    it("should add emojis for analysis messages", () => {
      const result = formatter.formatAgentResponse("Анализ данных показывает");
      expect(result.text).toContain("📊");
    });

    it("should add emojis for financial messages", () => {
      const result = formatter.formatAgentResponse("Ваши финансы в порядке");
      expect(result.text).toContain("💰");
    });

    it("should not add emojis for regular messages", () => {
      const result = formatter.formatAgentResponse("Это обычное сообщение");
      expect(result.text).toBe("<b>Это обычное сообщение</b>\n");
    });
  });

  describe("formatTextStructure", () => {
    it("should format simple headers", () => {
      const result = formatter.formatAgentResponse("Заголовок:\nСодержание");
      expect(result.text).toContain("<b>Заголовок:</b>");
    });

    it("should format lists", () => {
      const result = formatter.formatAgentResponse(
        "- Первый пункт\n- Второй пункт",
      );
      expect(result.text).toContain("<b>- Первый пункт</b>");
      expect(result.text).toContain("<b>- Второй пункт</b>");
    });

    it("should format numbered lists", () => {
      const result = formatter.formatAgentResponse(
        "1. Первый пункт\n2. Второй пункт",
      );
      expect(result.text).toContain("1. Первый пункт");
      expect(result.text).toContain("2. Второй пункт");
    });
  });

  describe("parse mode detection", () => {
    it("should use HTML when text contains formatting", () => {
      const result = formatter.formatAgentResponse(
        "**Заголовок**\nОбычный текст",
      );
      expect(result.parse_mode).toBe("HTML");
    });

    it("should not use parse mode for plain text when HTML is disabled", () => {
      const result = formatter.formatAgentResponse(
        "Обычный текст без разметки",
        { useHTML: false },
      );
      expect(result.parse_mode).toBeUndefined();
    });
  });

  describe("line wrapping", () => {
    it("should wrap long lines", () => {
      const longText =
        "Это очень длинная строка которая должна быть разбита на несколько строк для лучшей читаемости в Telegram";
      const result = formatter.formatAgentResponse(longText, {
        maxLineLength: 30,
      });

      // Проверяем, что строки разбиты
      const lines = result.text.split("\n");
      lines.forEach((line) => {
        expect(line.length).toBeLessThanOrEqual(30);
      });
    });
  });

  describe("utility functions", () => {
    it("should format using formatForTelegram", () => {
      const result = formatForTelegram("Тестовое сообщение");
      expect(result.text).toBe("<b>Тестовое сообщение</b>\n");
    });

    it("should respect options", () => {
      const result = formatForTelegram("Тестовое сообщение", {
        useEmojis: false,
      });
      expect(result.text).toBe("<b>Тестовое сообщение</b>\n");
    });

    it("should respect HTML options", () => {
      const result = formatForTelegram("**Заголовок**", { useHTML: false });
      expect(result.parse_mode).toBeUndefined();
    });
  });

  describe("agent-specific formatting", () => {
    it("should format QA responses", () => {
      const result = formatter.formatAgentSpecificResponse(
        "Ответ на вопрос",
        "qa",
      );
      expect(result.text).toBe("<b>💡 Ответ на вопрос</b>\n");
    });

    it("should format financial responses", () => {
      const result = formatter.formatAgentSpecificResponse(
        "Финансовая информация",
        "financial",
      );
      expect(result.text).toBe("<b>💰 Финансовая информация</b>\n");
    });

    it("should format analytics responses", () => {
      const result = formatter.formatAgentSpecificResponse(
        "Анализ данных",
        "analytics",
      );
      expect(result.text).toBe("<b>📊 Анализ данных</b>\n");
    });
  });
});
