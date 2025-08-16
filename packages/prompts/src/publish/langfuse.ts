import type { LangfuseClientLike } from "../core/types";
import { createModelConfig, DEFAULT_MODEL } from "../core/models";
import { assistantRuV1 } from "../prompts/assistant/ru/v1";

export async function createAssistantPromptInCloud(
  langfuse: LangfuseClientLike,
  model: string = DEFAULT_MODEL,
) {
  try {
    const result = await langfuse.createPrompt({
      name: assistantRuV1.name,
      type: assistantRuV1.type,
      prompt: assistantRuV1.prompt,
      labels: assistantRuV1.labels,
      config: createModelConfig(model, assistantRuV1.defaultTemperature ?? 0.4),
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to create assistant prompt in Langfuse: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
