import { z } from "zod";

// Environment variables schema
export const envSchema = {
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_TYPE: z.string().optional(),
  POSTGRES_URL: z.string().url().optional(),
  WEB_APP_URL: z.string().url().optional(),
  EMAIL_FROM: z.string().email().optional(),
  APP_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  LANGFUSE_PUBLIC_KEY: z.string().min(1).optional(),
  LANGFUSE_SECRET_KEY: z.string().min(1).optional(),
  LANGFUSE_BASEURL: z.string().url().optional(),
  TELEGRAM_BOT_TOKEN: z.string().min(10, "TELEGRAM_BOT_TOKEN is required"),
};

// Type exports
export type TEnvSchema = typeof envSchema;
