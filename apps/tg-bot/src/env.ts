import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).optional(),
    TELEGRAM_BOT_TOKEN: z.string().min(10, "TELEGRAM_BOT_TOKEN is required"),
    OPENAI_API_KEY: z.string().min(10, "OPENAI_API_KEY is required"),
    OPENAI_TRANSCRIBE_MODEL: z.string().optional(),
    OPENAI_ADVICE_MODEL: z.string().optional(),
    PROMPTS_ASSISTANT_KEY: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_TRANSCRIBE_MODEL: process.env.OPENAI_TRANSCRIBE_MODEL,
    OPENAI_ADVICE_MODEL: process.env.OPENAI_ADVICE_MODEL,
    PROMPTS_ASSISTANT_KEY: process.env.PROMPTS_ASSISTANT_KEY,
  },
  skipValidation:
    !!process.env.CI ||
    process.env.npm_lifecycle_event === "lint" ||
    process.env.NODE_ENV === "test",
});
