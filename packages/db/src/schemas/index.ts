// Export all schemas
export * from "./auth";
export * from "./core";
export * from "./events";
export * from "./chat";

// Экспорт агрегатора relations как пространства имён, чтобы избежать конфликтов реэкспортов
export * as relations from "./relations";
