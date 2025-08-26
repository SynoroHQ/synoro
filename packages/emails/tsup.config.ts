import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  entry: ["index.ts"],
  format: ["esm"],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: isProduction,
  external: ["react"],
});
