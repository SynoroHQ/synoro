import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { Langfuse } from "langfuse";

import type { PromptKey } from "@synoro/prompts";
import {
  DEFAULT_PROMPT_KEY,
  getPromptSafe,
  PROMPT_KEYS,
} from "@synoro/prompts";

import type { MessageTypeResult, Telemetry } from "./types";

// Initialize AI providers
const oai = openai; // use default provider instance; it reads OPENAI_API_KEY from env
const moonshotAI = createOpenAICompatible({
  name: "moonshot",
  apiKey: process.env.MOONSHOT_API_KEY,
  baseURL: "https://api.moonshot.ai/v1",
});

// Get the active AI provider based on configuration
function getActiveProvider() {
  return process.env.AI_PROVIDER === "moonshot" ? moonshotAI : oai;
}

// Helper function to get model based on provider and environment variables
function getModelFromEnv(
  moonshotModel: string | undefined,
  openaiModel: string | undefined,
  moonshotDefault: string,
  openaiDefault: string,
): string {
  if (process.env.AI_PROVIDER === "moonshot") {
    return moonshotModel ?? moonshotDefault;
  }
  return openaiModel ?? openaiDefault;
}

// Get the active advice model
function getAdviceModel() {
  return getModelFromEnv(
    process.env.MOONSHOT_ADVICE_MODEL,
    process.env.OPENAI_ADVICE_MODEL,
    "kimi-k2-0711-preview",
    "gpt-4o-mini",
  );
}

// Lazy-initialized Langfuse client and cached prompts per key
let lf: Langfuse | null = null;
const cachedPrompts: Record<string, string> = {};

async function getSystemPrompt(
  key: PromptKey = DEFAULT_PROMPT_KEY,
): Promise<string> {
  if (cachedPrompts[key]) return cachedPrompts[key];

  // Try Langfuse first if creds are present
  if (process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY) {
    try {
      if (!lf) {
        lf = new Langfuse({
          publicKey: process.env.LANGFUSE_PUBLIC_KEY,
          secretKey: process.env.LANGFUSE_SECRET_KEY,
          baseUrl: process.env.LANGFUSE_BASEURL,
        });
      }

      const prompt = await lf.getPrompt(key);
      // Compile with empty vars by default; extend if variables are added later
      const compiled = prompt.compile({});
      const value = compiled.trim();
      if (value) {
        cachedPrompts[key] = value;
        return value;
      }
    } catch (_e) {
      // Fallback below
    }
  }

  // Fallback to local registry prompt (defaults internally)
  const local = getPromptSafe(key).trim();
  cachedPrompts[key] = local;
  return local;
}

async function getAssistantSystemPrompt(): Promise<string> {
  return getSystemPrompt(PROMPT_KEYS.ASSISTANT);
}

/**
 * Предоставляет совет по тексту сообщения с учетом контекста беседы
 */
export async function advise(
  input: string,
  telemetry?: Telemetry,
): Promise<string> {
  const systemPrompt = await getAssistantSystemPrompt();

  // Извлекаем контекст из метаданных
  const contextString = telemetry?.metadata?.context as string;
  const context: {
    id: string;
    role: string;
    content: { text: string };
    createdAt: Date;
  }[] = contextString ? JSON.parse(contextString) : [];

  // Формируем историю беседы для промпта
  let conversationHistory = "";
  if (context.length > 0) {
    conversationHistory = "Контекст беседы:\n";
    context.forEach((msg, index) => {
      const role = msg.role === "user" ? "Пользователь" : "Ассистент";
      conversationHistory += `${index + 1}. ${role}: ${msg.content.text}\n`;
    });
    conversationHistory += "\n";
  }

  const contextualPrompt = `${conversationHistory}Текущее событие: "${input}"

Дай краткий полезный совет, учитывая контекст предыдущих сообщений и это событие.`;

  const { text } = await generateText({
    model: getActiveProvider()(getAdviceModel()),
    system: systemPrompt,
    prompt: contextualPrompt,
    temperature: 0.4,
    experimental_telemetry: {
      isEnabled: true,
      functionId: telemetry?.functionId ?? "ai-advise",
      metadata: telemetry?.metadata,
    },
  });
  return text.trim();
}

/**
 * Отвечает на вопрос пользователя с учетом контекста беседы
 */
export async function answerQuestion(
  question: string,
  messageType: MessageTypeResult,
  telemetry?: Telemetry,
): Promise<string> {
  const systemPrompt = await getAssistantSystemPrompt();

  // Извлекаем контекст из метаданных
  const contextString = telemetry?.metadata?.context as string;
  const context: {
    id: string;
    role: string;
    content: { text: string };
    createdAt: Date;
  }[] = contextString ? JSON.parse(contextString) : [];

  // Формируем историю беседы для промпта
  let conversationHistory = "";
  if (context.length > 0) {
    conversationHistory = "\n\nИстория беседы:\n";
    context.forEach((msg, index) => {
      const role = msg.role === "user" ? "Пользователь" : "Ассистент";
      conversationHistory += `${index + 1}. ${role}: ${msg.content.text}\n`;
    });
    conversationHistory += "\n";
  }

  // Создаем контекстный промпт в зависимости от типа вопроса
  let contextPrompt = question;

  if (messageType.subtype === "about_bot") {
    contextPrompt = `${conversationHistory}Пользователь спрашивает о тебе как о боте. Вопрос: "${question}"
    
Ответь дружелюбно, расскажи о своих возможностях согласно системному промпту. Учитывай контекст предыдущих сообщений.`;
  } else if (messageType.subtype === "data_query") {
    contextPrompt = `${conversationHistory}Пользователь спрашивает о своих данных/статистике. Вопрос: "${question}"
    
Объясни, что для получения статистики нужно сначала накопить данные, записывая события. Предложи начать с записи покупок, задач или других событий. Учитывай контекст предыдущих сообщений.`;
  } else if (messageType.subtype === "general") {
    contextPrompt = `${conversationHistory}Пользователь задает общий вопрос. Вопрос: "${question}"
    
Ответь полезно и по возможности покажи, как Synoro может помочь в этой ситуации. Учитывай контекст предыдущих сообщений.`;
  } else {
    // Для chat и других типов просто добавляем контекст
    contextPrompt = `${conversationHistory}Текущее сообщение пользователя: "${question}"
    
Ответь дружелюбно и полезно, учитывая контекст предыдущих сообщений. Поддерживай естественный диалог.`;
  }

  const { text } = await generateText({
    model: getActiveProvider()(getAdviceModel()),
    system: systemPrompt,
    prompt: contextPrompt,
    temperature: 0.6,
    experimental_telemetry: {
      isEnabled: true,
      functionId: telemetry?.functionId ?? "ai-answer-question",
      metadata: telemetry?.metadata,
    },
  });
  return text.trim();
}
