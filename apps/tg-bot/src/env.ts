import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).optional(),
    TELEGRAM_BOT_TOKEN: z.string().min(10, "TELEGRAM_BOT_TOKEN is required"),
    // API configuration
    API_BASE_URL: z.string().url().default("http://localhost:3000"),
    API_TOKEN: z.string().optional(),
    // Security-related options for the Telegram bot
    TG_ALLOWED_CHAT_IDS: z.string().optional(), // comma-separated chat IDs
    TG_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().optional(),
    TG_RATE_LIMIT_LIMIT: z.coerce.number().int().positive().optional(),
    TG_MESSAGE_MAX_LENGTH: z.coerce.number().int().positive().optional(),
    // Audio processing limits
    TG_AUDIO_MAX_BYTES: z.coerce.number().int().positive().optional(),
    TG_AUDIO_MAX_DURATION_SEC: z.coerce.number().int().positive().optional(),
    TG_FETCH_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    API_BASE_URL: process.env.API_BASE_URL,
    API_TOKEN: process.env.API_TOKEN,
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
