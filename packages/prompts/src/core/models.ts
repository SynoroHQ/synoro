export type AIModel = string;

export type ModelConfig = {
  model: AIModel;
  temperature?: number;
};

export const DEFAULT_MODEL: AIModel = "gpt-5-mini";

export function createModelConfig(
  model: AIModel = DEFAULT_MODEL,
  temperature = 0.4,
): ModelConfig {
  return { model, temperature };
}
