export const PROMPT_KEYS = {
  ASSISTANT: "assistant",
  MESSAGE_CLASSIFIER: "message-classifier",
  PARSER_TASK: "parser.task",
  EVENT_PROCESSOR: "event-processor",
  QA_SPECIALIST: "qa-specialist",
  TASK_ORCHESTRATOR: "task-orchestrator",
  DATA_ANALYST: "data-analyst",
  FINANCIAL_ADVISOR: "financial-advisor",
  TASK_MANAGER: "task-manager",
  CHAT_ASSISTANT: "chat-assistant",
} as const;

export type PromptKey = (typeof PROMPT_KEYS)[keyof typeof PROMPT_KEYS];
