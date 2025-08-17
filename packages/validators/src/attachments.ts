import { z } from "zod";

// Schema for creating presigned URLs
export const CreatePresignedUrlSchema = z.object({
  key: z.string().min(1, "Key is required"),
  temporary: z.boolean().default(false),
});

// Schema for attachment metadata
export const attachmentSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().int().positive(),
  url: z.string().url(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  expiresAt: z.date().optional(),
});

// Type exports
export type CreatePresignedUrlInput = z.infer<typeof CreatePresignedUrlSchema>;
export type AttachmentData = z.infer<typeof attachmentSchema>;
