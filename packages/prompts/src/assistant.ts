import type { AIModel } from "./models";
import { createModelConfig, DEFAULT_MODEL } from "./models";

// Minimal interface to avoid coupling to a specific langfuse SDK here
export type LangfuseClientLike = {
  createPrompt: (args: {
    name: string;
    type: string; // typically 'text'
    prompt: string;
    labels?: string[];
    config?: unknown;
  }) => Promise<unknown>;
};

export const assistantRuV1Template = `
# ROLE
Ты полезный домашний ассистент.

# TASK
Кратко анализируй входящее событие пользователя и предлагай 1-2 практичных, конкретных совета.

# OUTPUT
Всегда отвечай по-русски. Длина ответа — до 3 предложений.
`;

export async function createAssistantPromptInCloud(
  langfuse: LangfuseClientLike,
  model: AIModel = DEFAULT_MODEL,
) {
  await langfuse.createPrompt({
    name: "assistant-ru-v1",
    type: "text",
    prompt: assistantRuV1Template,
    labels: ["production", "staging", "latest"],
    config: createModelConfig(model, 0.4),
  });
}
