import type { ParsedTask } from "../ai";

export interface ContextMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: {
    text: string;
  };
  createdAt: Date;
}

export interface MessageProcessorOptions {
  // Function IDs for different message types
  questionFunctionId: string;
  chatFunctionId: string;
  parseFunctionId: string;
  adviseFunctionId: string;
  fallbackParseFunctionId: string;
  fallbackAdviseFunctionId: string;

  // Custom response templates
  responseTemplates?: {
    question?: (text: string, answer: string) => string;
    event?: (text: string, tip?: string) => string;
    chat?: (text: string, chatResponse: string) => string;
    irrelevant?: (text: string) => string;
    fallback?: (text: string, tip?: string) => string;
  };
}

export interface ProcessClassifiedMessageResult {
  response: string;
  parsed: ParsedTask | null;
}

export interface MessageContext {
  channel: "telegram" | "web" | "mobile";
  userId: string;
  chatId?: string;
  messageId?: string;
  metadata?: Record<string, unknown>;
  conversationId?: string;
  context?: ContextMessage[];
}
