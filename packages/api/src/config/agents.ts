/**
 * Тип для настроек агентов
 */
export type AgentOptions = {
  useQualityControl: boolean;
  maxQualityIterations: number;
  targetQuality: number;
};

/**
 * Конфигурация агентов по умолчанию
 */
export const DEFAULT_AGENT_OPTIONS = {
  useQualityControl: true,
  maxQualityIterations: 2,
  targetQuality: 0.8,
} satisfies AgentOptions;
