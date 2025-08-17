import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@synoro/auth";

export const { GET, POST } = toNextJsHandler(auth.handler);
