import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

import { createId, messages } from "@synoro/db";
import { db } from "@synoro/db/client";

import { env } from "../../env";
import { eventBus } from "./event-bus";

// Very simple mock streaming generator.
// Replace later with real OpenAI integration while keeping the same interface.
// Supports both registered users (userId) and anonymous Telegram users (telegramChatId)
export async function startCompletionRun(opts: {
  runId: string;
  conversationId: string;
  _userMessageId: string;
  prompt: string;
  model?: string;
  userId?: string | null;
  telegramChatId?: string; // Для анонимных пользователей Telegram
}) {
  const { runId, conversationId, prompt } = opts;

  // If no OpenAI key, fallback to mock stream
  if (!env.OPENAI_API_KEY) {
    const mock = `Принято. Ответ на: ${prompt}\n\nЭто демо-стрим.`;
    const tokens = mock.split(/(\s+)/); // keep spaces
    let fullText = "";
    for (const t of tokens) {
      fullText += t;
      eventBus.publish(runId, { type: "token", data: { text: t } });
      await new Promise((r) => setTimeout(r, 25));
    }

    const now = new Date();
    const assistantId = createId();
    await db.insert(messages).values({
      id: assistantId,
      conversationId,
      role: "assistant",
      content: { text: fullText },
      model: opts.model ?? "mock",
      status: "completed",
      parentId: opts._userMessageId,
      createdAt: now,
    });
    eventBus.publish(runId, { type: "done", data: { messageId: assistantId } });
    return;
  }

  // OpenAI streaming path via Vercel AI SDK
  const model = opts.model ?? "gpt-5-nano";
  let fullText = "";
  try {
    const result = streamText({
      model: openai(model),
      prompt,
      temperature: 0.7,
      experimental_telemetry: {
        isEnabled: true,
        functionId: "api-chat-stream",
        metadata: {
          runId,
          conversationId,
          userId: opts.userId ?? "unknown",
          telegramChatId: opts.telegramChatId ?? "unknown",
        },
      },
    });

    for await (const delta of result.textStream) {
      if (delta) {
        fullText += delta;
        eventBus.publish(runId, { type: "token", data: { text: delta } });
      }
    }

    const now = new Date();
    const assistantId = createId();
    await db.insert(messages).values({
      id: assistantId,
      conversationId,
      role: "assistant",
      content: { text: fullText },
      model,
      status: "completed",
      createdAt: now,
    });
    eventBus.publish(runId, { type: "done", data: { messageId: assistantId } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    eventBus.publish(runId, { type: "error", data: { message: msg } });
  }
}
