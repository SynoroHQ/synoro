import { beforeEach, describe, expect, it } from "vitest";

import { EventLogService } from "../event-log-service";

describe("EventLogService", () => {
  let eventLogService: EventLogService;

  beforeEach(() => {
    eventLogService = new EventLogService();
  });

  it("should create event log", async () => {
    const eventLogData = {
      source: "telegram",
      chatId: "test-chat-123",
      type: "text" as const,
      text: "Замена масла в авто",
      originalText: "Замена масла в авто",
      meta: {
        userId: "user-123",
        messageId: "msg-456",
      },
    };

    const eventLog = await eventLogService.createEventLog(eventLogData);

    expect(eventLog).toBeDefined();
    expect(eventLog.source).toBe("telegram");
    expect(eventLog.chatId).toBe("test-chat-123");
    expect(eventLog.type).toBe("text");
    expect(eventLog.text).toBe("Замена масла в авто");
    expect(eventLog.status).toBe("pending");
  });

  it("should update event log status", async () => {
    const eventLogData = {
      source: "telegram",
      chatId: "test-chat-123",
      type: "text" as const,
      text: "Замена масла в авто",
    };

    const eventLog = await eventLogService.createEventLog(eventLogData);
    const updatedLog = await eventLogService.updateEventLogStatus(
      eventLog.id,
      "processed",
    );

    expect(updatedLog).toBeDefined();
    expect(updatedLog?.status).toBe("processed");
  });

  it("should get event logs with filters", async () => {
    // Создаем несколько логов
    await eventLogService.createEventLog({
      source: "telegram",
      chatId: "test-chat-123",
      type: "text",
      text: "Замена масла в авто",
    });

    await eventLogService.createEventLog({
      source: "web",
      chatId: "test-chat-456",
      type: "text",
      text: "Покупка продуктов",
    });

    // Получаем логи для telegram
    const telegramLogs = await eventLogService.getEventLogs({
      source: "telegram",
    });

    expect(telegramLogs).toHaveLength(1);
    expect(telegramLogs[0]?.source).toBe("telegram");

    // Получаем все логи
    const allLogs = await eventLogService.getEventLogs();
    expect(allLogs.length).toBeGreaterThanOrEqual(2);
  });

  it("should get event log stats", async () => {
    // Создаем несколько логов с разными статусами
    const log1 = await eventLogService.createEventLog({
      source: "telegram",
      chatId: "test-chat-123",
      type: "text",
      text: "Замена масла в авто",
    });

    await eventLogService.updateEventLogStatus(log1.id, "processed");

    const log2 = await eventLogService.createEventLog({
      source: "web",
      chatId: "test-chat-456",
      type: "text",
      text: "Покупка продуктов",
    });

    await eventLogService.updateEventLogStatus(log2.id, "failed");

    const stats = await eventLogService.getEventLogStats();

    expect(stats.total).toBeGreaterThanOrEqual(2);
    expect(stats.byStatus.processed).toBeGreaterThanOrEqual(1);
    expect(stats.byStatus.failed).toBeGreaterThanOrEqual(1);
    expect(stats.bySource.telegram).toBeGreaterThanOrEqual(1);
    expect(stats.bySource.web).toBeGreaterThanOrEqual(1);
  });
});
