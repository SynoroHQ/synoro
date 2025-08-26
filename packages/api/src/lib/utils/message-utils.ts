import { MESSAGE_PROCESSING_CONFIG } from "../constants/message-processing";

/**
 * Определяет максимальное количество токенов для контекста на основе текста сообщения
 */
export function determineMaxTokens(text: string): number {
  const isQuestionOrShort =
    text.includes("?") ||
    text.length < MESSAGE_PROCESSING_CONFIG.TOKENS.SHORT_MESSAGE_THRESHOLD;
  return isQuestionOrShort
    ? MESSAGE_PROCESSING_CONFIG.TOKENS.QUESTION_OR_CHAT
    : MESSAGE_PROCESSING_CONFIG.TOKENS.EVENT;
}

/**
 * Создает общие метаданные для обработки сообщения
 */
export function createCommonMetadata(params: {
  channel: string;
  userId: string | null; // null для анонимных пользователей
  conversationId: string;
  chatId?: string;
  messageId?: string;
  metadata?: Record<string, unknown>;
}) {
  const { channel, userId, conversationId, chatId, messageId, metadata } =
    params;

  return {
    channel,
    userId: userId ?? "anonymous", // Используем "anonymous" для null userId
    conversationId,
    ...(chatId && { chatId }),
    ...(messageId && { messageId }),
    ...metadata,
  };
}

/**
 * Форматирует время выполнения операции
 */
export function formatExecutionTime(startTime: number): string {
  const executionTime = Date.now() - startTime;
  return `${executionTime}ms`;
}

/**
 * Безопасно обрезает текст для логирования
 */
export function safeTruncateForLogging(
  text: string,
  maxLength: number = MESSAGE_PROCESSING_CONFIG.LOGGING.MAX_TEXT_LENGTH,
): string {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
