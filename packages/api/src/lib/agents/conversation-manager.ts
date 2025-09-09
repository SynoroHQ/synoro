import type { MessageHistoryItem } from "./types";

interface ConversationHistory {
  conversationId: string;
  messages: MessageHistoryItem[];
  userId: string;
  channel: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationManager {
  getConversation(conversationId: string): ConversationHistory | null;
  updateConversation(conversationId: string, message: MessageHistoryItem): void;
  createConversation(userId: string, channel: string): string;
  getMessagesForAgent(conversationId: string, maxMessages?: number): MessageHistoryItem[];
}

/**
 * Простой менеджер разговоров для накопления истории сообщений
 * Хранит разговоры в памяти для поддержки бесед с агентами
 */
export class SimpleConversationManager implements ConversationManager {
  private conversations = new Map<string, ConversationHistory>();
  private readonly maxMessagesPerConversation = 50; // Ограничение для предотвращения переполнения

  /**
   * Получить разговор по ID
   */
  getConversation(conversationId: string): ConversationHistory | null {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Создать новый разговор
   */
  createConversation(userId: string, channel: string): string {
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const conversation: ConversationHistory = {
      conversationId,
      messages: [],
      userId,
      channel,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.conversations.set(conversationId, conversation);
    console.log(`📝 Создан новый разговор: ${conversationId} для пользователя ${userId}`);

    return conversationId;
  }

  /**
   * Добавить сообщение в разговор
   */
  updateConversation(conversationId: string, message: MessageHistoryItem): void {
    const conversation = this.conversations.get(conversationId);

    if (!conversation) {
      console.warn(`⚠️ Разговор ${conversationId} не найден`);
      return;
    }

    // Добавляем сообщение
    conversation.messages.push(message);
    conversation.updatedAt = new Date();

    // Ограничиваем количество сообщений
    if (conversation.messages.length > this.maxMessagesPerConversation) {
      conversation.messages = conversation.messages.slice(-this.maxMessagesPerConversation);
    }

    console.log(`💬 Добавлено сообщение в разговор ${conversationId}: ${message.role} - ${message.content.substring(0, 50)}...`);
  }

  /**
   * Получить сообщения для агента (с ограничением по количеству)
   */
  getMessagesForAgent(conversationId: string, maxMessages = 20): MessageHistoryItem[] {
    const conversation = this.conversations.get(conversationId);

    if (!conversation) {
      console.warn(`⚠️ Разговор ${conversationId} не найден, возвращаем пустой массив`);
      return [];
    }

    // Возвращаем последние сообщения
    const messages = conversation.messages.slice(-maxMessages);

    console.log(`📚 Получено ${messages.length} сообщений из разговора ${conversationId} для агента`);

    return messages;
  }

  /**
   * Очистить старые разговоры (старше 24 часов)
   */
  cleanupOldConversations(): void {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 часа
    let cleaned = 0;

    for (const [conversationId, conversation] of this.conversations.entries()) {
      if (conversation.updatedAt.getTime() < cutoffTime) {
        this.conversations.delete(conversationId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Очищено ${cleaned} старых разговоров`);
    }
  }

  /**
   * Получить статистику разговоров
   */
  getStats(): { totalConversations: number; totalMessages: number } {
    let totalMessages = 0;

    for (const conversation of this.conversations.values()) {
      totalMessages += conversation.messages.length;
    }

    return {
      totalConversations: this.conversations.size,
      totalMessages,
    };
  }
}

// Экспортируем singleton экземпляр
export const conversationManager = new SimpleConversationManager();

// Запускаем очистку каждые 30 минут
setInterval(() => {
  conversationManager.cleanupOldConversations();
}, 30 * 60 * 1000);
