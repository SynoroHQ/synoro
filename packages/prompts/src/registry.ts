import type { PromptDefinition } from "./core/prompt";
import base_agent_context from "./prompts/base-agent-context";
import base_agent_quality from "./prompts/base-agent-quality";
import event_analyzer_agent from "./prompts/event-analyzer-agent";
import event_processor_agent from "./prompts/event-processor-agent";
import general_assistant_agent from "./prompts/general-assistant-agent";
import router_agent from "./prompts/router-agent";
import smart_reminder_context_analysis from "./prompts/smart-reminder";
import { smart_reminder_extraction, smart_reminder_suggestions } from "./prompts/smart-reminder";

export const registry: Record<string, PromptDefinition> = {
  [base_agent_context.key]: base_agent_context,
  [base_agent_quality.key]: base_agent_quality,
  [event_analyzer_agent.key]: event_analyzer_agent,
  [event_processor_agent.key]: event_processor_agent,
  [general_assistant_agent.key]: general_assistant_agent,
  [router_agent.key]: router_agent,
  [smart_reminder_context_analysis.key]: smart_reminder_context_analysis,
  [smart_reminder_extraction.key]: smart_reminder_extraction,
  [smart_reminder_suggestions.key]: smart_reminder_suggestions,
};
