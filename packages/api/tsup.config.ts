import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false, // Отключаем .d.ts файлы
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  external: [
    "@synoro/auth",
    "@synoro/db",
    "@synoro/validators",
    "@trpc/server",
    "date-fns",
    "nanoid",
    "superjson",
    "zod",
  ],
});
