import { describe, expect, it } from "vitest";

import { formatTelegramText } from "../src/utils/telegram-utils";

describe("telegram-utils", () => {
  describe("formatTelegramText", () => {
    it("should format text with HTML when special chars present", () => {
      const result = formatTelegramText("Hello *world*");
      expect(result.parse_mode).toBe("HTML");
      expect(result.text).toBe("Hello <i>world</i>");
    });

    it("should format bold text correctly", () => {
      const result = formatTelegramText("Hello **world**");
      expect(result.parse_mode).toBe("HTML");
      expect(result.text).toBe("Hello <b>world</b>");
    });

    it("should format code correctly", () => {
      const result = formatTelegramText("Hello `world`");
      expect(result.parse_mode).toBe("HTML");
      expect(result.text).toBe("Hello <code>world</code>");
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

    it("should handle mixed formatting", () => {
      const result = formatTelegramText("**Bold** and *italic* with `code`");
      expect(result.parse_mode).toBe("HTML");
      expect(result.text).toBe(
        "<b>Bold</b> and <i>italic</i> with <code>code</code>",
      );
    });

    it("should escape ampersand in plain text", () => {
      const result = formatTelegramText("Hello & world");
      expect(result.parse_mode).toBe("HTML");
      expect(result.text).toBe("Hello &amp; world");
    });

    it("should not escape ampersand in HTML tags", () => {
      const result = formatTelegramText("**Hello & world**");
      expect(result.parse_mode).toBe("HTML");
      expect(result.text).toBe("<b>Hello &amp; world</b>");
    });
  });
});
