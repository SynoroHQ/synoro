import { z } from "zod";

// Import Channel from chat to avoid duplication
import { Channel } from "./chat";

// Schema for incoming message processing
export const ProcessMessageInput = z
  .object({
    text: z
      .string()
      .min(1, "Текст сообщения не может быть пустым")
      .max(5000, "Текст сообщения слишком длинный"),
    channel: Channel,
    messageId: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    telegramUserId: z.string().optional(), // ID пользователя Telegram (не связан с таблицей users)
  })
  .refine(
    (data) => {
      // Для Telegram канала telegramUserId обязателен
      if (data.channel === "telegram") {
        return data.telegramUserId;
      }
      return true;
    },
    {
      message: "Для Telegram канала telegramUserId обязателен",
      path: ["telegramUserId"],
    },
  );

// Schema for message processing response
export const ProcessMessageResponse = z.object({
  success: z.boolean(),
  response: z.string(),
  messageType: z.object({
    type: z.string(),
    subtype: z.string().nullable().optional(),
    confidence: z.number(),
    need_logging: z.boolean(),
  }),
  relevance: z.object({
    relevant: z.boolean(),
    score: z.number().optional(),
    category: z.string().optional(),
  }),
  parsed: z
    .object({
      action: z.string(),
      object: z.string(),
      confidence: z.number().optional(),
    })
    .nullable(),
});

// Schema for audio transcription input
export const TranscribeInput = z
  .object({
    audio: z.string(), // base64-encoded audio data
    filename: z.string(),
    channel: Channel,
    messageId: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    telegramUserId: z.string().optional(), // ID пользователя Telegram (не связан с таблицей users)
  })
  .refine(
    (data) => {
      // Для Telegram канала telegramUserId обязателен
      if (data.channel === "telegram") {
        return data.telegramUserId;
      }
      return true;
    },
    {
      message: "Для Telegram канала telegramUserId обязателен",
      path: ["telegramUserId"],
    },
  );

// Schema for transcription response
export const TranscribeResponse = z.object({
  success: z.boolean(),
  text: z.string(),
  filename: z.string(),
});

// Type exports
export type TProcessMessageInput = z.infer<typeof ProcessMessageInput>;
export type TProcessMessageResponse = z.infer<typeof ProcessMessageResponse>;
export type TTranscribeInput = z.infer<typeof TranscribeInput>;
export type TTranscribeResponse = z.infer<typeof TranscribeResponse>;
