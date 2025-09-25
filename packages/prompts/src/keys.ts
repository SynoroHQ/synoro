export const PROMPT_KEYS = {
  // Base system prompts
  BASE_AGENT_CONTEXT: "base-agent-context",
  BASE_AGENT_QUALITY: "base-agent-quality",

  // Core agent prompts
  EVENT_PROCESSOR_AGENT: "event-processor-agent",
  EVENT_ANALYZER_AGENT: "event-analyzer-agent",
  GENERAL_ASSISTANT_AGENT: "general-assistant-agent",
  ROUTER_AGENT: "router-agent",

  // Advanced architecture prompts
  AGENT_COORDINATOR: "agent-coordinator",
  PROMPT_VALIDATOR: "prompt-validator",

  // Event processing prompts
  EVENT_CREATION_EXTRACTION: "event-creation-extraction",

  // Legacy smart reminder prompts (for backward compatibility)
  SMART_REMINDER_CONTEXT_ANALYSIS: "smart-reminder-context-analysis",
  SMART_REMINDER_EXTRACTION: "smart-reminder-extraction",
  SMART_REMINDER_SUGGESTIONS: "smart-reminder-suggestions",
} as const;

export type PromptKey = (typeof PROMPT_KEYS)[keyof typeof PROMPT_KEYS];
