import { Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import type { Database } from "./types";
import { getDatabaseConfig } from "./config";
import * as schema from "./schemas";

const config = getDatabaseConfig();

let db: Database;

if (config.DATABASE_TYPE === "neon") {
  // NeonDB pool
  const pool = new NeonPool({ connectionString: config.POSTGRES_URL });
  db = drizzleNeon({
    client: pool,
    schema,
    casing: "snake_case",
  });
} else {
  // Self-hosted PostgreSQL pool
  const pool = new Pool({
    connectionString: config.POSTGRES_URL,
  });

  db = drizzlePg(pool, {
    schema,
    casing: "snake_case",
  });
}

export { db };
