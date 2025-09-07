import type { LangfuseClientLike, PromptMessage } from "./core/types";
import { compilePrompt } from "./core/prompt";
import { registry } from "./registry";

// Глобальный клиент Langfuse
let globalLangfuseClient: LangfuseClientLike | null = null;

/**
 * Инициализирует глобальный клиент Langfuse
 * @param client - клиент Langfuse
 */
export function initializePromptService(client: LangfuseClientLike): void {
  globalLangfuseClient = client;
}

/**
 * Получает промпт из Langfuse с fallback на локальный реестр
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
  // Сначала пытаемся получить из Langfuse
  if (globalLangfuseClient) {
    try {
      const def = registry[key];
      if (def) {
        const cloudPrompt = await globalLangfuseClient.prompt.get(def.name, {
          label,
          type: def.type as "text" | "chat",
        });

        if (cloudPrompt) {
          // Используем метод compile если доступен
          if (
            typeof cloudPrompt === "object" &&
            "compile" in cloudPrompt &&
            typeof cloudPrompt.compile === "function"
          ) {
            if (variables && Object.keys(variables).length > 0) {
              const compiled = cloudPrompt.compile(variables);
              if (typeof compiled === "string") {
                return compiled;
              } else if (Array.isArray(compiled)) {
                return compiled[0]?.content ?? "";
              }
            }
            // Если нет переменных, используем базовый промпт
            if ("prompt" in cloudPrompt) {
              if (typeof cloudPrompt.prompt === "string") {
                return cloudPrompt.prompt;
              } else if (Array.isArray(cloudPrompt.prompt)) {
                return cloudPrompt.prompt[0]?.content ?? "";
              }
            }
          }

          // Fallback: если нет метода compile, используем стандартную обработку
          if (typeof cloudPrompt === "string") {
            return cloudPrompt;
          } else if (Array.isArray(cloudPrompt)) {
            return cloudPrompt[0]?.content ?? "";
          } else if (
            cloudPrompt &&
            typeof cloudPrompt === "object" &&
            "prompt" in cloudPrompt
          ) {
            if (typeof cloudPrompt.prompt === "string") {
              return cloudPrompt.prompt;
            } else if (Array.isArray(cloudPrompt.prompt)) {
              return cloudPrompt.prompt[0]?.content ?? "";
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to get prompt '${key}' from Langfuse:`, error);
    }
  }

  // Fallback на локальный реестр
  const def = registry[key];
  if (!def) return "";

  let promptContent: string;
  if (typeof def.prompt === "string") {
    promptContent = def.prompt;
  } else {
    promptContent = def.prompt[0]?.content ?? "";
  }

  // Компилируем промпт с переменными если они предоставлены
  if (variables && Object.keys(variables).length > 0) {
    return compilePrompt({ ...def, prompt: promptContent }, variables);
  }

  return promptContent;
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
      type: def.type as "text" | "chat",
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
      type: def.type as "text" | "chat",
      prompt: def.prompt,
      labels,
      config: {
        model: def.defaultModel,
        temperature: def.defaultTemperature,
      },
    });
  } catch (error) {
    console.error(`Failed to create prompt '${key}' in Langfuse:`, error);
    return null;
  }
}
