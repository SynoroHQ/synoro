/**
 * Сервис форматирования ответов для Telegram
 * Делает сообщения красивыми и удобными для чтения пользователям
 */

export interface TelegramFormattingOptions {
  useEmojis?: boolean;
  useMarkdown?: boolean;
  addSeparators?: boolean;
  maxLineLength?: number;
  addContextInfo?: boolean;
}

export interface FormattedMessage {
  text: string;
  parse_mode?: "MarkdownV2" | "HTML";
  disable_web_page_preview?: boolean;
}

/**
 * Основной класс для форматирования ответов Telegram
 */
export class TelegramFormatter {
  private defaultOptions: Required<TelegramFormattingOptions> = {
    useEmojis: true,
    useMarkdown: true,
    addSeparators: true,
    maxLineLength: 80,
    addContextInfo: false,
  };

  constructor(options?: Partial<TelegramFormattingOptions>) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Форматирует ответ агента для Telegram
   */
  formatAgentResponse(
    response: string,
    options?: Partial<TelegramFormattingOptions>,
  ): FormattedMessage {
    const opts = { ...this.defaultOptions, ...options };

    if (!response || response.trim().length === 0) {
      return { text: "❌ Пустой ответ" };
    }

    let formattedText = response.trim();

    // 1. Добавляем эмодзи для разных типов контента
    if (opts.useEmojis) {
      formattedText = this.addContentEmojis(formattedText);
    }

    // 2. Форматируем структуру текста
    formattedText = this.formatTextStructure(formattedText, opts);

    // 3. Добавляем разделители
    if (opts.addSeparators) {
      formattedText = this.addSeparators(formattedText);
    }

    // 4. Добавляем контекстную информацию
    if (opts.addContextInfo) {
      formattedText = this.addContextInfo(formattedText);
    }

    // 5. Проверяем длину строк
    formattedText = this.wrapLongLines(formattedText, opts.maxLineLength);

    // 6. Определяем режим парсинга
    const parseMode = this.determineParseMode(formattedText, opts.useMarkdown);

    return {
      text:
        parseMode === "MarkdownV2"
          ? this.escapeMarkdownV2(formattedText)
          : formattedText,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    };
  }

  /**
   * Добавляет эмодзи для разных типов контента
   */
  private addContentEmojis(text: string): string {
    // Определяем тип контента по ключевым словам
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("ошибка") ||
      lowerText.includes("error") ||
      lowerText.includes("не удалось")
    ) {
      return `❌ ${text}`;
    }

    if (
      lowerText.includes("успешно") ||
      lowerText.includes("готово") ||
      lowerText.includes("завершено")
    ) {
      return `✅ ${text}`;
    }

    if (
      lowerText.includes("внимание") ||
      lowerText.includes("warning") ||
      lowerText.includes("важно")
    ) {
      return `⚠️ ${text}`;
    }

    if (
      lowerText.includes("информация") ||
      lowerText.includes("info") ||
      lowerText.includes("справка")
    ) {
      return `ℹ️ ${text}`;
    }

    if (lowerText.includes("вопрос") || lowerText.includes("question")) {
      return `❓ ${text}`;
    }

    if (
      lowerText.includes("ответ") ||
      lowerText.includes("answer") ||
      lowerText.includes("решение")
    ) {
      return `💡 ${text}`;
    }

    if (
      lowerText.includes("анализ") ||
      lowerText.includes("analysis") ||
      lowerText.includes("статистика")
    ) {
      return `📊 ${text}`;
    }

    if (lowerText.includes("событие") || lowerText.includes("event")) {
      return `📅 ${text}`;
    }

    if (
      lowerText.includes("финанс") ||
      lowerText.includes("деньги") ||
      lowerText.includes("бюджет")
    ) {
      return `💰 ${text}`;
    }

    if (lowerText.includes("задача") || lowerText.includes("task")) {
      return `📋 ${text}`;
    }

    // Если это обычный ответ без специальных ключевых слов
    return `💬 ${text}`;
  }

  /**
   * Форматирует структуру текста
   */
  private formatTextStructure(
    text: string,
    options: Required<TelegramFormattingOptions>,
  ): string {
    let formatted = text;

    // 1. Форматируем заголовки
    formatted = this.formatHeaders(formatted);

    // 2. Форматируем списки
    formatted = this.formatLists(formatted);

    // 3. Форматируем блоки кода
    formatted = this.formatCodeBlocks(formatted);

    // 4. Форматируем цитаты
    formatted = this.formatQuotes(formatted);

    // 5. Добавляем переносы строк для лучшей читаемости
    formatted = this.addLineBreaks(formatted);

    return formatted;
  }

  /**
   * Форматирует заголовки
   */
  private formatHeaders(text: string): string {
    // Ищем строки, которые выглядят как заголовки
    return text.replace(/^(.{3,50})$/gm, (match) => {
      // Если строка короткая и заканчивается двоеточием или не содержит знаков препинания
      if (match.length < 50 && (match.endsWith(":") || !/[.!?]/.test(match))) {
        return `**${match}**`;
      }
      return match;
    });
  }

  /**
   * Форматирует списки
   */
  private formatLists(text: string): string {
    // Форматируем маркированные списки
    text = text.replace(/^[-*•]\s+/gm, "• ");

    // Форматируем нумерованные списки
    text = text.replace(/^(\d+)\.\s+/gm, "$1\\. ");

    return text;
  }

  /**
   * Форматирует блоки кода
   */
  private formatCodeBlocks(text: string): string {
    // Ищем строки, которые выглядят как код (содержат технические термины)
    const codePatterns = [
      /\b[A-Z_]{3,}\b/g, // Константы
      /\b[a-z]+\([^)]*\)/g, // Функции
      /\b\d+\.\d+\.\d+\b/g, // Версии
      /\b[A-Z][a-z]+[A-Z][a-z]+\b/g, // CamelCase
    ];

    codePatterns.forEach((pattern) => {
      text = text.replace(pattern, (match) => `\`${match}\``);
    });

    return text;
  }

  /**
   * Форматирует цитаты
   */
  private formatQuotes(text: string): string {
    // Ищем строки в кавычках
    return text.replace(/"([^"]+)"/g, '> "$1"');
  }

  /**
   * Добавляет переносы строк для лучшей читаемости
   */
  private addLineBreaks(text: string): string {
    // Добавляем переносы после заголовков
    text = text.replace(/(\*\*[^*]+\*\*)/g, "$1\n");

    // Добавляем переносы между абзацами
    text = text.replace(/\n\n+/g, "\n\n");

    // Добавляем переносы после списков
    text = text.replace(/(• [^\n]+)\n/g, "$1\n\n");

    return text;
  }

  /**
   * Добавляет разделители
   */
  private addSeparators(text: string): string {
    const lines = text.split("\n");
    const formattedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line) {
        formattedLines.push(line);
      }

      // Добавляем разделитель после заголовков
      if (line && line.includes("**") && line.length < 50) {
        formattedLines.push("─".repeat(Math.min(line.length, 30)));
      }

      // Добавляем разделитель между основными секциями
      if (
        i < lines.length - 1 &&
        line &&
        (line.includes("💡") ||
          line.includes("📊") ||
          line.includes("📅") ||
          line.includes("💰"))
      ) {
        formattedLines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      }
    }

    return formattedLines.join("\n");
  }

  /**
   * Добавляет контекстную информацию
   */
  private addContextInfo(text: string): string {
    const timestamp = new Date().toLocaleString("ru-RU", {
      timeZone: "Europe/Moscow",
      hour12: false,
    });

    return `${text}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📅 ${timestamp}`;
  }

  /**
   * Переносит длинные строки
   */
  private wrapLongLines(text: string, maxLength: number): string {
    const lines = text.split("\n");
    const wrappedLines: string[] = [];

    for (const line of lines) {
      if (line.length <= maxLength) {
        wrappedLines.push(line);
      } else {
        // Разбиваем длинную строку на части
        const words = line.split(" ");
        let currentLine = "";

        for (const word of words) {
          if ((currentLine + word).length <= maxLength) {
            currentLine += (currentLine ? " " : "") + word;
          } else {
            if (currentLine) wrappedLines.push(currentLine);
            currentLine = word;
          }
        }

        if (currentLine) wrappedLines.push(currentLine);
      }
    }

    return wrappedLines.join("\n");
  }

  /**
   * Определяет режим парсинга
   */
  private determineParseMode(
    text: string,
    preferMarkdown: boolean,
  ): "MarkdownV2" | undefined {
    if (!preferMarkdown) return undefined;

    // Проверяем, содержит ли текст Markdown элементы
    const hasMarkdown = /\*\*|\*\*|`|>/.test(text);

    return hasMarkdown ? "MarkdownV2" : undefined;
  }

  /**
   * Экранирует специальные символы для MarkdownV2
   */
  private escapeMarkdownV2(text: string): string {
    const specialChars = [
      "_",
      "*",
      "[",
      "]",
      "(",
      ")",
      "~",
      "`",
      ">",
      "#",
      "+",
      "-",
      "=",
      "|",
      "{",
      "}",
      ".",
      "!",
    ];

    let escaped = text;
    for (const char of specialChars) {
      escaped = escaped.replace(new RegExp(`\\${char}`, "g"), `\\${char}`);
    }

    return escaped;
  }

  /**
   * Форматирует ответ для конкретного типа агента
   */
  formatAgentSpecificResponse(
    response: string,
    agentType: string,
    options?: Partial<TelegramFormattingOptions>,
  ): FormattedMessage {
    const agentOptions = this.getAgentSpecificOptions(agentType);
    const mergedOptions = {
      ...this.defaultOptions,
      ...agentOptions,
      ...options,
    };

    return this.formatAgentResponse(response, mergedOptions);
  }

  /**
   * Получает специфичные опции для типа агента
   */
  private getAgentSpecificOptions(
    agentType: string,
  ): Partial<TelegramFormattingOptions> {
    switch (agentType.toLowerCase()) {
      case "qa":
      case "qa-specialist":
        return {
          useEmojis: true,
          addSeparators: true,
          addContextInfo: false,
        };

      case "financial":
      case "financial-advisor":
        return {
          useEmojis: true,
          addSeparators: true,
          addContextInfo: true,
        };

      case "analytics":
      case "data-analyst":
        return {
          useEmojis: true,
          addSeparators: true,
          addContextInfo: true,
        };

      case "event":
      case "event-processor":
        return {
          useEmojis: true,
          addSeparators: true,
          addContextInfo: true,
        };

      case "task":
      case "task-manager":
        return {
          useEmojis: true,
          addSeparators: true,
          addContextInfo: false,
        };

      default:
        return {};
    }
  }
}

/**
 * Экспортируем экземпляр по умолчанию
 */
export const telegramFormatter = new TelegramFormatter();

/**
 * Утилитарные функции для быстрого форматирования
 */
export function formatForTelegram(
  response: string,
  options?: Partial<TelegramFormattingOptions>,
): FormattedMessage {
  return telegramFormatter.formatAgentResponse(response, options);
}

export function formatAgentResponse(
  response: string,
  agentType: string,
  options?: Partial<TelegramFormattingOptions>,
): FormattedMessage {
  return telegramFormatter.formatAgentSpecificResponse(
    response,
    agentType,
    options,
  );
}
