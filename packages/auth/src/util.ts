import { env } from "../env";

export const getBaseUrl = () => {
  if (env.BETTER_AUTH_URL) {
    return env.BETTER_AUTH_URL;
  }

  return `http://localhost:${env.PORT ?? 3000}`;
};
