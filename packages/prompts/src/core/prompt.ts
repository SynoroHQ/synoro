import type { AIModel } from "./models";

export type PromptMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type PromptDefinition = {
  key: string; // unique registry key, e.g. "assistant"
  name: string; // cloud-friendly name, e.g. "assistant"
  type: "text" | "chat";
  prompt: string;
  labels?: string[];
  // optional defaults for publishing
  defaultModel?: AIModel;
};

export const DEFAULT_PROMPT_KEY = "assistant" as const;
