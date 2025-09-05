import { DEFAULT_PROMPT_KEY } from "./core/prompt";
import { registry } from "./registry";

export { registry };
export { DEFAULT_PROMPT_KEY };
export * from "./keys";
export * from "./core/models";
export * from "./core/types";
export type { PromptDefinition } from "./core/prompt";
export { getPromptSafeFromRegistry } from "./core/prompt";
export * from "./publish/langfuse";
export { default as assistant } from "./prompts/assistant";
export { default as eventProcessor } from "./prompts/event-processor";
export { default as qaSpecialist } from "./prompts/qa-specialist";
export { default as taskOrchestrator } from "./prompts/task-orchestrator";
export { default as dataAnalyst } from "./prompts/data-analyst";
export { default as financialAdvisor } from "./prompts/financial-advisor";
export { default as taskManager } from "./prompts/task-manager";
export { default as chatAssistant } from "./prompts/chat-assistant";
export { default as telegramFormatter } from "./prompts/telegram-formatter";
export { default as routerClassification } from "./prompts/router-classification";
export { default as routerRouting } from "./prompts/router-routing";
export { default as routerFallback } from "./prompts/router-fallback";
export { default as baseAgentContext } from "./prompts/base-agent-context";
export { default as baseAgentQuality } from "./prompts/base-agent-quality";

export function getPrompt(key: string): string {
  return registry[key]?.prompt ?? "";
}

export function getPromptSafe(key?: string): string {
  const k = key ?? DEFAULT_PROMPT_KEY;
  return registry[k]?.prompt ?? registry[DEFAULT_PROMPT_KEY]?.prompt ?? "";
}
