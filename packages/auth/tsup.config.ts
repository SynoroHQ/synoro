import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "index.rsc": "src/index.rsc.ts",
    client: "src/client.ts",
    middleware: "src/middleware.ts",
  },
  format: ["esm"],
  dts: {
    resolve: true,
  },
  splitting: false,
  sourcemap: false,
  clean: true,
  external: ["react", "react-dom"],
  treeshake: true,

});
