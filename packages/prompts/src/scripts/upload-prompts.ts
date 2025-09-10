#!/usr/bin/env bun
import { LangfuseClient } from "@langfuse/client";

import { DEFAULT_MODEL } from "../core/models";
import { createPromptInCloud } from "../publish/langfuse";
import { registry } from "../registry";

function getArg(name: string): string | undefined {
  const prefix = name.endsWith("=") ? name : `${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg?.slice(prefix.length);
}

function parseListArg(name: string): string[] | undefined {
  const raw = getArg(name);
  if (!raw) return undefined;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function main() {
  const modelOverride = getArg("--model");
  const onlyKeys = parseListArg("--only");

  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const baseUrl = process.env.LANGFUSE_BASEURL ?? process.env.LANGFUSE_HOST;

  if (!secretKey || !publicKey) {
    console.error(
      "[upload-prompts] Missing LANGFUSE_PUBLIC_KEY and/or LANGFUSE_SECRET_KEY in env.",
    );
    process.exit(1);
  }

  const client = new LangfuseClient({ secretKey, publicKey, baseUrl });

  const keys = Object.keys(registry)
    .filter((k) => (onlyKeys ? onlyKeys.includes(k) : true))
    .sort();

  if (keys.length === 0) {
    console.log("[upload-prompts] No prompts to upload.");
    return;
  }

  console.log(
    `[upload-prompts] Uploading ${keys.length} prompt(s)${modelOverride ? ` with model='${modelOverride}'` : ""}...`,
  );

  const successes: string[] = [];
  const failures: Array<{ key: string; message: string }> = [];

  for (const key of keys) {
    const def = registry[key];
    if (!def) {
      failures.push({ key, message: "not found in registry" });
      continue;
    }
    const model = modelOverride ?? def.defaultModel ?? DEFAULT_MODEL;
    try {
      await createPromptInCloud(def, client, model);
      successes.push(key);
      console.log(`[upload-prompts] uploaded '${key}'`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push({ key, message });
      console.error(`[upload-prompts] failed '${key}': ${message}`);
    }
  }

  console.log(
    `[upload-prompts] done. ok=${successes.length} fail=${failures.length}`,
  );
  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

await main();
