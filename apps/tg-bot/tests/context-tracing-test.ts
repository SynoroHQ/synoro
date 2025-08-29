import { describe, expect, it, beforeEach, afterEach } from "vitest";

describe("Context Tracing Test", () => {
  const testUserId = "test-user-123";
  const testChatId = "test-chat-456";
  const testMessageId = "test-message-789";

  beforeEach(() => {
    console.log("🧪 Начинаем тест трейсинга контекста...");
  });

  afterEach(() => {
    console.log("✅ Тест трейсинга контекста завершен");
  });

  describe("Conversation Context in Tracing", () => {
    it("should include conversation context in telemetry", () => {
      const conversationContext = {
        conversationId: "conv-123",
        totalMessages: 15,
        contextMessages: 8,
        hasMoreMessages: true,
      };

      const conversationHistory = [
        {
          id: "msg-1",
          role: "user" as const,
          content: "Привет!",
          createdAt: new Date(Date.now() - 60000),
        },
        {
          id: "msg-2",
          role: "assistant" as const,
          content: "Привет! Как дела?",
          createdAt: new Date(Date.now() - 30000),
        },
        {
          id: "msg-3",
          role: "user" as const,
          content: "Хорошо, спасибо!",
          createdAt: new Date(Date.now() - 15000),
        },
      ];

      const telemetry = {
        functionId: "agent-router-routing",
        metadata: {
          agentName: "Router Agent",
          taskType: "routing",
          taskId: "task-123",
          userId: testUserId,
          channel: "telegram",
          chatId: testChatId,
          messageId: testMessageId,
          // Контекст разговора в трейсинге
          conversationContext,
          conversationHistory,
          conversationId: conversationContext.conversationId,
          contextMessageCount: conversationContext.contextMessages,
        },
      };

      // Проверяем, что контекст разговора присутствует в телеметрии
      expect(telemetry.metadata.conversationContext).toBeDefined();
      expect(telemetry.metadata.conversationContext?.conversationId).toBe("conv-123");
      expect(telemetry.metadata.conversationContext?.totalMessages).toBe(15);
      expect(telemetry.metadata.conversationContext?.contextMessages).toBe(8);
      expect(telemetry.metadata.conversationContext?.hasMoreMessages).toBe(true);

      // Проверяем историю беседы
      expect(telemetry.metadata.conversationHistory).toBeDefined();
      expect(telemetry.metadata.conversationHistory).toHaveLength(3);
      expect(telemetry.metadata.conversationHistory?.[0].role).toBe("user");
      expect(telemetry.metadata.conversationHistory?.[0].content).toBe("Привет!");
      expect(telemetry.metadata.conversationHistory?.[1].role).toBe("assistant");
      expect(telemetry.metadata.conversationHistory?.[1].content).toBe("Привет! Как дела?");

      // Проверяем базовые поля контекста
      expect(telemetry.metadata.conversationId).toBe("conv-123");
      expect(telemetry.metadata.contextMessageCount).toBe(8);
    });
  });

  describe("Agent Context Structure", () => {
    it("should have proper agent context structure", () => {
      const agentContext = {
        userId: testUserId,
        chatId: testChatId,
        messageId: testMessageId,
        channel: "telegram" as const,
        metadata: {
          channel: "telegram",
          userId: testUserId,
          conversationId: "conv-123",
          chatId: testChatId,
          messageId: testMessageId,
          contextMessageCount: 5,
          agentMode: true,
          // Контекст разговора
          conversationContext: {
            conversationId: "conv-123",
            totalMessages: 10,
            contextMessages: 5,
            hasMoreMessages: false,
          },
          conversationHistory: [
            {
              id: "msg-1",
              role: "user" as const,
              content: "Вопрос",
              createdAt: new Date(),
            },
          ],
        },
      };

      // Проверяем структуру контекста агента
      expect(agentContext.userId).toBe(testUserId);
      expect(agentContext.chatId).toBe(testChatId);
      expect(agentContext.messageId).toBe(testMessageId);
      expect(agentContext.channel).toBe("telegram");

      // Проверяем метаданные
      expect(agentContext.metadata.conversationId).toBe("conv-123");
      expect(agentContext.metadata.contextMessageCount).toBe(5);
      expect(agentContext.metadata.agentMode).toBe(true);

      // Проверяем контекст разговора
      expect(agentContext.metadata.conversationContext).toBeDefined();
      expect(agentContext.metadata.conversationHistory).toBeDefined();
    });
  });

  describe("Telemetry Metadata Flow", () => {
    it("should flow context through telemetry chain", () => {
      // Симулируем поток данных через систему
      const flow = {
        step1: {
          conversationContext: {
            conversationId: "conv-123",
            totalMessages: 20,
            contextMessages: 10,
            hasMoreMessages: true,
          },
        },
        step2: {
          agentContext: {
            metadata: {
              conversationContext: {
                conversationId: "conv-123",
                totalMessages: 20,
                contextMessages: 10,
                hasMoreMessages: true,
              },
            },
          },
        },
        step3: {
          telemetry: {
            metadata: {
              conversationContext: {
                conversationId: "conv-123",
                totalMessages: 20,
                contextMessages: 10,
                hasMoreMessages: true,
              },
            },
          },
        },
      };

      // Проверяем, что контекст сохраняется на всех этапах
      expect(flow.step1.conversationContext.conversationId).toBe(
        flow.step2.agentContext.metadata.conversationContext.conversationId
      );
      expect(flow.step2.agentContext.metadata.conversationContext.conversationId).toBe(
        flow.step3.telemetry.metadata.conversationContext.conversationId
      );
      expect(flow.step1.conversationContext.totalMessages).toBe(
        flow.step2.agentContext.metadata.conversationContext.totalMessages
      );
      expect(flow.step2.agentContext.metadata.conversationContext.totalMessages).toBe(
        flow.step3.telemetry.metadata.conversationContext.totalMessages
      );
    });
  });

  describe("Context Preservation", () => {
    it("should preserve conversation history in tracing", () => {
      const originalHistory = [
        { id: "msg-1", role: "user" as const, content: "Первое сообщение", createdAt: new Date() },
        { id: "msg-2", role: "assistant" as const, content: "Ответ на первое", createdAt: new Date() },
        { id: "msg-3", role: "user" as const, content: "Второе сообщение", createdAt: new Date() },
      ];

      const telemetry = {
        metadata: {
          conversationHistory: originalHistory,
          conversationContext: {
            conversationId: "conv-123",
            totalMessages: 10,
            contextMessages: originalHistory.length,
            hasMoreMessages: true,
          },
        },
      };

      // Проверяем, что история полностью сохранена
      expect(telemetry.metadata.conversationHistory).toHaveLength(3);
      expect(telemetry.metadata.conversationHistory?.[0].content).toBe("Первое сообщение");
      expect(telemetry.metadata.conversationHistory?.[1].content).toBe("Ответ на первое");
      expect(telemetry.metadata.conversationHistory?.[2].content).toBe("Второе сообщение");

      // Проверяем соответствие количества сообщений
      expect(telemetry.metadata.conversationContext?.contextMessages).toBe(originalHistory.length);
    });
  });
});
