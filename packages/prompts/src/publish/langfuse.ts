import type { PromptDefinition } from "../core/prompt";
import type { LangfuseClientLike } from "../core/types";
import { createModelConfig, DEFAULT_MODEL } from "../core/models";
import assistant from "../prompts/assistant";
import { registry } from "../registry";

export async function createPromptInCloud(
  def: PromptDefinition,
  langfuse: LangfuseClientLike,
  model: string = def.defaultModel ?? DEFAULT_MODEL,
) {
  try {
    return await langfuse.prompt.create({
      name: def.name,
      type: def.type as "text" | "chat",
      prompt: def.prompt,
      labels: def.labels,
      config: createModelConfig(model, 0.4),
    });
  } catch (error) {
    throw new Error(
      `Failed to create prompt '${def.key}' in Langfuse: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function createPromptByKeyInCloud(
  key: string,
  langfuse: LangfuseClientLike,
  model?: string,
) {
  const def = registry[key];
  if (!def) {
    throw new Error(`Prompt with key '${key}' not found in registry`);
  }
  return createPromptInCloud(
    def,
    langfuse,
    model ?? def.defaultModel ?? DEFAULT_MODEL,
  );
}

export async function createAssistantPromptInCloud(
  langfuse: LangfuseClientLike,
  model: string = assistant.defaultModel ?? DEFAULT_MODEL,
) {
  return createPromptInCloud(assistant, langfuse, model);
}
