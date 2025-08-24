import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { Langfuse } from "langfuse";

import type { PromptKey } from "@synoro/prompts";
import {
  DEFAULT_PROMPT_KEY,
  getPromptSafe,
  PROMPT_KEYS,
} from "@synoro/prompts";

import type { ParsedTask, Telemetry } from "./types";
import { extractFirstJsonObject } from "./classifier";

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
function getAdviceModel() {
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

async function getSystemPrompt(
  key: PromptKey = DEFAULT_PROMPT_KEY,
): Promise<string> {
  if (cachedPrompts[key]) return cachedPrompts[key];

  // Try Langfuse first if creds are present
  if (process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY) {
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
    } catch (_e) {
      // Fallback below
    }
  }

  // Fallback to local registry prompt (defaults internally)
  const local = getPromptSafe(key).trim();
  cachedPrompts[key] = local;
  return local;
}

// (The entire local definition of extractFirstJsonObject has been removed
//  in favor of the imported one.)
/**
 * Парсит текст и извлекает структурированную задачу
 */
export async function parseTask(
  text: string,
  telemetry?: Telemetry,
): Promise<ParsedTask | null> {
  const system = await getSystemPrompt(PROMPT_KEYS.PARSER_TASK);
  try {
    const { text: out } = await generateText({
      model: getActiveProvider()(getAdviceModel()),
      system,
      prompt: `Text: ${text}\nJSON:`,
      temperature: 0.2,
      experimental_telemetry: {
        isEnabled: true,
        functionId: telemetry?.functionId ?? "ai-parse-task",
        metadata: telemetry?.metadata,
      },
    });
    const trimmed = out.trim();
    const candidate = extractFirstJsonObject(trimmed);
    if (!candidate) {
      console.warn("parseTask: No JSON object found in model output", {
        functionId: telemetry?.functionId ?? "ai-parse-task",
        preview: trimmed.slice(0, 200),
      });
      return null;
    }

    let parsedUnknown: unknown;
    try {
      parsedUnknown = JSON.parse(candidate);
    } catch (err) {
      console.warn("parseTask: JSON.parse failed", {
        functionId: telemetry?.functionId ?? "ai-parse-task",
        error: (err as Error)?.message,
        preview: candidate.slice(0, 200),
      });
      return null;
    }

    const parsed = parsedUnknown as Partial<ParsedTask> &
      Record<string, unknown>;

    if (
      typeof parsed.action !== "string" ||
      parsed.action.trim().length === 0
    ) {
      console.warn("parseTask: invalid or missing 'action'", {
        functionId: telemetry?.functionId ?? "ai-parse-task",
        valueType: typeof (parsed as any)?.action,
      });
      return null;
    }
    if (
      typeof parsed.object !== "string" ||
      parsed.object.trim().length === 0
    ) {
      console.warn("parseTask: invalid or missing 'object'", {
        functionId: telemetry?.functionId ?? "ai-parse-task",
        valueType: typeof (parsed as any)?.object,
      });
      return null;
    }

    const raw = Number((parsed as any).confidence);
    let confidence = 0.5;
    if (Number.isFinite(raw)) {
      confidence = Math.min(1, Math.max(0, raw));
    }

    return {
      action: parsed.action.trim(),
      object: parsed.object.trim(),
      confidence,
    };
  } catch (e) {
    console.warn("parseTask: unexpected error", {
      functionId: telemetry?.functionId ?? "ai-parse-task",
      error: (e as Error)?.message,
    });
    return null;
  }
}
