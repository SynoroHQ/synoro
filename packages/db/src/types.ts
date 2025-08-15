import type { drizzle as drizzleNeonServerless } from "drizzle-orm/neon-serverless";
import type { drizzle as drizzlePg } from "drizzle-orm/node-postgres";

import type * as schema from "./schemas";

export type Database =
  | ReturnType<typeof drizzleNeonServerless<typeof schema>>
  | ReturnType<typeof drizzlePg<typeof schema>>;
