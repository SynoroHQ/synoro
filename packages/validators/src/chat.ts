import { z } from "zod";

export const Channel = z.enum(["telegram", "web", "mobile"]);
export const MessageRole = z.enum(["system", "user", "assistant", "tool"]);

export const ChatAttachment = z.object({
  key: z.string(),
  mime: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
  name: z.string().optional(),
});

export const SendMessageInput = z
  .object({
    conversationId: z.string().min(1).optional(),
    createNew: z.boolean().default(false),
    channel: Channel,
    content: z.object({
      text: z.string().trim().min(1).max(16000),
    }),
    attachments: z.array(ChatAttachment).default([]),
    idempotencyKey: z
      .string()
      .trim()
      .min(8)
      .max(128)
      .regex(/^[A-Za-z0-9:_-]+$/, "Разрешены символы A–Z, a–z, 0–9, :, _, -")
      .optional(),
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).default(0.7),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((data, ctx) => {
    const hasId = !!data.conversationId;
    const wantsNew = data.createNew === true;
    if (hasId && wantsNew) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["createNew"],
        message:
          "Либо указывайте conversationId, либо createNew=true — выберите одно.",
      });
    }
    if (!hasId && !wantsNew) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Укажите conversationId или установите createNew=true.",
      });
    }
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

// New schemas for chat operations
export const SendMessageOutput = z.object({
  runId: z.string(),
  conversationId: z.string(),
  userMessageId: z.string(),
});

export const StreamInput = z.object({
  runId: z.string(),
  conversationId: z.string().min(1),
});

export const ListConversationsOutput = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string().nullable().optional(),
      channel: z.string(),
      updatedAt: z.date(),
      lastMessageAt: z.date().nullable().optional(),
    }),
  ),
});

export const GetHistoryOutput = z.object({
  items: z.array(MessageOutput),
});

// Type exports
export type TChannel = z.infer<typeof Channel>;
export type TMessageRole = z.infer<typeof MessageRole>;
export type TSendMessageInput = z.infer<typeof SendMessageInput>;
export type TMessageOutput = z.infer<typeof MessageOutput>;
export type TGetHistoryInput = z.infer<typeof GetHistoryInput>;
export type TListConversationsInput = z.infer<typeof ListConversationsInput>;
export type TSendMessageOutput = z.infer<typeof SendMessageOutput>;
export type TStreamInput = z.infer<typeof StreamInput>;
export type TListConversationsOutput = z.infer<typeof ListConversationsOutput>;
export type TGetHistoryOutput = z.infer<typeof GetHistoryOutput>;
