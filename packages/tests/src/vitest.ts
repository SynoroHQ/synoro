import { defineConfig } from "vitest/config";

export const vitestConfig = defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/setup.ts"],
  },
});

export default vitestConfig;
