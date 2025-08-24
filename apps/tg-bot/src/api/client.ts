import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "@synoro/api";

import { env } from "../env";

// Создаем tRPC клиент для взаимодействия с API
export const apiClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.API_BASE_URL}/api/trpc`,
      headers: () => ({
        Authorization: `Bearer ${env.TELEGRAM_BOT_TOKEN}`,
      }),
      transformer: superjson,
    }),
  ],
});

// Типы для удобства
export type ApiClient = typeof apiClient;
