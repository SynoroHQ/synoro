import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { Langfuse } from "langfuse";

import type { PromptKey } from "@synoro/prompts";
import { PROMPT_KEYS } from "@synoro/prompts";

import type { MessageTypeResult, ParsedMessage, Telemetry } from "./types";

// Initialize AI providers
const oai = openai; // use default provider instance; it reads OPENAI_API_KEY from env
const moonshotAI = createOpenAICompatible({
  name: "moonshot",
  apiKey: process.env.MOONSHOT_API_KEY,
  baseURL: "https://api.moonshot.ai/v1",
});

/**
 * Безопасно парсит контекст из метаданных телеметрии
 * Включает валидацию, нормализацию дат и обработку ошибок
 */
export function parseContextSafely(telemetry?: Telemetry): ParsedMessage[] {
  const contextString = telemetry?.metadata?.context as string;

  if (!contextString) {
    return [];
  }

  try {
    // Проверяем размер строки (максимум 1MB)
    if (contextString.length > 1024 * 1024) {
      console.warn("Context string too large, skipping context");
      return [];
    }

    // Парсим JSON
    const rawContext = JSON.parse(contextString);

    // Валидируем, что это массив
    if (!Array.isArray(rawContext)) {
      console.warn("Context is not an array, using empty context");
      return [];
    }

    return rawContext
      .map((item, index) => {
        try {
          // Проверяем базовую структуру
          if (!item || typeof item !== "object") {
            console.warn(
              `Skipping invalid context item at index ${index}: not an object`,
            );
            return null;
          }

          // Валидируем обязательные поля
          if (typeof item.id !== "string" || !item.id.trim()) {
            console.warn(`Skipping context item at index ${index}: invalid id`);
            return null;
          }

          if (typeof item.role !== "string" || !item.role.trim()) {
            console.warn(
              `Skipping context item at index ${index}: invalid role`,
            );
            return null;
          }

          // Проверяем, что роль соответствует ожидаемым значениям
          const normalizedRole = item.role.trim().toLowerCase();
          if (normalizedRole !== "user" && normalizedRole !== "assistant") {
            console.warn(
              `Skipping context item at index ${index}: invalid role "${item.role}"`,
            );
            return null;
          }

          if (
            !item.content ||
            typeof item.content !== "object" ||
            typeof item.content.text !== "string"
          ) {
            console.warn(
              `Skipping context item at index ${index}: invalid content`,
            );
            return null;
          }

          // Нормализуем createdAt
          let createdAt: Date;
          if (item.createdAt instanceof Date) {
            createdAt = item.createdAt;
          } else if (typeof item.createdAt === "string") {
            createdAt = new Date(item.createdAt);
          } else if (typeof item.createdAt === "number") {
            createdAt = new Date(item.createdAt);
          } else {
            // Если createdAt отсутствует или невалиден, используем текущее время
            createdAt = new Date();
          }

          // Проверяем, что дата валидна
          if (isNaN(createdAt.getTime())) {
            createdAt = new Date();
          }

          return {
            id: item.id.trim(),
            role: normalizedRole as "user" | "assistant",
            content: { text: item.content.text.trim() },
            createdAt,
          };
        } catch (error) {
          console.warn(
            `Error processing context item at index ${index}:`,
            error,
          );
          return null;
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  } catch (error) {
    console.warn("Error parsing context JSON, using empty context:", error);
    return [];
  }
}

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
    "gpt-5-mini",
  );
}

// Lazy-initialized Langfuse client and cached prompts per key
let lf: Langfuse | null = null;
const cachedPrompts: Record<string, string> = {};

async function getSystemPrompt(key: PromptKey): Promise<string> {
  if (cachedPrompts[key]) return cachedPrompts[key];

  // Проверяем наличие Langfuse credentials
  if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) {
    throw new Error("Langfuse credentials not configured");
  }

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
    throw new Error(`Empty prompt returned for key: ${key}`);
  } catch (error) {
    console.error(`Failed to get prompt from Langfuse for key ${key}:`, error);
    throw new Error(
      `Failed to get prompt from Langfuse: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
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

  // Извлекаем контекст из метаданных с безопасным парсингом
  const context = parseContextSafely(telemetry);

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

  // Извлекаем контекст из метаданных с безопасным парсингом
  const context = parseContextSafely(telemetry);

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
