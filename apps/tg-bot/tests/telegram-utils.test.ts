import { describe, expect, it } from "vitest";

import {
  containsMarkdownV2Chars,
  escapeTelegramMarkdownV2,
  formatTelegramText,
} from "../src/utils/telegram-utils";

describe("telegram-utils", () => {
  describe("escapeTelegramMarkdownV2", () => {
    it("should escape special MarkdownV2 characters", () => {
      const input = "Hello *world* with _emphasis_ and [link](url)";
      const expected =
        "Hello \\*world\\* with \\_emphasis\\_ and \\[link\\]\\(url\\)";
      expect(escapeTelegramMarkdownV2(input)).toBe(expected);
    });

    it("should handle empty string", () => {
      expect(escapeTelegramMarkdownV2("")).toBe("");
    });

    it("should handle null/undefined", () => {
      expect(escapeTelegramMarkdownV2(null as any)).toBe(null);
      expect(escapeTelegramMarkdownV2(undefined as any)).toBe(undefined);
    });

    it("should escape all special characters", () => {
      const input = "_*[]()~`>#+-=|{}.!";
      const expected = "\\_\\*\\[\\]\\(\\)\\~\\`\\>\\#\\+\\-\\=\\|\\{\\}\\.\\!";
      expect(escapeTelegramMarkdownV2(input)).toBe(expected);
    });

    it("should not escape regular text", () => {
      const input = "Hello world This is a normal message";
      expect(escapeTelegramMarkdownV2(input)).toBe(input);
    });
  });

  describe("containsMarkdownV2Chars", () => {
    it("should detect MarkdownV2 characters", () => {
      expect(containsMarkdownV2Chars("Hello *world*")).toBe(true);
      expect(containsMarkdownV2Chars("Hello world")).toBe(false);
      expect(containsMarkdownV2Chars("Text with _emphasis_")).toBe(true);
    });

    it("should handle empty string", () => {
      expect(containsMarkdownV2Chars("")).toBe(false);
    });
  });

  describe("formatTelegramText", () => {
    it("should format text with HTML when special chars present", () => {
      const result = formatTelegramText("Hello *world*");
      expect(result.parse_mode).toBe("HTML");
      expect(result.text).toBe("Hello <b>world</b>");
    });

    it("should return HTML formatted text when no special chars", () => {
      const result = formatTelegramText("Hello world");
      expect(result.parse_mode).toBe("HTML");
      expect(result.text).toBe("Hello world");
    });

    it("should respect preferHTML flag", () => {
      const result = formatTelegramText("Hello *world*", false);
      expect(result.parse_mode).toBeUndefined();
      expect(result.text).toBe("Hello *world*");
    });
  });
});
