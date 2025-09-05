import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import type { appRouter } from "@synoro/api";

import { env } from "../env";

// Создаем tRPC клиент для взаимодействия с API
export const apiClient = createTRPCProxyClient<typeof appRouter>({
  links: [
    httpBatchLink({
      url: `${env.API_BASE_URL}/trpc`,
      headers: () => ({
        Authorization: `Bearer ${env.TELEGRAM_BOT_TOKEN}`,
      }),
      transformer: superjson,
    }),
  ],
});

// Функция для создания API клиента с дополнительными headers
export function createApiClientWithHeaders(additionalHeaders: Record<string, string>) {
  return createTRPCProxyClient<typeof appRouter>({
    links: [
      httpBatchLink({
        url: `${env.API_BASE_URL}/trpc`,
        headers: () => ({
          Authorization: `Bearer ${env.TELEGRAM_BOT_TOKEN}`,
          ...additionalHeaders,
        }),
        transformer: superjson,
      }),
    ],
  });
}

// Типы для удобства
export type ApiClient = typeof apiClient;
