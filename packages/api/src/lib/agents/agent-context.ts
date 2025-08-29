/**
 * Типы для контекста агентов
 */

export interface AgentContext {
  userId?: string;
  chatId?: string;
  messageId?: string;
  channel: string;
  metadata?: {
    // Базовые метаданные
    channel: string;
    userId: string;
    conversationId: string;
    chatId?: string;
    messageId?: string;
    contextMessageCount?: number;
    agentMode?: boolean;
    
    // Дополнительные метаданные
    [key: string]: unknown;
  };
}
