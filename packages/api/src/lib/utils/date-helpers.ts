/**
 * Утилиты для безопасной работы с датами
 */

/**
 * Безопасно парсит дату из различных форматов
 * Возвращает fallback дату если парсинг не удался
 */
export function safeParseDate(
  value: string | number | Date | null | undefined,
  fallback: Date = new Date(),
): Date {
  // Если значение уже Date и валидно
  if (value instanceof Date) {
    if (isValidDate(value)) {
      return value;
    }
    console.warn(`Invalid Date object, using fallback`);
    return fallback;
  }

  // Если значение null или undefined
  if (value === null || value === undefined) {
    return fallback;
  }

  try {
    const parsed = new Date(value);

    if (!isValidDate(parsed)) {
      console.warn(`Invalid date: ${value}, using fallback`);
      return fallback;
    }

    // Проверяем разумные границы (не раньше 1970 и не позже 2100)
    const year = parsed.getFullYear();
    if (year < 1970 || year > 2100) {
      console.warn(`Date out of reasonable range: ${value}, using fallback`);
      return fallback;
    }

    return parsed;
  } catch (error) {
    console.warn(`Failed to parse date: ${value}, using fallback`, error);
    return fallback;
  }
}

/**
 * Проверяет, является ли дата валидной
 */
export function isValidDate(date: Date): boolean {
  return (
    date instanceof Date && !isNaN(date.getTime()) && isFinite(date.getTime())
  );
}

/**
 * Форматирует дату в ISO строку с обработкой ошибок
 */
export function safeToISOString(date: Date | null | undefined): string | null {
  if (!date) {
    return null;
  }

  try {
    if (isValidDate(date)) {
      return date.toISOString();
    }
  } catch (error) {
    console.warn("Failed to convert date to ISO string", error);
  }

  return null;
}

/**
 * Вычисляет разницу между датами в миллисекундах
 */
export function getTimeDifference(start: Date, end: Date = new Date()): number {
  if (!isValidDate(start) || !isValidDate(end)) {
    return 0;
  }

  return Math.abs(end.getTime() - start.getTime());
}

/**
 * Проверяет, находится ли дата в заданном диапазоне
 */
export function isDateInRange(
  date: Date,
  startDate: Date,
  endDate: Date,
): boolean {
  if (!isValidDate(date) || !isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  const timestamp = date.getTime();
  return timestamp >= startDate.getTime() && timestamp <= endDate.getTime();
}

/**
 * Создает дату с отступом от текущей
 */
export function createDateOffset(
  offsetMs: number,
  baseDate: Date = new Date(),
): Date {
  if (!isValidDate(baseDate)) {
    baseDate = new Date();
  }

  return new Date(baseDate.getTime() + offsetMs);
}

/**
 * Константы для работы с временными интервалами
 */
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000, // Приблизительно
  YEAR: 365 * 24 * 60 * 60 * 1000, // Приблизительно
} as const;
