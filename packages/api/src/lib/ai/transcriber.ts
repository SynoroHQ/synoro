import OpenAI from "openai";

import type { Telemetry } from "./types";
import { env } from "../../../env";

/**
 * Определяет MIME тип для аудио файла
 */
function getMimeType(filename: string): string {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".ogg")) return "audio/ogg";
  if (lower.endsWith(".oga")) return "audio/ogg";
  if (lower.endsWith(".webm")) return "audio/webm";

  return "audio/mpeg"; // fallback
}

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
    const allowed = [".mp3", ".m4a", ".wav", ".ogg", ".oga", ".webm"];
    if (!allowed.some((ext) => lower.endsWith(ext))) {
      throw new Error(`Неподдерживаемый формат файла: ${filename}`);
    }

    // Проверяем наличие API ключа
    if (!env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Инициализируем OpenAI клиент
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    try {
      // Создаем File объект из Buffer
      const audioFile = new File([new Uint8Array(audioBuffer)], filename, {
        type: getMimeType(filename),
      });

      // Отправляем запрос к Whisper API
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "ru", // По умолчанию русский, можно сделать настраиваемым
        response_format: "text",
      });

      console.log("Transcription completed:", {
        filename,
        textLength: transcription.length,
        functionId: telemetry?.functionId,
      });

      return transcription;
    } catch (apiError) {
      console.error("OpenAI Whisper API error:", apiError);

      if (apiError instanceof Error) {
        // Обрабатываем специфичные ошибки API
        if (apiError.message.includes("rate_limit_exceeded")) {
          throw new Error(
            "Превышен лимит запросов к OpenAI API. Попробуйте позже.",
          );
        }
        if (apiError.message.includes("invalid_request_error")) {
          throw new Error(
            "Некорректный запрос к OpenAI API. Проверьте формат файла.",
          );
        }
        if (apiError.message.includes("insufficient_quota")) {
          throw new Error("Недостаточно средств на счете OpenAI API.");
        }
      }

      throw new Error(
        `Ошибка транскрипции: ${apiError instanceof Error ? apiError.message : "Неизвестная ошибка"}`,
      );
    }
  } catch (error) {
    console.error("Error in audio transcription:", error);
    throw error;
  }
}
