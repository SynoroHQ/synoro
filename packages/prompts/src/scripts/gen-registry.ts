#!/usr/bin/env bun
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative, sep } from "node:path";

const ROOT = join(import.meta.dirname, "..", "prompts");
const REGISTRY_FILE = join(import.meta.dirname, "..", "registry.ts");

type PromptModule = {
  importPath: string;
  varName: string;
  key: string;
};

function toVarName(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, "_");
}

function findPromptModules(dir: string): PromptModule[] {
  const result: PromptModule[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      // Back-compat: support prompts/<key>/index.ts
      const indexTs = join(full, "index.ts");
      const indexTsx = join(full, "index.tsx");
      const hasIndex =
        statSync(indexTs, { throwIfNoEntry: false }) ||
        statSync(indexTsx, { throwIfNoEntry: false });
      if (hasIndex) {
        const rel = relative(join(import.meta.dirname, ".."), full)
          .split(sep)
          .join("/");
        const varName = toVarName(entry);
        result.push({ importPath: `./${rel}`, varName, key: entry });
      }
      continue;
    }
    // Flat files: prompts/<key>.ts (ignore .d.ts and non-.ts)
    const ext = extname(full);
    if (ext === ".ts" && !full.endsWith(".d.ts")) {
      const base = basename(full, ext);
      const rel = relative(join(import.meta.dirname, ".."), full)
        .replace(/\\/g, "/")
        .replace(/\.ts$/, "");
      const varName = toVarName(base);
      result.push({ importPath: `./${rel}`, varName, key: base });
    }
  }
  return result;
}

function generateRegistry(mods: PromptModule[]): string {
  const imports = mods
    .map((m) => `import ${m.varName} from "${m.importPath}";`)
    .join("\n");
  const entries = mods
    .map((m) => `  [${m.varName}.key]: ${m.varName},`)
    .join("\n");
  return `import type { PromptDefinition } from "./core/prompt";\n${imports}\n\nexport const registry: Record<string, PromptDefinition> = {\n${entries}\n};\n`;
}

function main() {
  const modules = findPromptModules(ROOT);
  const content = generateRegistry(modules);
  writeFileSync(REGISTRY_FILE, content);
  console.log(
    `[gen-registry] Updated ${REGISTRY_FILE} with ${modules.length} prompt(s).`,
  );
}

main();
