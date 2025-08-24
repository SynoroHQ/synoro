import { openai } from "@ai-sdk/openai";
import { experimental_transcribe as aiTranscribe } from "ai";

import type { Telemetry } from "./types";

/**
 * Транскрибирует аудио файл в текст используя OpenAI Whisper
 */
export async function transcribe(
  buffer: Buffer,
  filename: string,
  telemetry?: Telemetry,
): Promise<string> {
  try {
    const { text } = await aiTranscribe({
      model: openai.transcription("whisper-1"),
      audio: buffer,
    });

    return text ?? "";
  } catch (error) {
    // Log the error with contextual information
    const context = `aiTranscribe failed for filename: ${filename}`;
    if (telemetry?.functionId) {
      console.error(`${context}, functionId: ${telemetry.functionId}`, error);
    } else {
      console.error(context, error);
    }

    // Rethrow with a clear message while preserving the original error
    throw new Error(`Audio transcription failed: ${context}`, { cause: error });
  }
}
