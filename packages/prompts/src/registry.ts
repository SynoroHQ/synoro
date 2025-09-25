import type { PromptDefinition } from "./core/prompt";
import agent_coordinator from "./prompts/agent-coordinator";
import base_agent_context from "./prompts/base-agent-context";
import base_agent_quality from "./prompts/base-agent-quality";
import event_analyzer_agent from "./prompts/event-analyzer-agent";
import event_creation_extraction from "./prompts/event-creation-extraction";
import event_processor_agent from "./prompts/event-processor-agent";
import general_assistant_agent from "./prompts/general-assistant-agent";
import prompt_validator from "./prompts/prompt-validator";
import router_agent from "./prompts/router-agent";

export const registry: Record<string, PromptDefinition> = {
  [agent_coordinator.key]: agent_coordinator,
  [base_agent_context.key]: base_agent_context,
  [base_agent_quality.key]: base_agent_quality,
  [event_analyzer_agent.key]: event_analyzer_agent,
  [event_creation_extraction.key]: event_creation_extraction,
  [event_processor_agent.key]: event_processor_agent,
  [general_assistant_agent.key]: general_assistant_agent,
  [prompt_validator.key]: prompt_validator,
  [router_agent.key]: router_agent,
};
