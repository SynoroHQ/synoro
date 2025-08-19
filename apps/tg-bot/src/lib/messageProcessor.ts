import { advise, answerQuestion, parseTask } from "../services/ai-service";

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
  parsed: unknown | null;
}

export async function processClassifiedMessage(
  text: string,
  messageType: any,
  telemetryBase: any,
  options: MessageProcessorOptions,
): Promise<ProcessClassifiedMessageResult> {
  let response = "";
  let parsed: unknown = null;

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
        metadata: telemetryBase,
      });
      response = templates.question(text, answer);
      break;

    case "event":
      // Process event: parse and provide advice
      parsed = await parseTask(text, {
        functionId: options.parseFunctionId,
        metadata: telemetryBase,
      });

      const tip = await advise(text, {
        functionId: options.adviseFunctionId,
        metadata: telemetryBase,
      });

      response = templates.event(text, tip);
      break;

    case "chat":
      // Simple conversation - provide friendly response
      const chatResponse = await answerQuestion(text, messageType, {
        functionId: options.chatFunctionId,
        metadata: telemetryBase,
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
        metadata: telemetryBase,
      });

      const fallbackTip = await advise(text, {
        functionId: options.fallbackAdviseFunctionId,
        metadata: telemetryBase,
      });

      response = templates.fallback(text, fallbackTip);
  }

  return { response, parsed };
}
