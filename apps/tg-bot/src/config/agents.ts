/**
 * Конфигурация агентов по умолчанию
 */
export const DEFAULT_AGENT_OPTIONS = {
  useQualityControl: true,
  maxQualityIterations: 2,
  targetQuality: 0.8,
} as const;

/**
 * Тип для настроек агентов
 */
export type AgentOptions = typeof DEFAULT_AGENT_OPTIONS;
