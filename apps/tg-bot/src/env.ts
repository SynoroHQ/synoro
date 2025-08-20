import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).optional(),
    TELEGRAM_BOT_TOKEN: z.string().min(10, "TELEGRAM_BOT_TOKEN is required"),
    OPENAI_API_KEY: z.string().min(10, "OPENAI_API_KEY is required"),
    OPENAI_TRANSCRIBE_MODEL: z.string().optional(),
    OPENAI_ADVICE_MODEL: z.string().optional(),
    MOONSHOT_API_KEY: z
      .string()
      .min(10, "MOONSHOT_API_KEY is required")
      .optional(),
    MOONSHOT_TRANSCRIBE_MODEL: z.string().optional(),
    MOONSHOT_ADVICE_MODEL: z.string().optional(),
    AI_PROVIDER: z.enum(["openai", "moonshot"]).default("openai"),
    LANGFUSE_SECRET_KEY: z.string().optional(),
    LANGFUSE_PUBLIC_KEY: z.string().optional(),
    LANGFUSE_BASEURL: z.string().url().optional(),
    // Security-related options for the Telegram bot
    TG_ALLOWED_CHAT_IDS: z.string().optional(), // comma-separated chat IDs
    TG_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().optional(),
    TG_RATE_LIMIT_LIMIT: z.coerce.number().int().positive().optional(),
    TG_MESSAGE_MAX_LENGTH: z.coerce.number().int().positive().optional(),
    TG_AUDIO_MAX_BYTES: z.coerce.number().int().positive().optional(),
    TG_AUDIO_MAX_DURATION_SEC: z.coerce
      .number()
      .int()
      .positive()
      .optional(),
    TG_FETCH_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_TRANSCRIBE_MODEL: process.env.OPENAI_TRANSCRIBE_MODEL,
    OPENAI_ADVICE_MODEL: process.env.OPENAI_ADVICE_MODEL,
    MOONSHOT_API_KEY: process.env.MOONSHOT_API_KEY,
    MOONSHOT_TRANSCRIBE_MODEL: process.env.MOONSHOT_TRANSCRIBE_MODEL,
    MOONSHOT_ADVICE_MODEL: process.env.MOONSHOT_ADVICE_MODEL,
    AI_PROVIDER: process.env.AI_PROVIDER,
    LANGFUSE_SECRET_KEY: process.env.LANGFUSE_SECRET_KEY,
    LANGFUSE_PUBLIC_KEY: process.env.LANGFUSE_PUBLIC_KEY,
    LANGFUSE_BASEURL: process.env.LANGFUSE_BASEURL,
    TG_ALLOWED_CHAT_IDS: process.env.TG_ALLOWED_CHAT_IDS,
    TG_RATE_LIMIT_WINDOW_MS: process.env.TG_RATE_LIMIT_WINDOW_MS,
    TG_RATE_LIMIT_LIMIT: process.env.TG_RATE_LIMIT_LIMIT,
    TG_MESSAGE_MAX_LENGTH: process.env.TG_MESSAGE_MAX_LENGTH,
    TG_AUDIO_MAX_BYTES: process.env.TG_AUDIO_MAX_BYTES,
    TG_AUDIO_MAX_DURATION_SEC: process.env.TG_AUDIO_MAX_DURATION_SEC,
    TG_FETCH_TIMEOUT_MS: process.env.TG_FETCH_TIMEOUT_MS,
  },
  skipValidation:
    !!process.env.CI ||
    process.env.npm_lifecycle_event === "lint" ||
    process.env.NODE_ENV === "test",
});
