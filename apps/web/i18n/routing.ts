import { defineRouting } from "next-intl/routing";

const isDev = process.env.NODE_ENV === "development";

export const routing = defineRouting({
  // Список поддерживаемых локалей
  locales: ["en", "ru"],

  // Локаль по умолчанию
  defaultLocale: "en",

  // Отключаем автоматическое добавление локали в URL
  localePrefix: "never",

  // Настройка доменов
  domains: [
    {
      domain: isDev ? "localhost:3000" : "mysynoro.com",
      defaultLocale: "en",
      locales: ["en"],
    },
    {
      domain: "synoro.ru",
      defaultLocale: "ru",
      locales: ["ru"],
    },
  ],
});
