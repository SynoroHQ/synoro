// Шаблоны и утилиты для генерации промптов

import {
  AGENT_DESCRIPTIONS,
  AGENTS,
  CONTEXT_VARIABLES,
  EVENT_TYPE_DESCRIPTIONS,
  EVENT_TYPES,
  EXPENSE_CATEGORIES,
  HTML_FORMATTING,
  PRIORITIES,
  PRIORITY_DESCRIPTIONS,
  QUALITY_PRINCIPLES,
  TASK_STATUS_DESCRIPTIONS,
  TASK_STATUSES,
  TELEGRAM_RESPONSE_GUIDELINES,
} from "./constants";

/**
 * Генерирует список типов событий для промптов
 */
export function generateEventTypesSection(): string {
  return `ТИПЫ СОБЫТИЙ:
${Object.entries(EVENT_TYPE_DESCRIPTIONS)
  .map(([type, description]) => `- ${type}: ${description}`)
  .join("\n")}`;
}

/**
 * Генерирует список приоритетов для промптов
 */
export function generatePrioritiesSection(): string {
  return `ПРИОРИТЕТЫ:
${Object.entries(PRIORITY_DESCRIPTIONS)
  .map(([priority, description]) => `- ${priority}: ${description}`)
  .join("\n")}`;
}

/**
 * Генерирует список статусов задач для промптов
 */
export function generateTaskStatusesSection(): string {
  return `СТАТУСЫ ЗАДАЧ:
${Object.entries(TASK_STATUS_DESCRIPTIONS)
  .map(([status, description]) => `- ${status}: ${description}`)
  .join("\n")}`;
}

/**
 * Генерирует список категорий расходов для промптов
 */
export function generateExpenseCategoriesSection(): string {
  return `КАТЕГОРИИ РАСХОДОВ:
- ${EXPENSE_CATEGORIES.join(", ")}`;
}

/**
 * Генерирует список доступных агентов для роутера
 */
export function generateAgentsSection(): string {
  return `ДОСТУПНЫЕ АГЕНТЫ:
${Object.entries(AGENT_DESCRIPTIONS)
  .map(
    ([agent, description], index) => `${index + 1}. ${agent} - ${description}`,
  )
  .join("\n")}`;
}

/**
 * Создает полный контекст для промпта
 */
export function createPromptContext(additionalContext?: string): string {
  const sections = [CONTEXT_VARIABLES, additionalContext].filter(Boolean);

  return sections.join("\n\n");
}

/**
 * Создает секцию с форматированием для Telegram
 */
export function createTelegramFormattingSection(): string {
  return `${HTML_FORMATTING}

${TELEGRAM_RESPONSE_GUIDELINES}`;
}

/**
 * Создает примеры классификации для роутера
 */
export function createRouterExamples(): string {
  return `ПРИМЕРЫ КЛАССИФИКАЦИИ:
- "Потратил 500 рублей на продукты" → ${AGENTS.EVENT_PROCESSOR}
- "Покажи статистику расходов за месяц" → ${AGENTS.EVENT_ANALYZER}
- "Как создать новое событие?" → ${AGENTS.GENERAL_ASSISTANT}
- "Задача: позвонить маме" → ${AGENTS.EVENT_PROCESSOR}
- "Сравни расходы с прошлым месяцем" → ${AGENTS.EVENT_ANALYZER}
- "Что такое категории событий?" → ${AGENTS.GENERAL_ASSISTANT}

КЛЮЧЕВЫЕ СЛОВА:
📝 event-processor: потратил, купил, заплатил, задача, запись, создать, добавить, сделал, починил
📊 event-analyzer: статистика, анализ, отчет, показать, сравни, тенденции, сколько, за период
❓ general-assistant: как, что такое, помощь, инструкции, объясни, настройки`;
}

/**
 * Создает секцию с принципами качественной работы
 */
export function createQualitySection(): string {
  return QUALITY_PRINCIPLES;
}

/**
 * Создает секцию важных правил для агента
 */
export function createImportantRules(specificRules?: string[]): string {
  const baseRules = [
    "Учитывай контекст предыдущих сообщений в диалоге",
    "Развивай диалог естественно, не повторяя уже обсужденную информацию",
    "Говори как живой человек, а не как программа или робот",
    "Будь полезным и практичным в своих советах",
  ];

  const allRules = specificRules ? [...baseRules, ...specificRules] : baseRules;

  return `ВАЖНЫЕ ПРАВИЛА:
${allRules.map((rule) => `- ${rule}`).join("\n")}`;
}

/**
 * Временные указания для извлечения данных
 */
export function createTimeExtractionRules(): string {
  return `ВРЕМЕННЫЕ УКАЗАНИЯ:
- Текущее время: {{currentTime}}
- Часовой пояс: {{timezone}}
- ОБЯЗАТЕЛЬНО конвертируй все относительные временные указания ("завтра", "через неделю", "вчера") в абсолютное время в формате ISO-8601
- Если время не указано, используй {{currentTime}} в формате ISO-8601
- Все даты должны учитывать часовой пояс {{timezone}}`;
}

/**
 * Примеры для извлечения событий
 */
export function createExtractionExamples(): string {
  return `ПРИМЕРЫ ИЗВЛЕЧЕНИЯ:

Вход: "Потратил 500 рублей на продукты в Пятерочке"
Выход: {
  "title": "Покупка продуктов в Пятерочке",
  "description": "Покупка продуктов в магазине Пятерочка",
  "type": "purchase",
  "priority": "medium",
  "amount": 500,
  "currency": "RUB",
  "occurredAt": "{{currentTime}}",
  "tags": ["продукты", "пятерочка"],
  "confidence": 0.9,
  "needsConfirmation": false
}

Вход: "Завтра нужно починить кран в ванной"
Выход: {
  "title": "Починить кран в ванной",
  "description": "Ремонт крана в ванной комнате",
  "type": "maintenance",
  "priority": "high",
  "amount": null,
  "currency": "RUB",
  "occurredAt": "{{currentTime + 1 day}}",
  "tags": ["ремонт", "сантехника", "ванная"],
  "confidence": 0.8,
  "needsConfirmation": false
}`;
}

/**
 * Создает оценочную шкалу для оценки качества
 */
export function createQualityScale(): string {
  return `ШКАЛА ОЦЕНОК:
- 0.9-1.0: Отличный ответ, практически без недостатков
- 0.7-0.8: Хороший ответ с незначительными улучшениями  
- 0.5-0.6: Удовлетворительный ответ, требует доработки
- 0.3-0.4: Слабый ответ, существенные проблемы
- 0.0-0.2: Неприемлемый ответ, требует полной переработки`;
}

/**
 * Создает эмодзи-иконки для разных типов событий
 */
export function getEventTypeIcon(eventType: string): string {
  const icons: Record<string, string> = {
    [EVENT_TYPES.PURCHASE]: "🛒",
    [EVENT_TYPES.MAINTENANCE]: "🔧",
    [EVENT_TYPES.HEALTH]: "💊",
    [EVENT_TYPES.WORK]: "💼",
    [EVENT_TYPES.PERSONAL]: "👤",
    [EVENT_TYPES.TRANSPORT]: "🚗",
    [EVENT_TYPES.HOME]: "🏠",
    [EVENT_TYPES.FINANCE]: "💰",
    [EVENT_TYPES.EDUCATION]: "📚",
    [EVENT_TYPES.ENTERTAINMENT]: "🎮",
    [EVENT_TYPES.TRAVEL]: "✈️",
    [EVENT_TYPES.FOOD]: "🍽️",
    [EVENT_TYPES.OTHER]: "📝",
  };

  return icons[eventType] || "📝";
}

/**
 * Создает примеры хороших и плохих ответов
 */
export function createResponseExamples(): string {
  return `ПРИМЕРЫ ХОРОШИХ ОТВЕТОВ:
❌ Плохо: "Классифицировано: ремонт; извлечено — замена масла в автомобиле Logan, пробег 175000 км, дата: {{currentTime}}. Данные выглядят корректно."

✅ Хорошо: "Понял! Записал замену масла на Logan (175к км). А какое масло залили и сколько заплатили? И фильтр меняли? Это поможет лучше отслеживать расходы."

✅ Еще лучше: "Отлично! Записал замену масла на Logan (175к км). Если скажешь тип масла, стоимость и меняли ли фильтр - дополню запись. А то потом забудешь детали 😊"`;
}
