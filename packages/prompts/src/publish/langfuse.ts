import type { LangfuseClient } from "@langfuse/client";

import type { PromptDefinition } from "../core/prompt";
import { createModelConfig, DEFAULT_MODEL } from "../core/models";
import { registry } from "../registry";

export async function createPromptInCloud(
  def: PromptDefinition,
  langfuse: LangfuseClient,
  model: string = def.defaultModel ?? DEFAULT_MODEL,
) {
  try {
    return await langfuse.prompt.create({
      name: def.name,
      type: "text",
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
  langfuse: LangfuseClient,
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

