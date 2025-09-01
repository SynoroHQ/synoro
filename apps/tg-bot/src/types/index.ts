/**
 * Общие типы для Telegram бота
 */

export interface MessageContext {
  channel: "telegram";
  userId: string;
  messageId?: string;
  metadata?: Record<string, unknown>;
}

export interface ProcessMessageResult {
  success: boolean;
  response: string;
  messageType?: {
    type: string;
    subtype: string | null;
    confidence: number;
    need_logging: boolean;
  };
  relevance?: {
    relevant: boolean;
    score?: number;
    category?: string;
  };
  parsed?: {
    action: string;
    object: string;
    confidence?: number;
  } | null;
}

export interface TranscribeResult {
  success: boolean;
  text: string;
  filename: string;
}

export interface TelegramFile {
  buffer: Buffer;
  filename: string;
  contentType: string;
}
