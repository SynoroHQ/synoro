import type { MessageTypeResult } from "../ai";
import type {
  MessageContext,
  MessageProcessorOptions,
  ProcessClassifiedMessageResult,
} from "./types";
import { advise, answerQuestion, getAdviceModel, parseTask } from "../ai";

/**
 * Универсальный процессор сообщений
 * Обрабатывает сообщения независимо от канала (Telegram, Web, Mobile)
 */
export async function processClassifiedMessage(
  text: string,
  messageType: MessageTypeResult,
  context: MessageContext,
  options: MessageProcessorOptions,
): Promise<ProcessClassifiedMessageResult> {
  let response = "";
  let parsed = null;

  // Получаем модель, которая будет использоваться
  const model = getAdviceModel();

  // Default response templates
  const defaultTemplates = {
    question: (text: string, answer: string) => answer,
    event: (text: string, tip?: string) =>
      tip ? `Записал: "${text}".\nСовет: ${tip}` : `Записал: "${text}".`,
    chat: (text: string, chatResponse: string) => chatResponse,
    irrelevant: (_text: string) =>
      "Понял, спасибо за сообщение! Если нужна помощь, просто спроси.",
    fallback: (text: string, tip?: string) =>
      tip ? `Записал: "${text}".\nСовет: ${tip}` : `Записал: "${text}".`,
  };

  const templates = { ...defaultTemplates, ...options.responseTemplates };

  // Process based on message type
  switch (messageType.type) {
    case "question":
      // Answer the question without logging to database
      const answer = await answerQuestion(text, messageType, {
        functionId: options.questionFunctionId,
        metadata: {
          ...context.metadata,
          channel: context.channel,
          userId: context.userId,
          ...(context.chatId && { chatId: context.chatId }),
          ...(context.messageId && { messageId: context.messageId }),
        },
      });
      response = templates.question(text, answer);
      break;

    case "event":
      // Process event: parse and provide advice
      parsed = await parseTask(text, {
        functionId: options.parseFunctionId,
        metadata: {
          ...context.metadata,
          channel: context.channel,
          userId: context.userId,
          ...(context.chatId && { chatId: context.chatId }),
          ...(context.messageId && { messageId: context.messageId }),
        },
      });

      const tip = await advise(text, {
        functionId: options.adviseFunctionId,
        metadata: {
          ...context.metadata,
          channel: context.channel,
          userId: context.userId,
          ...(context.chatId && { chatId: context.chatId }),
          ...(context.messageId && { messageId: context.messageId }),
        },
      });

      response = templates.event(text, tip);
      break;

    case "chat":
      // Simple conversation - provide friendly response
      const chatResponse = await answerQuestion(text, messageType, {
        functionId: options.chatFunctionId,
        metadata: {
          ...context.metadata,
          channel: context.channel,
          userId: context.userId,
          ...(context.chatId && { chatId: context.chatId }),
          ...(context.messageId && { messageId: context.messageId }),
        },
      });
      response = templates.chat(text, chatResponse);
      break;

    case "irrelevant":
      // Ignore spam and irrelevant messages
      response = templates.irrelevant(text);
      break;

    default:
      // Fallback - process as event
      parsed = await parseTask(text, {
        functionId: options.fallbackParseFunctionId,
        metadata: {
          ...context.metadata,
          channel: context.channel,
          userId: context.userId,
          ...(context.chatId && { chatId: context.chatId }),
          ...(context.messageId && { messageId: context.messageId }),
        },
      });

      const fallbackTip = await advise(text, {
        functionId: options.fallbackAdviseFunctionId,
        metadata: {
          ...context.metadata,
          channel: context.channel,
          userId: context.userId,
          ...(context.chatId && { chatId: context.chatId }),
          ...(context.messageId && { messageId: context.messageId }),
        },
      });

      response = templates.fallback(text, fallbackTip);
  }

  return { response, parsed, model };
}
