import type { AgentTask, MessageHistoryItem } from "./types";

/**
 * Структурированный контекст для передачи между агентами
 * Следует best practices: инструкция + краткий контекст + последние шаги + задача
 */
export interface StructuredAgentContext {
  /** Инструкция (роль агента) */
  instruction: string;

  /** Краткий контекст (суммарно или извлечённо) */
  contextSummary: {
    conversationTopic: string;
    userIntent: string;
    keyInformation: string[];
    conversationMood: "positive" | "neutral" | "negative";
  };

  /** Последние шаги (несколько сообщений) */
  recentSteps: {
    userMessage: string;
    assistantResponse?: string;
    timestamp: Date;
    stepType: string;
  }[];

  /** Конкретная задача */
  currentTask: {
    input: string;
    type: string;
    priority: number;
    expectedOutput: string;
  };

  /** Метаданные для отладки */
  metadata: {
    conversationId?: string;
    userId?: string;
    channel?: string;
    contextVersion: string;
    compressedFrom: number; // количество исходных сообщений
  };
}

/**
 * Менеджер контекста для оптимизированной передачи между агентами
 * Реализует best practices для работы с контекстом диалога
 */
export class AgentContextManager {
  private readonly maxRecentSteps = 3;
  private readonly maxContextLength = 1000;
  private readonly contextVersion = "1.0";

  /**
   * Создает структурированный контекст из истории сообщений
   */
  createStructuredContext(
    task: AgentTask,
    agentName: string,
    agentDescription: string,
  ): StructuredAgentContext {
    const messageHistory = task.messageHistory ?? [];

    // 1. Создаем инструкцию для агента
    const instruction = this.createAgentInstruction(
      agentName,
      agentDescription,
    );

    // 2. Извлекаем краткий контекст
    const contextSummary = this.extractContextSummary(messageHistory);

    // 3. Получаем последние шаги
    const recentSteps = this.extractRecentSteps(messageHistory);

    // 4. Формируем текущую задачу
    const currentTask = this.createCurrentTask(task);

    return {
      instruction,
      contextSummary,
      recentSteps,
      currentTask,
      metadata: {
        conversationId: task.context?.metadata?.conversationId,
        userId: task.context?.userId,
        channel: task.context?.channel,
        contextVersion: this.contextVersion,
        compressedFrom: messageHistory.length,
      },
    };
  }

  /**
   * Создает инструкцию для агента (роль + описание)
   */
  private createAgentInstruction(
    agentName: string,
    agentDescription: string,
  ): string {
    return `Ты - ${agentName}.

${agentDescription}

ТВОЯ РОЛЬ:
- Обрабатывай запросы пользователя в соответствии со своей специализацией
- Используй предоставленный контекст для понимания ситуации
- Отвечай кратко и по делу
- Если нужна дополнительная информация - запроси её у пользователя

ПРАВИЛА:
1. Всегда учитывай контекст предыдущих сообщений
2. Будь последовательным в своих ответах
3. Если не уверен - лучше спросить уточнение
4. Сохраняй дружелюбный тон общения`;
  }

  /**
   * Извлекает краткий контекст из истории сообщений
   */
  private extractContextSummary(
    messageHistory: MessageHistoryItem[],
  ): StructuredAgentContext["contextSummary"] {
    if (messageHistory.length === 0) {
      return {
        conversationTopic: "Новый диалог",
        userIntent: "Неизвестно",
        keyInformation: [],
        conversationMood: "neutral",
      };
    }

    // Анализируем последние сообщения для понимания контекста
    const recentMessages = messageHistory.slice(-5);
    const userMessages = recentMessages.filter((msg) => msg.role === "user");
    const _assistantMessages = recentMessages.filter(
      (msg) => msg.role === "assistant",
    );

    // Извлекаем ключевую информацию
    const keyInformation = this.extractKeyInformation(recentMessages);

    // Определяем тему разговора
    const conversationTopic = this.extractConversationTopic(userMessages);

    // Определяем намерение пользователя
    const userIntent = this.extractUserIntent(userMessages);

    // Определяем настроение диалога
    const conversationMood = this.assessConversationMood(recentMessages);

    return {
      conversationTopic,
      userIntent,
      keyInformation,
      conversationMood,
    };
  }

  /**
   * Извлекает последние шаги диалога
   * Обрабатывает непарные сообщения, группируя последовательные сообщения от одного роля
   */
  private extractRecentSteps(
    messageHistory: MessageHistoryItem[],
  ): StructuredAgentContext["recentSteps"] {
    const recentMessages = messageHistory.slice(-this.maxRecentSteps * 3); // Увеличиваем буфер
    const steps: StructuredAgentContext["recentSteps"] = [];

    let i = 0;
    while (i < recentMessages.length && steps.length < this.maxRecentSteps) {
      const currentMessage = recentMessages[i];

      if (!currentMessage) {
        i++;
        continue;
      }

      if (currentMessage.role === "user") {
        // Группируем последовательные сообщения пользователя
        const userMessages = [currentMessage];
        let j = i + 1;

        while (
          j < recentMessages.length &&
          recentMessages[j]?.role === "user"
        ) {
          const msg = recentMessages[j];
          if (msg) {
            userMessages.push(msg);
          }
          j++;
        }

        // Объединяем сообщения пользователя в один шаг
        const combinedUserMessage = userMessages
          .map((msg) => msg.content)
          .join(" ");

        // Ищем ответ ассистента (если есть)
        let assistantResponse: string | undefined;
        if (
          j < recentMessages.length &&
          recentMessages[j]?.role === "assistant"
        ) {
          // Группируем последовательные сообщения ассистента
          const assistantMessages = [recentMessages[j]];
          let k = j + 1;

          while (
            k < recentMessages.length &&
            recentMessages[k]?.role === "assistant"
          ) {
            const msg = recentMessages[k];
            if (msg) {
              assistantMessages.push(msg);
            }
            k++;
          }

          assistantResponse = assistantMessages
            .map((msg) => msg?.content ?? "")
            .join(" ");

          i = k; // Переходим к следующему сообщению пользователя
        } else {
          i = j; // Переходим к следующему сообщению
        }

        steps.push({
          userMessage: combinedUserMessage,
          assistantResponse,
          timestamp: userMessages[0]?.timestamp ?? new Date(), // Используем время первого сообщения
          stepType: this.classifyStepType(combinedUserMessage),
        });
      } else {
        // Пропускаем сообщения ассистента без предшествующего сообщения пользователя
        i++;
      }
    }

    return steps;
  }

  /**
   * Создает описание текущей задачи
   */
  private createCurrentTask(
    task: AgentTask,
  ): StructuredAgentContext["currentTask"] {
    return {
      input: task.input,
      type: task.type,
      priority: task.priority,
      expectedOutput: this.inferExpectedOutput(task),
    };
  }

  /**
   * Извлекает ключевую информацию из сообщений
   */
  private extractKeyInformation(messages: MessageHistoryItem[]): string[] {
    const keyInfo: string[] = [];

    for (const message of messages) {
      const content = message.content.toLowerCase();

      // Извлекаем важные детали
      if (content.includes("имя") || content.includes("зовут")) {
        const nameMatch = /(?:меня зовут|имя|зовут)\s+([а-яё\s]+)/i.exec(
          message.content,
        );
        if (nameMatch) keyInfo.push(`Имя: ${nameMatch[1]?.trim()}`);
      }

      if (content.includes("возраст") || content.includes("лет")) {
        const ageMatch = /(\d+)\s*(?:лет|года)/i.exec(message.content);
        if (ageMatch) keyInfo.push(`Возраст: ${ageMatch[1]} лет`);
      }

      if (content.includes("работа") || content.includes("профессия")) {
        const workMatch = /(?:работаю|профессия|занимаюсь)\s+([а-яё\s]+)/i.exec(
          message.content,
        );
        if (workMatch) keyInfo.push(`Работа: ${workMatch[1]?.trim()}`);
      }

      if (content.includes("проблема") || content.includes("проблемы")) {
        keyInfo.push("Есть проблемы/задачи для решения");
      }

      if (content.includes("цель") || content.includes("хочу")) {
        keyInfo.push("Есть цели/желания");
      }
    }

    return keyInfo.slice(0, 5); // Ограничиваем количество
  }

  /**
   * Извлекает тему разговора
   */
  private extractConversationTopic(userMessages: MessageHistoryItem[]): string {
    if (userMessages.length === 0) return "Новый диалог";

    const topics = new Map<string, number>();

    for (const message of userMessages) {
      const content = message.content.toLowerCase();

      // Ключевые слова для определения темы
      const topicKeywords = {
        Работа: ["работа", "карьера", "профессия", "офис", "коллеги"],
        Здоровье: ["здоровье", "болезнь", "врач", "лечение", "боль"],
        Семья: ["семья", "дети", "родители", "муж", "жена", "родственники"],
        Финансы: ["деньги", "зарплата", "покупки", "траты", "бюджет"],
        Отдых: ["отпуск", "путешествие", "хобби", "развлечения"],
        Обучение: ["учеба", "курсы", "знания", "образование"],
      };

      for (const [topic, keywords] of Object.entries(topicKeywords)) {
        const matches = keywords.filter((keyword) =>
          content.includes(keyword),
        ).length;
        if (matches > 0) {
          topics.set(topic, (topics.get(topic) ?? 0) + matches);
        }
      }
    }

    if (topics.size === 0) return "Общее общение";

    return (
      Array.from(topics.entries()).sort(([, a], [, b]) => b - a)[0]?.[0] ??
      "Общее общение"
    );
  }

  /**
   * Извлекает намерение пользователя
   */
  private extractUserIntent(userMessages: MessageHistoryItem[]): string {
    if (userMessages.length === 0) return "Неизвестно";

    const lastMessage =
      userMessages[userMessages.length - 1]?.content.toLowerCase();

    if (!lastMessage) {
      return "Неизвестно";
    }

    if (lastMessage.includes("помоги") || lastMessage.includes("подскажи")) {
      return "Нужна помощь/совет";
    }

    if (lastMessage.includes("вопрос") || lastMessage.includes("?")) {
      return "Задает вопрос";
    }

    if (
      lastMessage.includes("проблема") ||
      lastMessage.includes("не получается")
    ) {
      return "Решает проблему";
    }

    if (lastMessage.includes("расскажи") || lastMessage.includes("объясни")) {
      return "Просит объяснение";
    }

    if (lastMessage.includes("спасибо") || lastMessage.includes("благодарю")) {
      return "Выражает благодарность";
    }

    return "Общается";
  }

  /**
   * Оценивает настроение диалога
   */
  private assessConversationMood(
    messages: MessageHistoryItem[],
  ): "positive" | "neutral" | "negative" {
    let positiveScore = 0;
    let negativeScore = 0;

    for (const message of messages) {
      const content = message.content.toLowerCase();

      // Позитивные индикаторы
      const positiveWords = [
        "спасибо",
        "отлично",
        "хорошо",
        "понятно",
        "да",
        "согласен",
      ];
      positiveScore += positiveWords.filter((word) =>
        content.includes(word),
      ).length;

      // Негативные индикаторы
      const negativeWords = [
        "плохо",
        "не получается",
        "проблема",
        "ошибка",
        "не понимаю",
      ];
      negativeScore += negativeWords.filter((word) =>
        content.includes(word),
      ).length;
    }

    if (positiveScore > negativeScore) return "positive";
    if (negativeScore > positiveScore) return "negative";
    return "neutral";
  }

  /**
   * Классифицирует тип шага в диалоге
   * Учитывает объединенные сообщения и их приоритет
   */
  private classifyStepType(content: string): string {
    const lowerContent = content.toLowerCase();

    // Приоритетная классификация для более точного определения типа
    if (lowerContent.includes("?")) return "question";
    if (
      lowerContent.includes("помоги") ||
      lowerContent.includes("подскажи") ||
      lowerContent.includes("как сделать")
    )
      return "help_request";
    if (lowerContent.includes("спасибо") || lowerContent.includes("благодарю"))
      return "gratitude";
    if (
      lowerContent.includes("привет") ||
      lowerContent.includes("здравствуй") ||
      lowerContent.includes("добрый")
    )
      return "greeting";
    if (
      lowerContent.includes("пока") ||
      lowerContent.includes("до свидания") ||
      lowerContent.includes("увидимся")
    )
      return "farewell";
    if (
      lowerContent.includes("проблема") ||
      lowerContent.includes("ошибка") ||
      lowerContent.includes("не работает")
    )
      return "problem_report";
    if (
      lowerContent.includes("хочу") ||
      lowerContent.includes("нужно") ||
      lowerContent.includes("требуется")
    )
      return "request";
    if (
      lowerContent.includes("да") ||
      lowerContent.includes("согласен") ||
      lowerContent.includes("хорошо")
    )
      return "agreement";
    if (
      lowerContent.includes("нет") ||
      lowerContent.includes("не согласен") ||
      lowerContent.includes("не подходит")
    )
      return "disagreement";

    return "statement";
  }

  /**
   * Выводит ожидаемый результат на основе типа задачи
   */
  private inferExpectedOutput(task: AgentTask): string {
    switch (task.type) {
      case "question":
        return "Подробный и полезный ответ на вопрос";
      case "event":
        return "Подтверждение записи события";
      case "chat":
        return "Дружелюбный ответ для поддержания диалога";
      case "complex_task":
        return "Структурированный план и выполнение задачи";
      default:
        return "Соответствующий ответ на запрос";
    }
  }

  /**
   * Форматирует структурированный контекст для передачи в промпт
   */
  formatContextForPrompt(context: StructuredAgentContext): string {
    const { instruction, contextSummary, recentSteps, currentTask } = context;

    let prompt = `${instruction}\n\n`;

    // Краткий контекст
    prompt += `КОНТЕКСТ ДИАЛОГА:\n`;
    prompt += `- Тема: ${contextSummary.conversationTopic}\n`;
    prompt += `- Намерение: ${contextSummary.userIntent}\n`;
    prompt += `- Настроение: ${contextSummary.conversationMood}\n`;

    if (contextSummary.keyInformation.length > 0) {
      prompt += `- Ключевая информация: ${contextSummary.keyInformation.join(", ")}\n`;
    }

    // Последние шаги
    if (recentSteps.length > 0) {
      prompt += `\nПОСЛЕДНИЕ ШАГИ:\n`;
      recentSteps.forEach((step, index) => {
        prompt += `${index + 1}. [${step.timestamp.toLocaleTimeString()}] Пользователь: ${step.userMessage}\n`;
        if (step.assistantResponse) {
          prompt += `   Ответ: ${step.assistantResponse}\n`;
        }
      });
    }

    // Текущая задача
    prompt += `\nТЕКУЩАЯ ЗАДАЧА:\n`;
    prompt += `- Запрос: ${currentTask.input}\n`;
    prompt += `- Тип: ${currentTask.type}\n`;
    prompt += `- Ожидаемый результат: ${currentTask.expectedOutput}\n`;

    return prompt;
  }

  /**
   * Создает сжатую версию контекста для агентов с ограниченным контекстом
   */
  createCompressedContext(
    context: StructuredAgentContext,
    maxLength = 500,
  ): string {
    const { instruction, contextSummary, currentTask } = context;

    let compressed = `${instruction}\n\n`;
    compressed += `Контекст: ${contextSummary.conversationTopic}, ${contextSummary.userIntent}\n`;

    if (contextSummary.keyInformation.length > 0) {
      compressed += `Ключевое: ${contextSummary.keyInformation.slice(0, 2).join(", ")}\n`;
    }

    compressed += `Задача: ${currentTask.input}`;

    if (compressed.length > maxLength) {
      compressed = compressed.substring(0, maxLength - 3) + "...";
    }

    return compressed;
  }

  /**
   * Валидирует корректность извлечения шагов для различных сценариев
   * Полезно для тестирования и отладки
   */
  validateStepExtraction(messageHistory: MessageHistoryItem[]): {
    isValid: boolean;
    issues: string[];
    extractedSteps: number;
    totalMessages: number;
  } {
    const issues: string[] = [];
    const steps = this.extractRecentSteps(messageHistory);

    // Проверяем, что все шаги имеют сообщения пользователя
    const stepsWithoutUserMessage = steps.filter(
      (step) => !step.userMessage || step.userMessage.trim() === "",
    );
    if (stepsWithoutUserMessage.length > 0) {
      issues.push(
        `Найдено ${stepsWithoutUserMessage.length} шагов без сообщения пользователя`,
      );
    }

    // Проверяем, что временные метки корректны
    const stepsWithInvalidTimestamp = steps.filter(
      (step) => !step.timestamp || isNaN(step.timestamp.getTime()),
    );
    if (stepsWithInvalidTimestamp.length > 0) {
      issues.push(
        `Найдено ${stepsWithInvalidTimestamp.length} шагов с некорректной временной меткой`,
      );
    }

    // Проверяем, что типы шагов определены
    const stepsWithoutType = steps.filter(
      (step) => !step.stepType || step.stepType === "",
    );
    if (stepsWithoutType.length > 0) {
      issues.push(
        `Найдено ${stepsWithoutType.length} шагов без определенного типа`,
      );
    }

    // Проверяем, что не потеряли слишком много сообщений
    const userMessages = messageHistory.filter((msg) => msg.role === "user");
    const extractedUserMessages = steps.length;
    const messageLossRatio =
      userMessages.length > 0
        ? (userMessages.length - extractedUserMessages) / userMessages.length
        : 0;

    if (messageLossRatio > 0.5) {
      issues.push(
        `Потеряно ${Math.round(messageLossRatio * 100)}% сообщений пользователя`,
      );
    }

    return {
      isValid: issues.length === 0,
      issues,
      extractedSteps: steps.length,
      totalMessages: messageHistory.length,
    };
  }
}

// Экспортируем типы для использования в других модулях
