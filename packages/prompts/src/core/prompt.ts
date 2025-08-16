import type { AIModel } from "./models";

export type PromptDefinition = {
  key: string; // unique registry key, e.g. "assistant"
  name: string; // cloud-friendly name, e.g. "assistant"
  type: "text" | string;
  prompt: string;
  labels?: string[];
  // optional defaults for publishing
  defaultModel?: AIModel;
  defaultTemperature?: number;
};

export const DEFAULT_PROMPT_KEY = "assistant" as const;

export function getPrompt(def: PromptDefinition): string {
  return def.prompt;
}

export function compilePrompt(
  def: PromptDefinition,
  vars?: Record<string, string>,
): string {
  if (!vars) return def.prompt;
  let output = def.prompt;
  for (const [k, v] of Object.entries(vars)) {
    // Экранируем специальные символы регулярных выражений
    const escapedKey = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}}`, "g");
    output = output.replace(rx, v);
  }
  return output;
}

export function getPromptSafeFromRegistry(
  registry: Record<string, PromptDefinition>,
  key?: string,
): string {
  const k = key ?? DEFAULT_PROMPT_KEY;
  const def = registry[k] ?? registry[DEFAULT_PROMPT_KEY];
  return def?.prompt ?? "";
}
