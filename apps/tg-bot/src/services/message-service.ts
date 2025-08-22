import { randomUUID } from "node:crypto";

import { apiClient } from "../api/client";

/**
 * Контекст для обработки сообщения
 */
export interface MessageContext {
  userId: string;
  chatId: string;
  messageId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Результат обработки сообщения
 */
export interface ProcessMessageResult {
  success: boolean;
  response: string;
  messageType?: {
    type: string;
    subtype?: string | null;
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

/**
 * Обрабатывает текстовое сообщение через API
 */
export async function processTextMessage(
  text: string,
  context: MessageContext,
): Promise<ProcessMessageResult> {
  try {
    const traceId = randomUUID();

    const result =
      await apiClient.messages.processMessage.processMessage.mutate({
        text,
        channel: "telegram",
        userId: context.userId,
        chatId: context.chatId,
        messageId: context.messageId,
        metadata: {
          ...context.metadata,
          traceId,
          timestamp: new Date().toISOString(),
        },
      });

    return {
      success: result.success,
      response: result.response,
      messageType: result.messageType,
      relevance: result.relevance,
      parsed: result.parsed,
    };
  } catch (error) {
    console.error("API request error:", error);

    return {
      success: false,
      response:
        "Извините, произошла ошибка при обработке сообщения. Попробуйте позже.",
    };
  }
}

/**
 * Результат транскрипции аудио
 */
export interface TranscribeResult {
  success: boolean;
  text: string;
  filename: string;
}

/**
 * Транскрибирует аудио через API
 */
export async function transcribeAudio(
  buffer: Buffer,
  filename: string,
  context: MessageContext,
): Promise<TranscribeResult> {
  try {
    const traceId = randomUUID();

    const result = await apiClient.messages.transcribe.transcribe.mutate({
      audio: buffer,
      filename,
      channel: "telegram",
      userId: context.userId,
      chatId: context.chatId,
      messageId: context.messageId,
      metadata: {
        ...context.metadata,
        traceId,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      success: result.success,
      text: result.text,
      filename: result.filename,
    };
  } catch (error) {
    console.error("Transcription API request error:", error);

    return {
      success: false,
      text: "",
      filename,
    };
  }
}
