export const PROMPT_KEYS = {
  BASE_AGENT_CONTEXT: "base-agent-context",
  BASE_AGENT_QUALITY: "base-agent-quality",
  // Smart reminder agent prompts
  SMART_REMINDER_CONTEXT_ANALYSIS: "smart-reminder-context-analysis",
  SMART_REMINDER_EXTRACTION: "smart-reminder-extraction",
  SMART_REMINDER_SUGGESTIONS: "smart-reminder-suggestions",
  // Agent prompts
  EVENT_PROCESSOR_AGENT: "event-processor-agent",
  EVENT_ANALYZER_AGENT: "event-analyzer-agent",
  GENERAL_ASSISTANT_AGENT: "general-assistant-agent",
  ROUTER_AGENT: "router-agent",
} as const;

export type PromptKey = (typeof PROMPT_KEYS)[keyof typeof PROMPT_KEYS];
