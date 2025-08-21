import { z } from "zod";

export const Channel = z.enum(["telegram", "web", "mobile"]);
export const MessageRole = z.enum(["system", "user", "assistant", "tool"]);

export const ChatAttachment = z.object({
  key: z.string(),
  mime: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
  name: z.string().optional(),
});

export const SendMessageInput = z.object({
  conversationId: z.string().min(1).optional(),
  createNew: z.boolean().default(false).optional(),
  channel: Channel,
  content: z.object({
    text: z.string().min(1).max(16000),
  }),
  attachments: z.array(ChatAttachment).optional(),
  idempotencyKey: z.string().min(8).max(128).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const MessageOutput = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: MessageRole,
  content: z.object({ text: z.string() }),
  createdAt: z.date(),
});

export const GetHistoryInput = z.object({
  conversationId: z.string().min(1),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(100).optional(),
});

export const ListConversationsInput = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20).optional(),
});

export type TChannel = z.infer<typeof Channel>;
export type TMessageRole = z.infer<typeof MessageRole>;
export type TSendMessageInput = z.infer<typeof SendMessageInput>;
export type TMessageOutput = z.infer<typeof MessageOutput>;
export type TGetHistoryInput = z.infer<typeof GetHistoryInput>;
export type TListConversationsInput = z.infer<typeof ListConversationsInput>;
