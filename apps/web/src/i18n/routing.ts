import { defineRouting } from "next-intl/routing";

const isDev = process.env.NODE_ENV === "development";

export const routing = defineRouting({
  // Список поддерживаемых локалей
  locales: ["en", "ru"],

  // Локаль по умолчанию для разработки (localhost)
  defaultLocale: "ru",

  // Отключаем автоматическое добавление локали в URL
  localePrefix: "never",

  // Настройка доменов
  domains: [
    {
      domain: "mysynoro.com",
      defaultLocale: "en",
      locales: ["en"],
    },
    {
      domain: isDev ? "localhost:3000" : "synoro.ru",
      defaultLocale: "ru",
      locales: ["ru"],
    },
  ],
});
