import type { PromptDefinition } from "./core/prompt";
import assistant from "./prompts/assistant";
import base_agent_context from "./prompts/base-agent-context";
import base_agent_quality from "./prompts/base-agent-quality";
import chat_assistant from "./prompts/chat-assistant";
import classifier_combined from "./prompts/classifier.combined";
import data_analyst from "./prompts/data-analyst";
import event_processor_smart from "./prompts/event-processor-smart";
import event_processor from "./prompts/event-processor";
import financial_advisor from "./prompts/financial-advisor";
import message_classifier from "./prompts/message-classifier";
import parser_task from "./prompts/parser.task";
import qa_specialist from "./prompts/qa-specialist";
import quality_evaluator_smart from "./prompts/quality-evaluator-smart";
import router_classification from "./prompts/router-classification";
import router_fallback from "./prompts/router-fallback";
import router_routing from "./prompts/router-routing";
import smart_reminder from "./prompts/smart-reminder";
import task_manager from "./prompts/task-manager";
import task_orchestrator_smart from "./prompts/task-orchestrator-smart";
import task_orchestrator from "./prompts/task-orchestrator";
import telegram_formatter from "./prompts/telegram-formatter";

export const registry: Record<string, PromptDefinition> = {
  [assistant.key]: assistant,
  [base_agent_context.key]: base_agent_context,
  [base_agent_quality.key]: base_agent_quality,
  [chat_assistant.key]: chat_assistant,
  [classifier_combined.key]: classifier_combined,
  [data_analyst.key]: data_analyst,
  [event_processor_smart.key]: event_processor_smart,
  [event_processor.key]: event_processor,
  [financial_advisor.key]: financial_advisor,
  [message_classifier.key]: message_classifier,
  [parser_task.key]: parser_task,
  [qa_specialist.key]: qa_specialist,
  [quality_evaluator_smart.key]: quality_evaluator_smart,
  [router_classification.key]: router_classification,
  [router_fallback.key]: router_fallback,
  [router_routing.key]: router_routing,
  [smart_reminder.key]: smart_reminder,
  [task_manager.key]: task_manager,
  [task_orchestrator_smart.key]: task_orchestrator_smart,
  [task_orchestrator.key]: task_orchestrator,
  [telegram_formatter.key]: telegram_formatter,
};
