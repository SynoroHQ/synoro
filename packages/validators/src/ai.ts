import { z } from "zod";

// Relevance classification schema
export const relevanceSchema = z.object({
  relevant: z.boolean(),
  score: z.number().min(0).max(1).optional(),
  category: z.enum(["relevant", "irrelevant", "spam"]).optional(),
});

// Message type classification schema
export const messageTypeSchema = z.object({
  type: z.enum(["question", "event", "chat", "irrelevant"]),
  subtype: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1),
  need_logging: z.boolean(),
});

// Combined classification schema
export const combinedClassificationSchema = z.object({
  messageType: messageTypeSchema,
  relevance: relevanceSchema,
});

// Type exports
export type TRelevanceResult = z.infer<typeof relevanceSchema>;
export type TMessageTypeResult = z.infer<typeof messageTypeSchema>;
export type TMessageClassificationResult = z.infer<
  typeof combinedClassificationSchema
>;
