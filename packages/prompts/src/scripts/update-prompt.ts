#!/usr/bin/env bun
import { LangfuseClient } from "@langfuse/client";

import type { LangfuseClientLike } from "../core/types";
import { createPromptByKeyInCloud } from "../publish/langfuse";
import { registry } from "../registry";

function getArg(name: string): string | undefined {
  const prefix = name.endsWith("=") ? name : `${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg?.slice(prefix.length);
}

function getFirstPositionalArg(): string | undefined {
  // Skip bun/node + script path
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  return args[0];
}

async function main() {
  const modelArg = getArg("--model");
  const keyArg = getFirstPositionalArg() ?? "assistant";

  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const baseUrl = process.env.LANGFUSE_BASEURL ?? process.env.LANGFUSE_HOST;

  if (!secretKey || !publicKey) {
    console.error(
      "[update-prompt] Missing LANGFUSE_PUBLIC_KEY and/or LANGFUSE_SECRET_KEY in env.",
    );
    process.exit(1);
  }

  const lf = new LangfuseClient({
    secretKey,
    publicKey,
    baseUrl,
  });

  const client: LangfuseClientLike = {
    prompt: {
      create: (args) => lf.prompt.create(args),
      get: (name, options) => lf.prompt.get(name, options),
    },
  };

  try {
    console.log(
      `[update-prompt] Publishing prompt key='${keyArg}' model='${modelArg ?? "(default)"}'...`,
    );
    const res = await createPromptByKeyInCloud(
      keyArg,
      client,
      modelArg ?? undefined,
    );
    console.log(
      `[update-prompt] Prompt '${keyArg}' опубликован успешно` +
        (modelArg ? ` (model='${modelArg}')` : ""),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[update-prompt] Failed to publish prompt:", message);
    if (message.includes("not found in registry")) {
      const keys = Object.keys(registry).sort();
      console.error("[update-prompt] Available prompt keys:", keys.join(", "));
    }
    process.exit(1);
  }
}

main();
