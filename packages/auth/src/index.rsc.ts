import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "./config";

export const getSession = async () =>
  cache(auth.api.getSession)({
    headers: await headers(),
    query: {
      disableRefresh: true,
    },
  });

export * from "./config";
