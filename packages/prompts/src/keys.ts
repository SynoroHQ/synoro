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
  // Smart reminder agent prompts
  SMART_REMINDER_CONTEXT_ANALYSIS: "smart-reminder-context-analysis",
  SMART_REMINDER_EXTRACTION: "smart-reminder-extraction",
  SMART_REMINDER_SUGGESTIONS: "smart-reminder-suggestions",
  // Event processor smart prompts
  EVENT_PROCESSOR_TYPE_ANALYSIS: "event-processor-type-analysis",
  EVENT_PROCESSOR_EXTRACTION: "event-processor-extraction",
  // Quality evaluator smart prompts
  QUALITY_EVALUATOR_ASSESSMENT: "quality-evaluator-assessment",
  QUALITY_EVALUATOR_IMPROVEMENT: "quality-evaluator-improvement",
  // Task orchestrator smart prompts
  TASK_ORCHESTRATOR_COMPLEXITY_ANALYSIS: "task-orchestrator-complexity-analysis",
  TASK_ORCHESTRATOR_QUALITY_EVALUATION: "task-orchestrator-quality-evaluation",
  TASK_ORCHESTRATOR_SUMMARY: "task-orchestrator-summary",
} as const;

export type PromptKey = (typeof PROMPT_KEYS)[keyof typeof PROMPT_KEYS];
