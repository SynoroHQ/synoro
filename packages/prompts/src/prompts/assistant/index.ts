import type { PromptDefinition } from "../../core/prompt";

export const assistantTemplate = `
# ROLE
Ты полезный домашний ассистент.

# TASK
Кратко анализируй входящее событие пользователя и предлагай 1-2 практичных, конкретных совета.

# OUTPUT
Всегда отвечай по-русски. Длина ответа — до 3 предложений.
`;

export const assistant: PromptDefinition = {
  key: "assistant",
  name: "assistant",
  type: "text",
  prompt: assistantTemplate,
  labels: ["production", "staging", "latest"],
  defaultModel: "gpt-4o-mini",
  defaultTemperature: 0.4,
};
