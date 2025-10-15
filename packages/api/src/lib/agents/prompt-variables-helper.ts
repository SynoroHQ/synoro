import type { AgentTask } from "./types";

/**
 * Форматирует историю сообщений для промпта
 */
function formatMessageHistory(task: AgentTask): string {
  if (!task.messageHistory || task.messageHistory.length === 0) {
    return "История диалога пуста";
  }

  // Фильтруем только сообщения пользователя
  const userMessages = task.messageHistory.filter((msg) => msg.role === "user");

  if (userMessages.length === 0) {
    return "История диалога пуста";
  }

  const formattedMessages = userMessages.map((msg) => {
    const timestamp = msg.timestamp.toLocaleString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `[${timestamp}] Пользователь: ${msg.content}`;
  });

  return formattedMessages.join("\n");
}

/**
 * Подготавливает все переменные для Langfuse prompt.compile()
 * @param task - задача агента
 * @param additionalVariables - дополнительные переменные (например, eventContext)
 * @returns объект с переменными для compile()
 */
export function preparePromptVariables(
  task: AgentTask,
  additionalVariables?: Record<string, string>,
): Record<string, string> {
  const variables: Record<string, string> = {
    // Базовые переменные контекста
    userId: String(task.context.userId ?? "anonymous"),
    householdId: String(task.context.householdId ?? "none"),
    currentTime: new Date().toISOString(),
    timezone: String(task.context.timezone ?? "UTC"),

    // История сообщений
    messageHistory: formatMessageHistory(task),

    // Контекст событий
    eventContext:
      typeof task.context.eventContext === "string"
        ? task.context.eventContext
        : "События пользователя не загружены",
  };

  // Добавляем дополнительные переменные если есть
  if (additionalVariables) {
    Object.assign(variables, additionalVariables);
  }

  // Логируем для отладки
  if (process.env.DEBUG_PROMPTS === "true") {
    console.log("Prepared prompt variables:", {
      userId: variables.userId,
      householdId: variables.householdId,
      timezone: variables.timezone,
      hasMessageHistory: task.messageHistory && task.messageHistory.length > 0,
      messageHistoryCount: task.messageHistory?.length ?? 0,
      hasEventContext: !!task.context.eventContext,
    });
  }

  return variables;
}
