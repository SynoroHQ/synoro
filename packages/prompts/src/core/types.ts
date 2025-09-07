// Shared types for prompts package
export type PromptMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// Используем типы напрямую из @langfuse/client
export type LangfuseClientLike = {
  prompt: {
    create: (args: any) => Promise<any>;
    get: (name: string, options?: any) => Promise<any>;
  };
};
