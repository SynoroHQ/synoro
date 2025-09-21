/**
 * Модуль для безопасного маппинга приоритетов
 * Поддерживает как русские, так и английские приоритеты
 */

// Канонические приоритеты (стандартные значения)
export type CanonicalPriority = "low" | "medium" | "high" | "urgent";

// Маппинг приоритетов с поддержкой русского и английского языков
const PRIORITY_MAPPING: Record<string, CanonicalPriority> = {
  // Русские приоритеты
  низкий: "low",
  низкая: "low",
  низкое: "low",
  неспешно: "low",
  "не спешит": "low",
  обычно: "medium",
  обычный: "medium",
  обычная: "medium",
  обычное: "medium",
  средний: "medium",
  средняя: "medium",
  среднее: "medium",
  важно: "high",
  важный: "high",
  важная: "high",
  важное: "high",
  высокий: "high",
  высокая: "high",
  высокое: "high",
  приоритетно: "high",
  срочно: "urgent",
  срочный: "urgent",
  срочная: "urgent",
  срочное: "urgent",
  немедленно: "urgent",
  критично: "urgent",
  критический: "urgent",
  критическая: "urgent",
  критическое: "urgent",

  // Английские приоритеты
  low: "low",
  medium: "medium",
  high: "high",
  urgent: "urgent",
};

/**
 * Безопасно преобразует строковый приоритет в канонический формат
 * @param priority - строка приоритета (на русском или английском)
 * @returns канонический приоритет или "medium" по умолчанию
 */
export function mapPriority(priority: string): CanonicalPriority {
  // Нормализуем входную строку
  const normalizedPriority = priority.toLowerCase().trim();

  // Безопасно ищем в маппинге
  const mappedPriority = PRIORITY_MAPPING[normalizedPriority];

  // Возвращаем найденный приоритет или средний по умолчанию
  return mappedPriority !== undefined ? mappedPriority : "medium";
}

/**
 * Проверяет, является ли строка валидным приоритетом
 * @param priority - строка для проверки
 * @returns true если приоритет найден в маппинге
 */
export function isValidPriority(priority: string): boolean {
  const normalizedPriority = priority.toLowerCase().trim();
  return PRIORITY_MAPPING[normalizedPriority] !== undefined;
}

/**
 * Получает все доступные варианты приоритетов
 * @returns массив всех доступных строковых представлений приоритетов
 */
export function getAvailablePriorities(): string[] {
  return Object.keys(PRIORITY_MAPPING);
}

/**
 * Получает русские названия для канонических приоритетов
 */
export const CANONICAL_TO_RUSSIAN: Record<CanonicalPriority, string> = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  urgent: "срочный",
};

/**
 * Получает английские названия для канонических приоритетов
 */
export const CANONICAL_TO_ENGLISH: Record<CanonicalPriority, string> = {
  low: "low",
  medium: "medium",
  high: "high",
  urgent: "urgent",
};
