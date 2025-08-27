import type { Telemetry } from "./types";

/**
 * Транскрибирует аудио файл
 */
export async function transcribe(
  audioBuffer: Buffer,
  filename: string,
  telemetry?: Telemetry,
): Promise<string> {
  try {
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error("Пустой аудиобуфер");
    }
    const lower = filename.toLowerCase();
    const allowed = [".mp3", ".m4a", ".wav", ".ogg", ".webm"];
    if (!allowed.some((ext) => lower.endsWith(ext))) {
      throw new Error(`Неподдерживаемый формат файла: ${filename}`);
    }

    // Здесь должна быть интеграция с OpenAI Whisper API
    // Пока возвращаем заглушку
    console.log("Transcribing audio:", {
      filename,
      bufferSize: audioBuffer.length,
      functionId: telemetry?.functionId,
      metadata: telemetry?.metadata,
    });

    // TODO: Реализовать реальную транскрипцию через OpenAI Whisper
    throw new Error("Audio transcription not implemented yet");
  } catch (error) {
    console.error("Error in audio transcription:", error);
    throw error;
  }
}
