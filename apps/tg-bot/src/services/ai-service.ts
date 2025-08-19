import type { AttributeValue } from "@opentelemetry/api";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { experimental_transcribe as aiTranscribe, generateText } from "ai";
import { Langfuse } from "langfuse";
import { z } from "zod";

import type { PromptKey } from "@synoro/prompts";
import {
  DEFAULT_PROMPT_KEY,
  getPromptSafe,
  PROMPT_KEYS,
} from "@synoro/prompts";

import { env } from "../env";

// Initialize AI providers
const oai = openai; // use default provider instance; it reads OPENAI_API_KEY from env
const moonshotAI = createOpenAI({
  apiKey: env.MOONSHOT_API_KEY,
  baseURL: "https://api.moonshot.ai/v1",
});

// Get the active AI provider based on configuration
function getActiveProvider() {
  return env.AI_PROVIDER === "moonshot" ? moonshotAI : oai;
}

// Get the active transcription model
function getTranscribeModel() {
  if (env.AI_PROVIDER === "moonshot") {
    return env.MOONSHOT_TRANSCRIBE_MODEL ?? "moonshot-v1";
  }
  return env.OPENAI_TRANSCRIBE_MODEL ?? "whisper-1";
}

// Get the active advice model
function getAdviceModel() {
  if (env.AI_PROVIDER === "moonshot") {
    return env.MOONSHOT_ADVICE_MODEL ?? "kimi-k2-0711-preview";
  }
  return env.OPENAI_ADVICE_MODEL ?? "gpt-4o-mini";
}

// Lazy-initialized Langfuse client and cached prompts per key
let lf: Langfuse | null = null;
const cachedPrompts: Record<string, string> = {};

async function getSystemPrompt(
  key: PromptKey = DEFAULT_PROMPT_KEY,
): Promise<string> {
  if (cachedPrompts[key]) return cachedPrompts[key];

  // Try Langfuse first if creds are present
  if (env.LANGFUSE_PUBLIC_KEY && env.LANGFUSE_SECRET_KEY) {
    try {
      if (!lf) {
        lf = new Langfuse({
          publicKey: env.LANGFUSE_PUBLIC_KEY,
          secretKey: env.LANGFUSE_SECRET_KEY,
          baseUrl: env.LANGFUSE_BASEURL,
        });
      }

      const prompt = await lf.getPrompt(key);
      // Compile with empty vars by default; extend if variables are added later
      const compiled = prompt.compile({});
      const value = (compiled as string).trim();
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

async function getAssistantSystemPrompt(): Promise<string> {
  return getSystemPrompt(PROMPT_KEYS.ASSISTANT);
}

export type TelemetryMeta = Record<string, AttributeValue> & {
  langfuseTraceId?: string;
  langfuseUpdateParent?: boolean;
};

export type Telemetry = {
  functionId?: string;
  metadata?: TelemetryMeta;
};

export type RelevanceResult = {
  relevant: boolean;
  score?: number;
  category?: "relevant" | "irrelevant" | "spam";
};

const relevanceSchema = z.object({
  relevant: z.boolean(),
  score: z.number().min(0).max(1).optional(),
  category: z.enum(["relevant", "irrelevant", "spam"]).optional(),
});

export async function classifyRelevance(
  text: string,
  telemetry?: Telemetry,
): Promise<RelevanceResult> {
  const system = await getSystemPrompt(PROMPT_KEYS.CLASSIFIER_RELEVANCE);
  try {
    const { text: out } = await generateText({
      model: getActiveProvider()(getAdviceModel()),
      system,
      prompt: `Message: ${text}\nJSON:`,
      temperature: 0.0,
      experimental_telemetry: {
        isEnabled: true,
        functionId: telemetry?.functionId ?? "bot-classify-relevance",
        metadata: telemetry?.metadata,
      },
    });
    const trimmed = out.trim();
    const candidate = extractFirstJsonObject(trimmed);
    if (candidate) {
      const obj = JSON.parse(candidate);
      const validated = relevanceSchema.safeParse(obj);
      if (validated.success) return validated.data;
    }
  } catch (_e) {
    // ignore and fallback below
  }
  // Fallback: default to not relevant
  return { relevant: false, score: 0 };
}

export async function advise(
  input: string,
  telemetry?: Telemetry,
): Promise<string> {
  const systemPrompt = await getAssistantSystemPrompt();
  const { text } = await generateText({
    model: getActiveProvider()(getAdviceModel()),
    system: systemPrompt,
    prompt: input,
    temperature: 0.4,
    experimental_telemetry: {
      isEnabled: true,
      functionId: telemetry?.functionId ?? "bot-advise",
      metadata: telemetry?.metadata,
    },
  });
  return text.trim();
}

export async function transcribe(
  buffer: Buffer,
  _filename: string,
  _telemetry?: Telemetry,
): Promise<string> {
  const { text } = await aiTranscribe({
    model: getActiveProvider().transcription(getTranscribeModel()),
    audio: buffer,
    // mimeType: "audio/mpeg", // можно указать при необходимости
  });
  return text ?? "";
}

type ParsedTask = {
  action: string;
  object: string;
  confidence?: number;
};

function extractFirstJsonObject(input: string): string | null {
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
      quoteChar = ch as '"' | "'";
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
        functionId: telemetry?.functionId ?? "bot-parse-task",
        metadata: telemetry?.metadata,
      },
    });
    const trimmed = out.trim();
    const candidate = extractFirstJsonObject(trimmed);
    if (!candidate) {
      console.warn("parseTask: No JSON object found in model output", {
        functionId: telemetry?.functionId ?? "bot-parse-task",
        preview: trimmed.slice(0, 200),
      });
      return null;
    }

    let parsedUnknown: unknown;
    try {
      parsedUnknown = JSON.parse(candidate);
    } catch (err) {
      console.warn("parseTask: JSON.parse failed", {
        functionId: telemetry?.functionId ?? "bot-parse-task",
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
        functionId: telemetry?.functionId ?? "bot-parse-task",
        valueType: typeof (parsed as any)?.action,
      });
      return null;
    }
    if (
      typeof parsed.object !== "string" ||
      parsed.object.trim().length === 0
    ) {
      console.warn("parseTask: invalid or missing 'object'", {
        functionId: telemetry?.functionId ?? "bot-parse-task",
        valueType: typeof (parsed as any)?.object,
      });
      return null;
    }

    let confidence: number | undefined = undefined;
    if (parsed.confidence !== undefined) {
      const asNumber = Number((parsed as any).confidence);
      if (!Number.isNaN(asNumber)) {
        confidence = Math.min(1, Math.max(0, asNumber));
      }
    }
    if (confidence === undefined) confidence = 0.5;

    return {
      action: parsed.action.trim(),
      object: parsed.object.trim(),
      confidence,
    };
  } catch (e) {
    console.warn("parseTask: unexpected error", {
      functionId: telemetry?.functionId ?? "bot-parse-task",
      error: (e as Error)?.message,
    });
    return null;
  }
}
