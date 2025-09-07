import { describe, expect, it, vi } from "vitest";

import type { MessageHistoryItem } from "../../agents/types";
import { AgentMessageHistoryService } from "../agent-message-history-service";

// Мокаем TRPCContext
const mockCtx = {
  db: {
    query: {
      conversations: {
        findFirst: vi.fn(),
      },
      messages: {
        findMany: vi.fn(),
      },
    },
  },
} as any;

describe("AgentMessageHistoryService", () => {
  describe("formatHistoryForPrompt", () => {
    it("should format empty history correctly", () => {
      const result = AgentMessageHistoryService.formatHistoryForPrompt([]);
      expect(result).toBe("");
    });

    it("should format single message correctly", () => {
      const messages: MessageHistoryItem[] = [
        {
          id: "1",
          role: "user",
          content: "Привет!",
          timestamp: new Date("2024-01-01T10:00:00Z"),
        },
      ];

      const result =
        AgentMessageHistoryService.formatHistoryForPrompt(messages);
      expect(result).toContain("Пользователь: Привет!");
    });

    it("should format multiple messages correctly", () => {
      const messages: MessageHistoryItem[] = [
        {
          id: "1",
          role: "user",
          content: "Привет!",
          timestamp: new Date("2024-01-01T10:00:00Z"),
        },
        {
          id: "2",
          role: "assistant",
          content: "Привет! Как дела?",
          timestamp: new Date("2024-01-01T10:01:00Z"),
        },
        {
          id: "3",
          role: "user",
          content: "Хорошо, спасибо!",
          timestamp: new Date("2024-01-01T10:02:00Z"),
        },
      ];

      const result =
        AgentMessageHistoryService.formatHistoryForPrompt(messages);
      expect(result).toContain("Пользователь: Привет!");
      expect(result).toContain("Ассистент: Привет! Как дела?");
      expect(result).toContain("Пользователь: Хорошо, спасибо!");
    });

    it("should truncate long history", () => {
      const messages: MessageHistoryItem[] = Array.from(
        { length: 10 },
        (_, i) => ({
          id: `${i}`,
          role: "user" as const,
          content: `Сообщение ${i} с очень длинным текстом `.repeat(50),
          timestamp: new Date(`2024-01-01T10:0${i}:00Z`),
        }),
      );

      const result = AgentMessageHistoryService.formatHistoryForPrompt(
        messages,
        100,
      );
      expect(result.length).toBeLessThanOrEqual(103); // 100 + "..."
      expect(result.endsWith("...")).toBe(true);
    });
  });

  describe("getHistorySummary", () => {
    it("should return empty message for no history", () => {
      const result = AgentMessageHistoryService.getHistorySummary([]);
      expect(result).toBe("История диалога пуста");
    });

    it("should summarize recent messages", () => {
      const messages: MessageHistoryItem[] = [
        {
          id: "1",
          role: "user",
          content: "Первый вопрос",
          timestamp: new Date("2024-01-01T10:00:00Z"),
        },
        {
          id: "2",
          role: "assistant",
          content: "Ответ на первый вопрос",
          timestamp: new Date("2024-01-01T10:01:00Z"),
        },
        {
          id: "3",
          role: "user",
          content: "Второй вопрос",
          timestamp: new Date("2024-01-01T10:02:00Z"),
        },
      ];

      const result = AgentMessageHistoryService.getHistorySummary(messages, 2);
      expect(result).toContain("Последние 2 сообщения:");
      expect(result).toContain("1. Ассистент: Ответ на первый вопрос");
      expect(result).toContain("2. Пользователь: Второй вопрос");
    });

    it("should truncate long messages in summary", () => {
      const messages: MessageHistoryItem[] = [
        {
          id: "1",
          role: "user",
          content: "Очень длинное сообщение ".repeat(20),
          timestamp: new Date("2024-01-01T10:00:00Z"),
        },
      ];

      const result = AgentMessageHistoryService.getHistorySummary(messages);
      expect(result).toContain("...");
      expect(result.length).toBeLessThan(200);
    });
  });

  describe("trimHistoryByTokens", () => {
    it("should return all messages if under token limit", () => {
      const messages: MessageHistoryItem[] = [
        {
          id: "1",
          role: "user",
          content: "Короткое сообщение",
          timestamp: new Date("2024-01-01T10:00:00Z"),
        },
      ];

      // Используем приватный метод через рефлексию для тестирования
      const service = AgentMessageHistoryService as any;
      const result = service.trimHistoryByTokens(messages, 1000);
      expect(result).toEqual(messages);
    });

    it("should preserve last 2 messages", () => {
      const messages: MessageHistoryItem[] = Array.from(
        { length: 5 },
        (_, i) => ({
          id: `${i}`,
          role: "user" as const,
          content: `Сообщение ${i}`,
          timestamp: new Date(`2024-01-01T10:0${i}:00Z`),
        }),
      );

      const service = AgentMessageHistoryService as any;
      const result = service.trimHistoryByTokens(messages, 50); // Очень маленький лимит

      expect(result.length).toBe(2);
      expect(result[0]?.id).toBe("3");
      expect(result[1]?.id).toBe("4");
    });
  });
});
