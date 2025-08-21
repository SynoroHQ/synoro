import { eventBus } from "./event-bus";
import { db } from "@synoro/db/client";
import { message, createId } from "@synoro/db";
import { env } from "../../env";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

// Very simple mock streaming generator.
// Replace later with real OpenAI integration while keeping the same interface.
export async function startCompletionRun(opts: {
  runId: string;
  conversationId: string;
  _userMessageId: string;
  prompt: string;
  model?: string;
  userId?: string;
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
    await db.insert(message).values({
      id: assistantId,
      conversationId,
      role: "assistant",
      content: { text: fullText },
      model: opts.model ?? "mock",
      status: "completed",
      createdAt: now,
    });
    eventBus.publish(runId, { type: "done", data: { messageId: assistantId } });
    return;
  }

  // OpenAI streaming path via Vercel AI SDK
  const model = opts.model ?? "gpt-4o-mini";
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
    await db.insert(message).values({
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
