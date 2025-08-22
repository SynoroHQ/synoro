import { openai } from "@ai-sdk/openai";
import { experimental_transcribe as aiTranscribe } from "ai";

import type { Telemetry } from "./types";

/**
 * Транскрибирует аудио файл в текст используя OpenAI Whisper
 */
export async function transcribe(
  buffer: Buffer,
  _filename: string,
  _telemetry?: Telemetry,
): Promise<string> {
  const { text } = await aiTranscribe({
    model: openai.transcription("whisper-1"),
    audio: buffer,
  });

  return text ?? "";
}
