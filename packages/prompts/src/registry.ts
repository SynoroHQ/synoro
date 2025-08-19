import type { PromptDefinition } from "./core/prompt";
import assistant from "./prompts/assistant";
import classifier_message_type from "./prompts/classifier.message-type";
import classifier_relevance from "./prompts/classifier.relevance";
import parser_task from "./prompts/parser.task";

export const registry: Record<string, PromptDefinition> = {
  [assistant.key]: assistant,
  [classifier_message_type.key]: classifier_message_type,
  [classifier_relevance.key]: classifier_relevance,
  [parser_task.key]: parser_task,
};
