export const MESSAGE_PROCESSING_CONFIG = {
  // Настройки контекста беседы
  CONTEXT: {
    MAX_MESSAGES: 20,
    INCLUDE_SYSTEM_MESSAGES: false,
    MAX_AGE_HOURS: 48,
  },

  // Настройки токенов для разных типов сообщений
  TOKENS: {
    QUESTION_OR_CHAT: 2000, // Для вопросов и чата (больше контекста)
    EVENT: 1000, // Для событий (меньше контекста)
    SHORT_MESSAGE_THRESHOLD: 50, // Порог для определения коротких сообщений
  },

  // ID функций для классификации и обработки
  FUNCTION_IDS: {
    CLASSIFIER: "api-message-classifier",
    QUESTION: "api-answer-question",
    CHAT: "api-chat-response",
    PARSE: "api-parse-text",
    ADVISE: "api-advise",
    FALLBACK_PARSE: "api-parse-text-fallback",
    FALLBACK_ADVISE: "api-advise-fallback",
  },

  // Лимиты для логирования
  LOGGING: {
    MAX_TEXT_LENGTH: 100, // Максимальная длина текста для логирования
  },
} as const;

export const CHANNELS = ["telegram", "web", "mobile"] as const;
export type Channel = (typeof CHANNELS)[number];
