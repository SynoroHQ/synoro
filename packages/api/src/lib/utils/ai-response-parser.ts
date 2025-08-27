import type { ZodSchema } from "zod";

/**
 * Утилиты для парсинга ответов от AI моделей
 */

/**
 * Парсит JSON ответ от AI, извлекая JSON из текста
 * @param text - Текст ответа от AI
 * @param fallbackValue - Значение по умолчанию, если парсинг не удался
 * @returns Распарсенный объект или fallbackValue
 */
export function parseAIJsonResponse<T = any>(
  text: string,
  fallbackValue?: T,
): T | null {
  try {
    // Ищем JSON в тексте (убираем лишний текст до и после)
    const jsonMatch = /\{[\s\S]*\}/.exec(text);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    } else {
      console.warn("No JSON found in AI response:", text);
      return fallbackValue ?? null;
    }
  } catch (parseError) {
    console.error("Failed to parse AI JSON response:", parseError);
    console.error("Raw response:", text);
    return fallbackValue ?? null;
  }
}

/**
 * Парсит JSON ответ от AI с валидацией через Zod схему
 * @param text - Текст ответа от AI
 * @param schema - Zod схема для валидации
 * @param fallbackValue - Значение по умолчанию, если парсинг не удался
 * @returns Результат валидации или fallbackValue
 */
export function parseAIJsonResponseWithSchema<T>(
  text: string,
  schema: ZodSchema<T>,
  fallbackValue?: T,
):
  | { success: true; data: T }
  | { success: false; error: string; data: T | null } {
  try {
    const parsedData = parseAIJsonResponse(text, fallbackValue);
    if (parsedData === null) {
      return {
        success: false,
        error: "Failed to parse JSON from AI response",
        data: fallbackValue ?? null,
      };
    }

    const validationResult = schema.safeParse(parsedData);
    if (validationResult.success) {
      return {
        success: true,
        data: validationResult.data,
      };
    } else {
      console.error("Schema validation failed:", validationResult.error);
      return {
        success: false,
        error: `Schema validation failed: ${validationResult.error.message}`,
        data: fallbackValue ?? null,
      };
    }
  } catch (error) {
    console.error("Error in AI response parsing with schema:", error);
    return {
      success: false,
      error: `Parsing error: ${error instanceof Error ? error.message : "Unknown error"}`,
      data: fallbackValue ?? null,
    };
  }
}

/**
 * Извлекает JSON строку из текста ответа AI
 * @param text - Текст ответа от AI
 * @returns JSON строка или null
 */
export function extractJsonString(text: string): string | null {
  const jsonMatch = /\{[\s\S]*\}/.exec(text);
  return jsonMatch ? jsonMatch[0] : null;
}

/**
 * Проверяет, содержит ли текст валидный JSON
 * @param text - Текст для проверки
 * @returns true если содержит валидный JSON
 */
export function containsValidJson(text: string): boolean {
  try {
    const jsonString = extractJsonString(text);
    if (!jsonString) return false;

    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}
