// Экспортируем утилиты для перевода
export * from "./src/utils";

export { sendEmail, sendEmailHtml } from "./send";
// env was moved to @synoro/config to respect layered architecture
