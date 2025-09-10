// Shared types for prompts package
export type PromptMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LangfuseClientLike = {
  prompt: {
    create: (params: any) => Promise<any>;
    get: (name: string, options?: any) => Promise<any>;
  };
};
