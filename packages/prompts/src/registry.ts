import type { PromptDefinition } from "./core/prompt";
import assistant from "./prompts/assistant";
import chat_assistant from "./prompts/chat-assistant";
import classifier_combined from "./prompts/classifier.combined";
import data_analyst from "./prompts/data-analyst";
import event_processor from "./prompts/event-processor";
import financial_advisor from "./prompts/financial-advisor";
import message_classifier from "./prompts/message-classifier";
import parser_task from "./prompts/parser.task";
import qa_specialist from "./prompts/qa-specialist";
import task_manager from "./prompts/task-manager";
import task_orchestrator from "./prompts/task-orchestrator";
import telegram_formatter from "./prompts/telegram-formatter";

export const registry: Record<string, PromptDefinition> = {
  [assistant.key]: assistant,
  [chat_assistant.key]: chat_assistant,
  [classifier_combined.key]: classifier_combined,
  [data_analyst.key]: data_analyst,
  [event_processor.key]: event_processor,
  [financial_advisor.key]: financial_advisor,
  [message_classifier.key]: message_classifier,
  [parser_task.key]: parser_task,
  [qa_specialist.key]: qa_specialist,
  [task_manager.key]: task_manager,
  [task_orchestrator.key]: task_orchestrator,
  [telegram_formatter.key]: telegram_formatter,
};
