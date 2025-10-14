import { LangfuseClient } from "@langfuse/client";

import { registry } from "./registry";

// Глобальный клиент Langfuse
let globalLangfuseClient: LangfuseClient | null = null;

/**
 * Инициализирует глобальный клиент Langfuse
 * @param client - клиент Langfuse
 */
export function initializePromptService(client: LangfuseClient): void {
  globalLangfuseClient = client;
}

/**
 * Получает промпт из Langfuse
 * @param key - ключ промпта
 * @param label - метка для получения из Langfuse (по умолчанию "latest")
 * @param variables - переменные для компиляции промпта
 * @returns содержимое промпта
 */
export async function getPrompt(
  key: string,
  label: string = "latest",
  variables?: Record<string, string>,
): Promise<string> {
  if (!globalLangfuseClient) {
    throw new Error("Langfuse client not initialized");
  }

  try {
    const def = registry[key];
    if (!def) {
      throw new Error(`Prompt definition not found for key: ${key}`);
    }

    const cloudPrompt = await globalLangfuseClient.prompt.get(def.name, {
      label,
      type: "text",
    });

    if (!cloudPrompt) {
      throw new Error(`Prompt '${key}' not found in Langfuse`);
    }

    // Если USE_PROMPT_CONTEXT_SERVICE включен, НЕ используем compile
    // Вместо этого возвращаем промпт с плейсхолдерами для обработки в PromptContextService
    const usePromptContextService =
      process.env.USE_PROMPT_CONTEXT_SERVICE === "true";

    if (
      typeof cloudPrompt === "object" &&
      "compile" in cloudPrompt &&
      typeof cloudPrompt.compile === "function"
    ) {
      // Если переменные переданы И PromptContextService выключен, используем compile
      if (
        variables &&
        Object.keys(variables).length > 0 &&
        !usePromptContextService
      ) {
        const compiled = cloudPrompt.compile(variables);
        return compiled;
      }
      // Иначе возвращаем промпт с плейсхолдерами
      if ("prompt" in cloudPrompt) {
        return cloudPrompt.prompt;
      }
    }

    throw new Error(`Invalid prompt format for '${key}'`);
  } catch (error) {
    console.error(`Failed to get prompt '${key}' from Langfuse:`, error);
    throw error;
  }
}

/**
 * Получает полный объект промпта из Langfuse
 * @param key - ключ промпта
 * @param label - метка для получения из Langfuse (по умолчанию "latest")
 * @returns объект промпта напрямую из Langfuse
 */
export async function getPromptObject(
  key: string,
  label: string = "latest",
): Promise<any> {
  if (!globalLangfuseClient) return null;

  try {
    const def = registry[key];
    if (!def) return null;

    return await globalLangfuseClient.prompt.get(def.name, {
      label,
      type: "text",
    });
  } catch (error) {
    console.warn(`Failed to get prompt object '${key}' from Langfuse:`, error);
    return null;
  }
}

/**
 * Создает промпт в Langfuse
 * @param key - ключ промпта из реестра
 * @param labels - метки для промпта (по умолчанию ["production"])
 * @returns созданный промпт напрямую из Langfuse
 */
export async function createPrompt(
  key: string,
  labels: string[] = ["production"],
): Promise<any> {
  if (!globalLangfuseClient) {
    console.warn("Langfuse client not initialized");
    return null;
  }

  const def = registry[key];
  if (!def) {
    console.warn(`Prompt definition not found for key: ${key}`);
    return null;
  }

  try {
    return await globalLangfuseClient.prompt.create({
      name: def.name,
      type: "text",
      prompt: def.prompt,
      labels,
      config: {
        model: def.defaultModel,
      },
    });
  } catch (error) {
    console.error(`Failed to create prompt '${key}' in Langfuse:`, error);
    return null;
  }
}
