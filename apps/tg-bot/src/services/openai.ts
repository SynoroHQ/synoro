import type { AttributeValue } from "@opentelemetry/api";
import { openai } from "@ai-sdk/openai";
import { experimental_transcribe as aiTranscribe, generateText } from "ai";
import { Langfuse } from "langfuse";

import { getPromptSafe } from "@synoro/prompts";

import { env } from "../env";

const oai = openai; // use default provider instance; it reads OPENAI_API_KEY from env

const TRANSCRIBE_MODEL = env.OPENAI_TRANSCRIBE_MODEL ?? "whisper-1"; // or "gpt-4o-mini-transcribe"
const ADVICE_MODEL = env.OPENAI_ADVICE_MODEL ?? "gpt-4o-mini";

// Lazy-initialized Langfuse client and cached system prompt
let lf: Langfuse | null = null;
let cachedSystemPrompt: string | null = null;

async function getAssistantSystemPrompt(): Promise<string> {
  if (cachedSystemPrompt) return cachedSystemPrompt;

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
      const promptKey = env.PROMPTS_ASSISTANT_KEY ?? "assistant";
      const prompt = await lf.getPrompt(promptKey);
      // Compile with empty vars by default; extend if variables are added later
      const compiled = prompt.compile({});
      cachedSystemPrompt = (compiled as string).trim();
      if (cachedSystemPrompt) return cachedSystemPrompt;
    } catch (_e) {
      // Fallback below
    }
  }

  // Fallback to local registry prompt
  cachedSystemPrompt = getPromptSafe(env.PROMPTS_ASSISTANT_KEY).trim();
  return cachedSystemPrompt;
}

export type TelemetryMeta = Record<string, AttributeValue> & {
  langfuseTraceId?: string;
  langfuseUpdateParent?: boolean;
};

export type Telemetry = {
  functionId?: string;
  metadata?: TelemetryMeta;
};

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
  const system = `You extract a concise household maintenance task from Russian text.
Return ONLY JSON with keys: action, object, confidence (0..1). No explanations.`;
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
