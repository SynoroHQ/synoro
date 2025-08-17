import { env } from "../env";

export const getBaseUrl = () => {
  // В серверной среде используем переменные окружения
  return `http://localhost:${env.PORT ?? 3000}`;
};
