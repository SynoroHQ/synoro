import { Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import type { Database } from "./types";
import { getDatabaseConfig } from "./config";
import * as schema from "./schemas";

const config = getDatabaseConfig();

let db: Database;

if (config.DATABASE_TYPE === "neon") {
  const pool = new NeonPool({
    connectionString: config.POSTGRES_URL,
  });
  db = drizzle(pool, {
    schema,
    casing: "snake_case",
  });
} else {
  // Self-hosted PostgreSQL
  const pool = new Pool({
    connectionString: config.POSTGRES_URL,
  });

  db = drizzlePg(pool, {
    schema,
    casing: "snake_case",
  });
}

export { db };
