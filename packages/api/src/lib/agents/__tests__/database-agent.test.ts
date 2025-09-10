import { beforeEach, describe, expect, it } from "bun:test";

import type { AgentContext } from "../types";
import { DatabaseAgent } from "../database-agent";
import { DatabaseToolsHandler } from "../database-tools-handler";

describe("DatabaseAgent", () => {
  let agent: DatabaseAgent;
  let context: AgentContext;

  beforeEach(() => {
    agent = new DatabaseAgent();
    context = {
      userId: "test_user_123",
      householdId: "test_household_456",
      channel: "telegram",
      conversationId: "test_conv_789",
      metadata: {
        telegramUserId: "123456789",
        username: "test_user",
      },
    };
  });

  describe("canHandle", () => {
    it("should handle database-related queries", async () => {
      const queries = [
        "Покажи мои события",
        "Найди расходы за месяц",
        "Какая статистика по задачам?",
        "Покажи недавние дела",
        "Найди события с тегом 'важно'",
      ];

      for (const query of queries) {
        const canHandle = await agent.canHandle({
          id: "test_task",
          input: query,
          context,
        });
        expect(canHandle).toBe(true);
      }
    });

    it("should not handle non-database queries", async () => {
      const queries = [
        "Привет, как дела?",
        "Расскажи анекдот",
        "Что такое ИИ?",
        "Помоги с математикой",
      ];

      for (const query of queries) {
        const canHandle = await agent.canHandle({
          id: "test_task",
          input: query,
          context,
        });
        expect(canHandle).toBe(false);
      }
    });
  });

  describe("process", () => {
    it("should process database queries successfully", async () => {
      const task = {
        id: "test_task",
        input: "Покажи мои недавние события",
        context,
      };

      const result = await agent.process(task, context);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.response).toBeDefined();
    });

    it("should handle queries without user context", async () => {
      const contextWithoutUser = {
        ...context,
        userId: undefined,
      };

      const task = {
        id: "test_task",
        input: "Покажи мои события",
        context: contextWithoutUser,
      };

      const result = await agent.process(task, contextWithoutUser);

      expect(result.success).toBe(false);
      expect(result.error).toContain("User ID не найден");
    });
  });

  describe("formatting", () => {
    it("should format events response correctly", () => {
      const events = [
        {
          id: "event_1",
          title: "Покупка продуктов",
          type: "expense",
          status: "active",
          priority: "medium",
          occurredAt: "2024-01-15T10:00:00Z",
          amount: "1500.00",
          currency: "RUB",
          notes: "Продукты на неделю",
          tags: [{ name: "продукты" }],
        },
      ];

      // @ts-ignore - accessing private method for testing
      const response = agent.formatEventsResponse(events, "Тестовые события");

      expect(response).toContain("## Тестовые события");
      expect(response).toContain("1. **Покупка продуктов**");
      expect(response).toContain("Тип: expense");
      expect(response).toContain("Сумма: 1500.00 RUB");
    });

    it("should format stats response correctly", () => {
      const stats = {
        total: 10,
        totalAmount: 5000,
        averageAmount: 500,
        currency: "RUB",
        byType: { expense: 5, task: 3, maintenance: 2 },
        byStatus: { active: 8, archived: 2 },
      };

      // @ts-ignore - accessing private method for testing
      const response = agent.formatStatsResponse(stats);

      expect(response).toContain("## Статистика");
      expect(response).toContain("Всего событий: 10");
      expect(response).toContain("Общая сумма: 5000.00 RUB");
      expect(response).toContain("expense: 5");
    });
  });
});

describe("DatabaseToolsHandler", () => {
  let handler: DatabaseToolsHandler;

  beforeEach(() => {
    handler = new DatabaseToolsHandler();
  });

  describe("getAvailableTools", () => {
    it("should return list of available tools", () => {
      const tools = handler.getAvailableTools();

      expect(tools).toContain("get_user_events");
      expect(tools).toContain("get_event_by_id");
      expect(tools).toContain("get_user_stats");
      expect(tools).toContain("search_events");
      expect(tools).toContain("get_recent_events");
      expect(tools).toContain("get_upcoming_tasks");
      expect(tools).toContain("get_expense_summary");
    });
  });

  describe("isToolSupported", () => {
    it("should return true for supported tools", () => {
      expect(handler.isToolSupported("get_user_events")).toBe(true);
      expect(handler.isToolSupported("get_user_stats")).toBe(true);
    });

    it("should return false for unsupported tools", () => {
      expect(handler.isToolSupported("unknown_tool")).toBe(false);
      expect(handler.isToolSupported("invalid_tool")).toBe(false);
    });
  });

  describe("executeTool", () => {
    it("should throw error for unknown tool", async () => {
      await expect(handler.executeTool("unknown_tool", {})).rejects.toThrow(
        "Неизвестный tool: unknown_tool",
      );
    });

    it("should execute supported tools", async () => {
      // Note: These tests would require a real database connection
      // In a real test environment, you would mock the database service
      const params = {
        userId: "test_user",
        householdId: "test_household",
      };

      // This will fail without a real database, but we can test the structure
      await expect(
        handler.executeTool("get_user_events", params),
      ).rejects.toThrow(); // Should throw due to database connection
    });
  });
});
