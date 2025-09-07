// Shared types for prompts package
export type PromptMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LangfuseClientLike = {
  createPrompt: (args: {
    name: string;
    type: string; // 'text' or 'chat'
    prompt: string | PromptMessage[];
    labels?: string[];
    config?: unknown;
  }) => Promise<unknown>;
  getPrompt: (args: {
    name: string;
    version?: number;
    label?: string;
  }) => Promise<{
    prompt: string | PromptMessage[];
    version: number;
  } | null>;
};
