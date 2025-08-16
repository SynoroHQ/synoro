import type { PromptDefinition } from "../../../core/prompt";

export const assistantRuV1Template = `
# ROLE
Ты полезный домашний ассистент.

# TASK
Кратко анализируй входящее событие пользователя и предлагай 1-2 практичных, конкретных совета.

# OUTPUT
Всегда отвечай по-русски. Длина ответа — до 3 предложений.
`;

export const assistantRuV1: PromptDefinition = {
  key: "assistant/ru/v1",
  name: "assistant-ru-v1",
  type: "text",
  prompt: assistantRuV1Template,
  labels: ["production", "staging", "latest"],
  defaultModel: "gpt-4o-mini",
  defaultTemperature: 0.4,
};
