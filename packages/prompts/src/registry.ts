import type { PromptDefinition } from "./core/prompt";
import assistant from "./prompts/assistant";
import base_agent_context from "./prompts/base-agent-context";
import base_agent_quality from "./prompts/base-agent-quality";
import chat_assistant from "./prompts/chat-assistant";
import classifier_combined from "./prompts/classifier.combined";
import data_analyst from "./prompts/data-analyst";
import event_processor from "./prompts/event-processor";
import financial_advisor from "./prompts/financial-advisor";
import message_classifier from "./prompts/message-classifier";
import parser_task from "./prompts/parser.task";
import qa_specialist from "./prompts/qa-specialist";
import router_classification from "./prompts/router-classification";
import router_fallback from "./prompts/router-fallback";
import router_routing from "./prompts/router-routing";
import task_manager from "./prompts/task-manager";
import task_orchestrator from "./prompts/task-orchestrator";
import telegram_formatter from "./prompts/telegram-formatter";
import smart_reminder from "./prompts/smart-reminder";
import event_processor_smart from "./prompts/event-processor-smart";
import quality_evaluator_smart from "./prompts/quality-evaluator-smart";
import task_orchestrator_smart from "./prompts/task-orchestrator-smart";

export const registry: Record<string, PromptDefinition> = {
  [assistant.key]: assistant,
  [base_agent_context.key]: base_agent_context,
  [base_agent_quality.key]: base_agent_quality,
  [chat_assistant.key]: chat_assistant,
  [classifier_combined.key]: classifier_combined,
  [data_analyst.key]: data_analyst,
  [event_processor.key]: event_processor,
  [financial_advisor.key]: financial_advisor,
  [message_classifier.key]: message_classifier,
  [parser_task.key]: parser_task,
  [qa_specialist.key]: qa_specialist,
  [router_classification.key]: router_classification,
  [router_fallback.key]: router_fallback,
  [router_routing.key]: router_routing,
  [task_manager.key]: task_manager,
  [task_orchestrator.key]: task_orchestrator,
  [telegram_formatter.key]: telegram_formatter,
  // Smart reminder prompts
  [smart_reminder.contextAnalysis.key]: smart_reminder.contextAnalysis,
  [smart_reminder.extraction.key]: smart_reminder.extraction,
  [smart_reminder.suggestions.key]: smart_reminder.suggestions,
  // Event processor smart prompts
  [event_processor_smart.typeAnalysis.key]: event_processor_smart.typeAnalysis,
  [event_processor_smart.extraction.key]: event_processor_smart.extraction,
  // Quality evaluator smart prompts
  [quality_evaluator_smart.assessment.key]: quality_evaluator_smart.assessment,
  [quality_evaluator_smart.improvement.key]: quality_evaluator_smart.improvement,
  // Task orchestrator smart prompts
  [task_orchestrator_smart.complexityAnalysis.key]: task_orchestrator_smart.complexityAnalysis,
  [task_orchestrator_smart.qualityEvaluation.key]: task_orchestrator_smart.qualityEvaluation,
  [task_orchestrator_smart.summary.key]: task_orchestrator_smart.summary,
};
