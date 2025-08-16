import { headers } from "next/headers";

import { auth } from "./config";

export const getSession = async () =>
  auth.api.getSession({
    headers: await headers(),
  });

export * from "./config";
export * from "./client";
export * from "./util";
export * from "./middleware";
export * from "./index.rsc";
