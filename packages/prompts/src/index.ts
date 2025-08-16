import { registry } from "./registry";
import { DEFAULT_PROMPT_KEY } from "./core/prompt";

export { registry };
export { DEFAULT_PROMPT_KEY };
export * from "./core/models";
export * from "./core/types";
export type { PromptDefinition } from "./core/prompt";
export { getPromptSafeFromRegistry } from "./core/prompt";
export * from "./publish/langfuse";
export { assistantRuV1 } from "./prompts/assistant/ru/v1";

// Back-compat convenience map of key->string prompt
export const prompts: Record<string, string> = Object.fromEntries(
  Object.entries(registry).map(([k, def]) => [k, def.prompt]),
);

export function getPrompt(key: string): string {
  return registry[key]?.prompt ?? "";
}

export function getPromptSafe(key?: string): string {
  const k = key ?? DEFAULT_PROMPT_KEY;
  return registry[k]?.prompt ?? registry[DEFAULT_PROMPT_KEY]?.prompt ?? "";
}
