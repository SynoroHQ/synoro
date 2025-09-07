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
};
