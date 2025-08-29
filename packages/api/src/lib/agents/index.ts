
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
export { TelegramFormatterAgent } from "./telegram-formatter-agent";

// Экспорт менеджера агентов с улучшениями
export { AgentManager } from "./agent-manager";

// Экспорт улучшенных функций создания агентной системы
export { 
  createAgentSystem, 
  createHighPerformanceAgentSystem 
} from "./agent-manager";

// Простая функция создания агентной системы для обратной совместимости
export function createSimpleAgentSystem() {
  const { createAgentSystem } = require("./agent-manager");
  return createAgentSystem();
}

// Дополнительные утилиты для работы с агентами
export const AgentUtils = {
  /**
   * Создание оптимизированной конфигурации для высокой нагрузки
   */
  createHighLoadConfig: () => ({
    enableCache: true,
    enableParallelProcessing: true,
    maxCacheSize: 5000,
    cacheTimeout: 30 * 60 * 1000, // 30 минут
    maxConcurrentTasks: 10,
  }),
  
  /**
   * Создание конфигурации для экономии ресурсов
   */
  createLowResourceConfig: () => ({
    enableCache: false,
    enableParallelProcessing: false,
    maxCacheSize: 100,
    cacheTimeout: 5 * 60 * 1000, // 5 минут
    maxConcurrentTasks: 1,
  }),
  
  /**
   * Создание сбалансированной конфигурации (по умолчанию)
   */
  createBalancedConfig: () => ({
    enableCache: true,
    enableParallelProcessing: true,
    maxCacheSize: 1000,
    cacheTimeout: 15 * 60 * 1000, // 15 минут
    maxConcurrentTasks: 3,
  }),
};
