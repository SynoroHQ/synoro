/**
 * Утилиты для санитизации текста
 * Обеспечивают безопасное хранение пользовательского ввода
 */

/**
 * Санитизирует текст для безопасного хранения в базе данных
 * Удаляет потенциально опасные символы и обрезает до максимальной длины
 */
export function sanitizeText(text: string, maxLength: number = 10000): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Удаляем null bytes (могут вызвать проблемы в PostgreSQL)
  let sanitized = text.replace(/\0/g, "");

  // Удаляем управляющие символы (кроме переносов строк и табуляции)
  // \x00-\x08: NULL-BS
  // \x0B: вертикальная табуляция
  // \x0C: form feed
  // \x0E-\x1F: остальные управляющие символы
  // \x7F: DEL
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Обрезаем до максимальной длины
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  // Удаляем пробелы в начале и конце
  return sanitized.trim();
}

/**
 * Валидирует chatId на соответствие безопасному формату
 * Разрешены только буквы, цифры, дефисы и подчеркивания
 */
export function validateChatId(chatId: string): {
  valid: boolean;
  error?: string;
} {
  if (!chatId || typeof chatId !== "string") {
    return { valid: false, error: "ChatId is required" };
  }

  // Проверяем длину
  if (chatId.length > 100) {
    return { valid: false, error: "ChatId too long (max 100 characters)" };
  }

  if (chatId.length < 1) {
    return { valid: false, error: "ChatId too short (min 1 character)" };
  }

  // Проверяем формат (только буквы, цифры, дефисы, подчеркивания)
  if (!/^[a-zA-Z0-9_-]+$/.test(chatId)) {
    return {
      valid: false,
      error:
        "ChatId contains invalid characters (allowed: a-z, A-Z, 0-9, -, _)",
    };
  }

  return { valid: true };
}

/**
 * Валидирует source на соответствие разрешенным значениям
 */
export function validateSource(source: string): {
  valid: boolean;
  error?: string;
} {
  const allowedSources = [
    "telegram",
    "web",
    "mobile",
    "api",
    "event-processor-agent",
    "event-creation-agent",
  ];

  if (!source || typeof source !== "string") {
    return { valid: false, error: "Source is required" };
  }

  if (!allowedSources.includes(source)) {
    return {
      valid: false,
      error: `Invalid source. Allowed: ${allowedSources.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Санитизирует метаданные, удаляя потенциально опасные значения
 */
export function sanitizeMetadata(
  meta: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!meta || typeof meta !== "object") {
    return null;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(meta)) {
    // Пропускаем ключи с потенциально опасными именами
    if (key.startsWith("__") || key.includes("$")) {
      continue;
    }

    // Санитизируем строковые значения
    if (typeof value === "string") {
      sanitized[key] = sanitizeText(value, 1000);
    }
    // Разрешаем числа, булевы значения и null
    else if (
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      sanitized[key] = value;
    }
    // Рекурсивно обрабатываем вложенные объекты (максимум 1 уровень)
    else if (typeof value === "object" && !Array.isArray(value)) {
      const nested: Record<string, unknown> = {};
      for (const [nestedKey, nestedValue] of Object.entries(value as object)) {
        if (
          typeof nestedValue === "string" ||
          typeof nestedValue === "number" ||
          typeof nestedValue === "boolean" ||
          nestedValue === null
        ) {
          nested[nestedKey] = nestedValue;
        }
      }
      if (Object.keys(nested).length > 0) {
        sanitized[key] = nested;
      }
    }
    // Обрабатываем массивы примитивов
    else if (Array.isArray(value)) {
      const sanitizedArray = value
        .filter(
          (item) =>
            typeof item === "string" ||
            typeof item === "number" ||
            typeof item === "boolean",
        )
        .slice(0, 100); // Максимум 100 элементов
      if (sanitizedArray.length > 0) {
        sanitized[key] = sanitizedArray;
      }
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : null;
}
