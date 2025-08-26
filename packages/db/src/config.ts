import { z } from "zod";

import { env } from "../env";

export const dbConfigSchema = z.object({
  DATABASE_TYPE: z.enum(["neon", "postgres"]).default("neon"),
  POSTGRES_URL: z.string().url(),
});

export type DatabaseConfig = z.infer<typeof dbConfigSchema>;

export function getDatabaseConfig(): DatabaseConfig {
  // Skip validation during build time
  if (process.env.CI || process.env.npm_lifecycle_event === "build") {
    return {
      DATABASE_TYPE: "postgres" as const,
      POSTGRES_URL:
        "postgresql://placeholder:placeholder@localhost:5432/placeholder",
    };
  }

  if (!env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is required");
  }

  return dbConfigSchema.parse({
    DATABASE_TYPE: env.DATABASE_TYPE || "neon",
    POSTGRES_URL: env.POSTGRES_URL,
  });
}
