import type { PromptDefinition } from "./core/prompt";
import assistant from "./prompts/assistant";
import classifier_combined from "./prompts/classifier.combined";
import message_classifier from "./prompts/message-classifier";
import parser_task from "./prompts/parser.task";

export const registry: Record<string, PromptDefinition> = {
  [assistant.key]: assistant,
  [classifier_combined.key]: classifier_combined,
  [message_classifier.key]: message_classifier,
  [parser_task.key]: parser_task,
};
