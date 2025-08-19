export const PROMPT_KEYS = {
  ASSISTANT: "assistant",
  CLASSIFIER_RELEVANCE: "classifier.relevance",
  CLASSIFIER_MESSAGE_TYPE: "classifier.message-type",
  PARSER_TASK: "parser.task",
} as const;

export type PromptKey = (typeof PROMPT_KEYS)[keyof typeof PROMPT_KEYS];
