import { generateText, experimental_transcribe as aiTranscribe } from "ai";
import { openai } from "@ai-sdk/openai";
import { env } from "../env";
import { getPromptSafe } from "@synoro/prompts";
import type { AttributeValue } from "@opentelemetry/api";
import { Langfuse } from "langfuse";

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
    } catch (e) {
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

export async function advise(input: string, telemetry?: Telemetry): Promise<string> {
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
  telemetry?: Telemetry,
): Promise<string> {
  const { text } = await aiTranscribe({
    model: oai.transcription(TRANSCRIBE_MODEL),
    audio: buffer,
    // mimeType: "audio/mpeg", // можно указать при необходимости
  });
  return text ?? "";
}
