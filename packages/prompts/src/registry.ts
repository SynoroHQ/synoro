import type { PromptDefinition } from "./core/prompt";
import { assistantRuV1 } from "./prompts/assistant/ru/v1";

export const registry: Record<string, PromptDefinition> = {
  [assistantRuV1.key]: assistantRuV1,
};
