import type { PromptDefinition } from "./core/prompt";
import { assistant } from "./prompts/assistant";

export const registry: Record<string, PromptDefinition> = {
  [assistant.key]: assistant,
};
