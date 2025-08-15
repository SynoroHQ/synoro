import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { env } from "../env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL ?? "whisper-1"; // or "gpt-4o-mini-transcribe"
const ADVICE_MODEL = process.env.OPENAI_ADVICE_MODEL ?? "gpt-4o-mini";

export async function advise(input: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model: ADVICE_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Ты полезный домашний ассистент. Кратко анализируй событие и давай практичные советы. Отвечай по-русски, до 3 предложений.",
      },
      { role: "user", content: input },
    ],
    temperature: 0.4,
  });
  return res.choices[0]?.message?.content?.trim() ?? "";
}

export async function transcribe(buffer: Buffer, filename: string): Promise<string> {
  const transcription = await openai.audio.transcriptions.create({
    file: await toFile(buffer, filename),
    model: TRANSCRIBE_MODEL,
    // language: "ru"
  });
  return transcription.text ?? "";
}
