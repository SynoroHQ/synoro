/**
 * Маппинг русских приоритетов в канонические английские значения
 * Используется для конвертации ответов AI в стандартизированные значения БД
 */

export type CanonicalPriority = "urgent" | "high" | "medium" | "low";

export type RussianPriority =
  | "срочно"
  | "немедленно"
  | "критично"
  | "важно"
  | "приоритетно"
  | "нужно сделать"
  | "обычно"
  | "стандартно"
  | "неспешно"
  | "когда будет время";

/**
 * Маппинг русских приоритетов в канонические английские значения
 */
const PRIORITY_MAPPING: Record<RussianPriority, CanonicalPriority> = {
  // Срочные приоритеты
  срочно: "urgent",
  немедленно: "urgent",
  критично: "urgent",

  // Высокие приоритеты
  важно: "high",
  приоритетно: "high",
  "нужно сделать": "high",

  // Обычные приоритеты
  обычно: "medium",
  стандартно: "medium",

  // Низкие приоритеты
  неспешно: "low",
  "когда будет время": "low",
};

/**
 * Конвертирует русский приоритет в канонический английский
 * @param russianPriority - русский приоритет
 * @returns канонический английский приоритет
 */
export function mapRussianPriorityToCanonical(
  russianPriority: string,
): CanonicalPriority {
  const normalizedPriority = russianPriority
    .toLowerCase()
    .trim() as RussianPriority;

  // Проверяем точное совпадение
  if (normalizedPriority in PRIORITY_MAPPING) {
    return PRIORITY_MAPPING[normalizedPriority];
  }

  // Fallback: пытаемся найти частичное совпадение (только если строка не пустая)
  if (normalizedPriority.length > 0) {
    const partialMatch = Object.keys(PRIORITY_MAPPING).find(
      (key) =>
        normalizedPriority.includes(key) || key.includes(normalizedPriority),
    );

    if (partialMatch) {
      return PRIORITY_MAPPING[partialMatch as RussianPriority];
    }
  }

  // Если ничего не найдено, возвращаем средний приоритет по умолчанию
  console.warn(
    `Unknown priority: "${russianPriority}", defaulting to "medium"`,
  );
  return "medium";
}

/**
 * Проверяет, является ли строка валидным русским приоритетом
 */
export function isRussianPriority(
  priority: string,
): priority is RussianPriority {
  return priority.toLowerCase().trim() in PRIORITY_MAPPING;
}

/**
 * Получает все доступные русские приоритеты для конкретного канонического
 */
export function getRussianPrioritiesForCanonical(
  canonical: CanonicalPriority,
): RussianPriority[] {
  return Object.entries(PRIORITY_MAPPING)
    .filter(([, value]) => value === canonical)
    .map(([key]) => key as RussianPriority);
}
