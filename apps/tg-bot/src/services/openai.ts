import type { AttributeValue } from "@opentelemetry/api";
import { openai } from "@ai-sdk/openai";
import { experimental_transcribe as aiTranscribe, generateText } from "ai";
import { Langfuse } from "langfuse";
import { z } from "zod";

import {
  DEFAULT_PROMPT_KEY,
  getPromptSafe,
  PROMPT_KEYS,
  type PromptKey,
} from "@synoro/prompts";

import { env } from "../env";

const oai = openai; // use default provider instance; it reads OPENAI_API_KEY from env

const TRANSCRIBE_MODEL = env.OPENAI_TRANSCRIBE_MODEL ?? "whisper-1"; // or "gpt-4o-mini-transcribe"
const ADVICE_MODEL = env.OPENAI_ADVICE_MODEL ?? "gpt-4o-mini";

// Lazy-initialized Langfuse client and cached prompts per key
let lf: Langfuse | null = null;
const cachedPrompts: Record<string, string> = {};

async function getSystemPrompt(key: PromptKey = DEFAULT_PROMPT_KEY): Promise<string> {
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

export async function classifyRelevance(
  text: string,
  telemetry?: Telemetry,
): Promise<RelevanceResult> {
  const system = await getSystemPrompt(PROMPT_KEYS.CLASSIFIER_RELEVANCE);
  try {
    const { text: out } = await generateText({
      model: oai(ADVICE_MODEL),
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
    const jsonStart = trimmed.indexOf("{");
    const jsonEnd = trimmed.lastIndexOf("}");
    const payload =
      jsonStart >= 0 && jsonEnd > jsonStart
        ? trimmed.slice(jsonStart, jsonEnd + 1)
        : trimmed;
    const parsed = JSON.parse(payload) as RelevanceResult;
    if (typeof parsed.relevant === "boolean") return parsed;
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
    model: oai(ADVICE_MODEL),
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
    model: oai.transcription(TRANSCRIBE_MODEL),
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

export async function parseTask(
  text: string,
  telemetry?: Telemetry,
): Promise<ParsedTask | null> {
  const system = await getSystemPrompt(PROMPT_KEYS.PARSER_TASK);
  try {
    const { text: out } = await generateText({
      model: oai(ADVICE_MODEL),
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
    const jsonStart = trimmed.indexOf("{");
    const jsonEnd = trimmed.lastIndexOf("}");
    const payload =
      jsonStart >= 0 && jsonEnd > jsonStart
        ? trimmed.slice(jsonStart, jsonEnd + 1)
        : trimmed;
    const parsed = JSON.parse(payload) as ParsedTask;
    if (!parsed.action || !parsed.object) return null;
    return parsed;
  } catch (_e) {
    return null;
  }
}
