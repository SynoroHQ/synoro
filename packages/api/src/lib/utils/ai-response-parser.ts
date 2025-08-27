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
export function parseAIJsonResponse<T = unknown>(
  text: string,
  fallbackValue?: T,
): T | null {
  try {
    const debug = process.env.DEBUG_AI_PARSER === "true";
    // Сначала пытаемся вынуть содержимое из ограждённого блока ```json ... ```
    // Если не найдено — ищем первый объект или массив (неголодный матч)
    const candidate = extractJsonString(text);
    if (candidate) {
      return JSON.parse(candidate) as T;
    } else {
      if (debug) {
        const truncated = text.length > 500 ? text.slice(0, 500) + "…" : text;
        console.warn("No JSON found in AI response (truncated):", truncated);
      }
      return fallbackValue ?? null;
    }
  } catch (parseError) {
    const debug = process.env.DEBUG_AI_PARSER === "true";
    if (debug) {
      console.error("Failed to parse AI JSON response:", parseError);
      const truncated = text.length > 500 ? text.slice(0, 500) + "…" : text;
      console.error("Raw response (truncated):", truncated);
    }
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
  // Предпочитаем ограждённые блоки кода: ```json ... ``` или просто ``` ... ```
  const fenced = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(text);
  const fencedContent = fenced?.[1]?.trim();
  if (fencedContent) return fencedContent;

  // Фолбэк: первый небезграничный матч объекта или массива
  const match = /(\{[\s\S]*?\}|\[[\s\S]*?\])/.exec(text);
  return match ? match[0] : null;
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
