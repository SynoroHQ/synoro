import type { AIModel } from "./models";
import { createModelConfig, DEFAULT_MODEL } from "./models";
import type { LangfuseClientLike } from "./core/types";
export type { LangfuseClientLike } from "./core/types";

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
  try {
    const result = await langfuse.createPrompt({
      name: "assistant-ru-v1",
      type: "text",
      prompt: assistantRuV1Template,
      labels: ["production", "staging", "latest"],
      config: createModelConfig(model, 0.4),
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to create assistant prompt in cloud: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
