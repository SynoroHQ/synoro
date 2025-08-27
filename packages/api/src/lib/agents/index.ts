import { AgentManager } from "./agent-manager";

// Экспорт всех типов
export type * from "./types";

// Экспорт схем
export * from "./schemas";

// Экспорт базового класса агента
export { AbstractAgent } from "./base-agent";

// Экспорт всех агентов
export { RouterAgent } from "./router-agent";
export { QASpecialistAgent } from "./qa-specialist-agent";
export { EventProcessorAgent } from "./event-processor-agent";
export { TaskOrchestratorAgent } from "./task-orchestrator-agent";
export { QualityEvaluatorAgent } from "./quality-evaluator-agent";
export { GeneralAssistantAgent } from "./general-assistant-agent";
export { TaskManagerAgent } from "./task-manager-agent";
export { DataAnalystAgent } from "./data-analyst-agent";
export { FinancialAdvisorAgent } from "./financial-advisor-agent";
export { ChatAssistantAgent } from "./chat-assistant-agent";

// Экспорт менеджера агентов
export { AgentManager } from "./agent-manager";

// Удобная функция для создания и использования агентной системы
export function createAgentSystem() {
  return new AgentManager();
}
