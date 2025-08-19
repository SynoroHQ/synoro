import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  // Используем локаль по умолчанию если не определена
  const validLocale = locale || routing.defaultLocale;

  // Валидируем что локаль поддерживается
  if (
    !routing.locales.includes(validLocale as (typeof routing.locales)[number])
  ) {
    throw new Error(`Unsupported locale: ${validLocale}`);
  }

  return {
    locale: validLocale,
    messages: (await import(`../../translations/${validLocale}.json`)).default,
  };
});
