import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { Langfuse } from "langfuse";

import type { PromptKey } from "@synoro/prompts";
import { PROMPT_KEYS } from "@synoro/prompts";
import {
  combinedClassificationSchema,
  messageTypeSchema,
  relevanceSchema,
} from "@synoro/validators";

import type { MessageTypeResult, RelevanceResult, Telemetry } from "./types";
import { parseContextSafely } from "./advisor";

// Initialize AI providers
const oai = openai; // use default provider instance; it reads OPENAI_API_KEY from env
const moonshotAI = createOpenAICompatible({
  name: "moonshot",
  apiKey: process.env.MOONSHOT_API_KEY,
  baseURL: "https://api.moonshot.ai/v1",
});

// Get the active AI provider based on configuration
function getActiveProvider() {
  return process.env.AI_PROVIDER === "moonshot" ? moonshotAI : oai;
}

// Helper function to get model based on provider and environment variables
function getModelFromEnv(
  moonshotModel: string | undefined,
  openaiModel: string | undefined,
  moonshotDefault: string,
  openaiDefault: string,
): string {
  if (process.env.AI_PROVIDER === "moonshot") {
    return moonshotModel ?? moonshotDefault;
  }
  return openaiModel ?? openaiDefault;
}

// Get the active advice model
export function getAdviceModel() {
  return getModelFromEnv(
    process.env.MOONSHOT_ADVICE_MODEL,
    process.env.OPENAI_ADVICE_MODEL,
    "kimi-k2-0711-preview",
    "gpt-4o-mini",
  );
}

// Lazy-initialized Langfuse client and cached prompts per key
let lf: Langfuse | null = null;
const cachedPrompts: Record<string, string> = {};

async function getSystemPrompt(key: PromptKey): Promise<string> {
  if (cachedPrompts[key]) return cachedPrompts[key];

  // Проверяем наличие Langfuse credentials
  if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) {
    throw new Error("Langfuse credentials not configured");
  }

  try {
    if (!lf) {
      lf = new Langfuse({
        publicKey: process.env.LANGFUSE_PUBLIC_KEY,
        secretKey: process.env.LANGFUSE_SECRET_KEY,
        baseUrl: process.env.LANGFUSE_BASEURL,
      });
    }

    const prompt = await lf.getPrompt(key);
    // Compile with empty vars by default; extend if variables are added later
    const compiled = prompt.compile({});
    const value = compiled.trim();
    if (value) {
      cachedPrompts[key] = value;
      return value;
    }
    throw new Error(`Empty prompt returned for key: ${key}`);
  } catch (error) {
    console.error(`Failed to get prompt from Langfuse for key ${key}:`, error);
    throw new Error(
      `Failed to get prompt from Langfuse: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export function extractFirstJsonObject(input: string): string | null {
  let depth = 0;
  let startIndex = -1;
  let inString = false;
  let escapeNext = false;
  let quoteChar: '"' | "'" | "" = "";

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inString) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (ch === "\\") {
        escapeNext = true;
        continue;
      }
      if (ch === quoteChar) {
        inString = false;
        quoteChar = "";
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      quoteChar = ch;
      continue;
    }

    if (ch === "{") {
      if (depth === 0) startIndex = i;
      depth++;
    } else if (ch === "}") {
      if (depth > 0) {
        depth--;
        if (depth === 0 && startIndex !== -1) {
          return input.slice(startIndex, i + 1);
        }
      }
    }
  }
  return null;
}

export interface MessageClassificationResult {
  messageType: MessageTypeResult;
  relevance: RelevanceResult;
}

/**
 * Классифицирует сообщение - определяет релевантность и тип за один AI вызов
 * Оптимизированная версия, заменяющая два отдельных классификатора
 */
export async function classifyMessage(
  text: string,
  telemetry?: Telemetry,
): Promise<MessageClassificationResult> {
  const system = await getSystemPrompt(PROMPT_KEYS.MESSAGE_CLASSIFIER);

  // Извлекаем контекст из метаданных
  const context = parseContextSafely(telemetry);

  // Формируем контекстный промпт
  let contextualPrompt = `Message: ${text}`;

  if (context.length > 0) {
    contextualPrompt = `Контекст беседы:\n`;
    context.forEach((msg: any, index: number) => {
      const role = msg.role === "user" ? "Пользователь" : "Ассистент";
      contextualPrompt += `${index + 1}. ${role}: ${msg.content.text}\n`;
    });
    contextualPrompt += `\nТекущее сообщение для классификации: ${text}`;
  }

  contextualPrompt += `\nJSON:`;

  try {
    const { text: out } = await generateText({
      model: getActiveProvider()(getAdviceModel()),
      system,
      prompt: contextualPrompt,
      temperature: 0.1,
      experimental_telemetry: {
        isEnabled: true,
        functionId: telemetry?.functionId ?? "ai-classify-combined",
        metadata: telemetry?.metadata,
      },
    });
    const trimmed = out.trim();
    const candidate = extractFirstJsonObject(trimmed);
    if (candidate) {
      const obj = JSON.parse(candidate);
      const validated = combinedClassificationSchema.safeParse(obj);
      if (validated.success) return validated.data;
    }
  } catch (error) {
    console.error("Error in combined classification:", error);
    // Fallback below
  }

  // Fallback: default values for both classifications
  return {
    messageType: {
      type: "chat",
      subtype: null,
      confidence: 0.3,
      need_logging: false,
    },
    relevance: { relevant: false, score: 0 },
  };
}
