import { headers } from "next/headers";

import { auth } from "./config";

export const getSession = async () =>
  auth.api.getSession({
    headers: await headers(),
    query: {
      disableRefresh: true,
    },
  });

export * from "./config";
