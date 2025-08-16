import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "node22",
  platform: "node",
  sourcemap: true,
  clean: true,
  dts: false,
  minify: false,
  splitting: false,
  bundle: true,
  // Оставим внутренние workspace-пакеты внешними (по желанию):
  external: [/^@synoro\//],
});
