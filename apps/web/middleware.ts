import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Обрабатываем все пути, кроме статических файлов и API
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
