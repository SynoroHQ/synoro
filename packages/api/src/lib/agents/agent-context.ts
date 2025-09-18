/**
 * Типы для контекста агентов
 */

export interface AgentContext {
  userId?: string;
  messageId?: string;
  channel?: string;
  timezone?: string;
  householdId?: string;
  metadata?: {
    // Базовые метаданные
    channel?: string;
    userId?: string;
    conversationId?: string;
    messageId?: string;
    contextMessageCount?: number;
    agentMode?: boolean;

    // Дополнительные метаданные
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
