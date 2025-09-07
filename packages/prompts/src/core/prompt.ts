import type { AIModel } from "./models";

export type PromptMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type PromptDefinition = {
  key: string; // unique registry key, e.g. "assistant"
  name: string; // cloud-friendly name, e.g. "assistant"
  type: "text" | "chat" | string;
  prompt: string | PromptMessage[];
  labels?: string[];
  // optional defaults for publishing
  defaultModel?: AIModel;
  defaultTemperature?: number;
};

export const DEFAULT_PROMPT_KEY = "assistant" as const;

export function getPrompt(def: PromptDefinition): string {
  if (typeof def.prompt === "string") {
    return def.prompt;
  }
  // Для массива сообщений возвращаем содержимое первого сообщения
  return def.prompt[0]?.content ?? "";
}

export function compilePrompt(
  def: PromptDefinition,
  vars?: Record<string, string>,
): string {
  const promptText = getPrompt(def);
  if (!vars) return promptText;
  let output = promptText;
  for (const [k, v] of Object.entries(vars)) {
    // Экранируем специальные символы регулярных выражений
    const escapedKey = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}}`, "g");
    output = output.replace(rx, () => v);
  }
  return output;
}

export function getPromptSafeFromRegistry(
  registry: Record<string, PromptDefinition>,
  key?: string,
): string {
  const k = key ?? DEFAULT_PROMPT_KEY;
  const def = registry[k] ?? registry[DEFAULT_PROMPT_KEY];
  if (!def) return "";
  if (typeof def.prompt === "string") {
    return def.prompt;
  }
  return def.prompt[0]?.content ?? "";
}
