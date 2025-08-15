import type { AIModel } from "./models";

export type PromptDefinition = {
  key: string; // unique registry key, e.g. "assistant/ru/v1"
  name: string; // cloud-friendly name, e.g. "assistant-ru-v1"
  type: "text" | string;
  prompt: string;
  labels?: string[];
  // optional defaults for publishing
  defaultModel?: AIModel;
  defaultTemperature?: number;
};

export const DEFAULT_PROMPT_KEY = "assistant/ru/v1" as const;

export function getPrompt(def: PromptDefinition): string {
  return def.prompt;
}

export function getPromptSafeFromRegistry(
  registry: Record<string, PromptDefinition>,
  key?: string,
): string {
  const k = key ?? DEFAULT_PROMPT_KEY;
  const def = registry[k] ?? registry[DEFAULT_PROMPT_KEY];
  return def?.prompt ?? "";
}
