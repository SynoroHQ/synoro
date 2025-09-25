// Единые константы для всех промптов системы Synoro AI

export const EVENT_TYPES = {
  // Основные типы событий
  PURCHASE: "purchase",
  MAINTENANCE: "maintenance",
  HEALTH: "health",
  WORK: "work",
  PERSONAL: "personal",
  TRANSPORT: "transport",
  HOME: "home",
  FINANCE: "finance",
  EDUCATION: "education",
  ENTERTAINMENT: "entertainment",
  TRAVEL: "travel",
  FOOD: "food",
  OTHER: "other",
} as const;

export const EVENT_TYPE_DESCRIPTIONS = {
  [EVENT_TYPES.PURCHASE]: "покупки, траты, расходы, платежи",
  [EVENT_TYPES.MAINTENANCE]: "ремонт, обслуживание, техобслуживание, починка",
  [EVENT_TYPES.HEALTH]: "здоровье, медицина, спорт, лечение",
  [EVENT_TYPES.WORK]: "работа, карьера, проекты, встречи",
  [EVENT_TYPES.PERSONAL]: "личные дела, хобби, досуг",
  [EVENT_TYPES.TRANSPORT]: "транспорт, поездки, заправка",
  [EVENT_TYPES.HOME]: "дом, квартира, быт, уборка",
  [EVENT_TYPES.FINANCE]: "финансы, инвестиции, сбережения",
  [EVENT_TYPES.EDUCATION]: "обучение, курсы, книги, учеба",
  [EVENT_TYPES.ENTERTAINMENT]: "развлечения, кино, игры, концерты",
  [EVENT_TYPES.TRAVEL]: "путешествия, отпуск, командировки",
  [EVENT_TYPES.FOOD]: "еда, рестораны, готовка, продукты",
  [EVENT_TYPES.OTHER]: "все остальное",
} as const;

export const PRIORITIES = {
  URGENT: "urgent",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export const PRIORITY_DESCRIPTIONS = {
  [PRIORITIES.URGENT]: "срочно, немедленно, критично",
  [PRIORITIES.HIGH]: "важно, приоритетно, нужно сделать",
  [PRIORITIES.MEDIUM]: "обычная важность, стандартно",
  [PRIORITIES.LOW]: "не спешит, когда будет время",
} as const;

export const TASK_STATUSES = {
  WAITING: "waiting",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const TASK_STATUS_DESCRIPTIONS = {
  [TASK_STATUSES.WAITING]: "ждет",
  [TASK_STATUSES.IN_PROGRESS]: "делаю",
  [TASK_STATUSES.COMPLETED]: "готово",
  [TASK_STATUSES.CANCELLED]: "отменено",
} as const;

export const EXPENSE_CATEGORIES = [
  "продукты",
  "транспорт",
  "развлечения",
  "одежда",
  "здоровье",
  "дом",
  "образование",
  "услуги",
  "подарки",
  "прочее",
] as const;

export const CURRENCIES = {
  RUB: "RUB",
  USD: "USD",
  EUR: "EUR",
} as const;

// Агенты системы
export const AGENTS = {
  EVENT_PROCESSOR: "event-processor",
  EVENT_ANALYZER: "event-analyzer",
  GENERAL_ASSISTANT: "general-assistant",
  ROUTER: "router-agent",
} as const;

export const AGENT_DESCRIPTIONS = {
  [AGENTS.EVENT_PROCESSOR]:
    "для записи событий (создание, редактирование, классификация событий)",
  [AGENTS.EVENT_ANALYZER]:
    "для анализа событий (статистика, отчеты, тенденции, выводы)",
  [AGENTS.GENERAL_ASSISTANT]:
    "для помощи с системой событий (объяснения, инструкции, общие вопросы)",
} as const;

// Общие HTML теги для Telegram
export const HTML_FORMATTING = `
ПОДДЕРЖИВАЕМЫЕ HTML-ТЕГИ:
- <b>текст</b> - жирный шрифт
- <i>текст</i> - курсив
- <u>текст</u> - подчеркнутый
- <code>код</code> - моноширинный шрифт
- <pre>блок кода</pre> - блок кода
- <s>текст</s> - зачеркнутый
- <tg-spoiler>текст</tg-spoiler> - скрытый текст
- <a href="url">ссылка</a> - ссылка`.trim();

// Общие переменные контекста
export const CONTEXT_VARIABLES = `
КОНТЕКСТ:
- Пользователь: {{userId}}
- Домашнее хозяйство: {{householdId}}
- Время запроса: {{currentTime}}
- Часовой пояс: {{timezone}}

ИСТОРИЯ ДИАЛОГА:
{{messageHistory}}`.trim();

// Общие принципы ответов для Telegram
export const TELEGRAM_RESPONSE_GUIDELINES = `
ФОРМАТ ОТВЕТОВ ДЛЯ TELEGRAM:
- Отвечай структурированно и кратко (максимум 5-6 предложений)
- Используй HTML-теги для выделения важной информации
- Структурируй данные в компактные списки с эмодзи
- Выделяй ключевые выводы жирным шрифтом
- Давай конкретные и практичные рекомендации
- Говори естественно, как живой человек, а не робот
- Используй эмодзи умеренно, не переборщи`.trim();

// Общие принципы качества
export const QUALITY_PRINCIPLES = `
ПРИНЦИПЫ КАЧЕСТВА:
- Точность: корректность извлеченной информации
- Полнота: все необходимые поля заполнены
- Релевантность: соответствие запросу пользователя
- Ясность: понятность и структурированность
- Практичность: применимость для реального использования
- Естественность: человеческое, не роботическое общение`.trim();

// Модели для разных задач
export const RECOMMENDED_MODELS = {
  ROUTING: "gpt-5", // Быстрая и точная классификация
  PROCESSING: "gpt-5-nano", // Обработка событий с балансом скорости/качества
  ANALYSIS: "gpt-5-nano", // Анализ данных
  EXTRACTION: "gpt-4o-mini", // Точное извлечение структурированных данных
  GENERAL: "gpt-5", // Общение и помощь
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
export type Priority = (typeof PRIORITIES)[keyof typeof PRIORITIES];
export type TaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES];
export type Agent = (typeof AGENTS)[keyof typeof AGENTS];
