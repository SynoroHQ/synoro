// Shared types for prompts package
export type PromptMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
