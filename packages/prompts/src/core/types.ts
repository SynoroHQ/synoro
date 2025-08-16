// Shared types for prompts package
export type LangfuseClientLike = {
  createPrompt: (args: {
    name: string;
    type: string; // typically 'text'
    prompt: string;
    labels?: string[];
    config?: unknown;
  }) => Promise<unknown>;
};
