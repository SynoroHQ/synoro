import type { PromptDefinition } from "./core/prompt";
import assistant from "./prompts/assistant";
import messageClassifier from "./prompts/message-classifier";
import parser_task from "./prompts/parser.task";

export const registry: Record<string, PromptDefinition> = {
  [assistant.key]: assistant,
  [messageClassifier.key]: messageClassifier,
  [parser_task.key]: parser_task,
};
