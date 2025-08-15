import { generateText, experimental_transcribe as aiTranscribe } from "ai";
import { openai } from "@ai-sdk/openai";
import { env } from "../env";
import { getPromptSafe } from "@synoro/prompts";

const oai = openai({ apiKey: env.OPENAI_API_KEY });

const TRANSCRIBE_MODEL = env.OPENAI_TRANSCRIBE_MODEL ?? "whisper-1"; // or "gpt-4o-mini-transcribe"
const ADVICE_MODEL = env.OPENAI_ADVICE_MODEL ?? "gpt-4o-mini";
const ASSISTANT_PROMPT = getPromptSafe(env.PROMPTS_ASSISTANT_KEY);

export type AttributeValue = string | number | boolean | ReadonlyArray<string | number | boolean>;
export type TelemetryMeta = Record<string, AttributeValue> & {
  langfuseTraceId?: string;
  langfuseUpdateParent?: boolean;
};

export type Telemetry = {
  functionId?: string;
  metadata?: TelemetryMeta;
};

export async function advise(input: string, telemetry?: Telemetry): Promise<string> {
  const { text } = await generateText({
    model: oai(ADVICE_MODEL),
    system: ASSISTANT_PROMPT,
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
