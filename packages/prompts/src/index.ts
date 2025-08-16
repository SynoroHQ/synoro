import { DEFAULT_PROMPT_KEY } from "./core/prompt";
import { registry } from "./registry";

export { registry };
export { DEFAULT_PROMPT_KEY };
export * from "./core/models";
export * from "./core/types";
export type { PromptDefinition } from "./core/prompt";
export { getPromptSafeFromRegistry } from "./core/prompt";
export * from "./publish/langfuse";
export { assistant } from "./prompts/assistant";

export function getPrompt(key: string): string {
  return registry[key]?.prompt ?? "";
}

export function getPromptSafe(key?: string): string {
  const k = key ?? DEFAULT_PROMPT_KEY;
  return registry[k]?.prompt ?? registry[DEFAULT_PROMPT_KEY]?.prompt ?? "";
}
