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
  TELEGRAM_FORMATTER: "telegram-formatter",
  ROUTER_CLASSIFICATION: "router-classification",
  ROUTER_ROUTING: "router-routing",
  ROUTER_FALLBACK: "router-fallback",
  BASE_AGENT_CONTEXT: "base-agent-context",
  BASE_AGENT_QUALITY: "base-agent-quality",
} as const;

export type PromptKey = (typeof PROMPT_KEYS)[keyof typeof PROMPT_KEYS];
