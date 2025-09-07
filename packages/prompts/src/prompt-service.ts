import type { LangfuseClientLike } from "./core/types";
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
 * @returns содержимое промпта
 */
export async function getPrompt(
  key: string,
  label: string = "latest",
): Promise<string> {
  // Сначала пытаемся получить из Langfuse
  if (globalLangfuseClient) {
    try {
      const def = registry[key];
      if (def) {
        const cloudPrompt = await globalLangfuseClient.getPrompt({
          name: def.name,
          label,
        });

        if (cloudPrompt?.prompt) {
          if (typeof cloudPrompt.prompt === "string") {
            return cloudPrompt.prompt;
          }
          return cloudPrompt.prompt[0]?.content ?? "";
        }
      }
    } catch (error) {
      console.warn(`Failed to get prompt '${key}' from Langfuse:`, error);
    }
  }

  // Fallback на локальный реестр
  const def = registry[key];
  if (!def) return "";

  if (typeof def.prompt === "string") {
    return def.prompt;
  }
  return def.prompt[0]?.content ?? "";
}
