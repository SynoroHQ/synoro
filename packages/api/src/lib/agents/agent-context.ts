/**
 * Типы для контекста агентов с включением контекста разговора
 */

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface ConversationContextInfo {
  conversationId: string;
  totalMessages: number;
  contextMessages: number;
  hasMoreMessages: boolean;
}

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
    
    // Контекст разговора для трейсинга
    conversationContext?: ConversationContextInfo;
    conversationHistory?: ConversationMessage[];
    
    // Дополнительные метаданные
    [key: string]: unknown;
  };
}
