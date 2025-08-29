/**
 * Простой и эффективный сервис форматирования ответов для Telegram
 * Делает сообщения читабельными без лишних украшений
 */

export interface TelegramFormattingOptions {
  useEmojis?: boolean;
  useMarkdown?: boolean;
  maxLineLength?: number;
}

export interface FormattedMessage {
  text: string;
  parse_mode?: "MarkdownV2" | "HTML";
  disable_web_page_preview?: boolean;
}

/**
 * Простой класс для форматирования ответов Telegram
 */
export class TelegramFormatter {
  private defaultOptions: Required<TelegramFormattingOptions> = {
    useEmojis: true,
    useMarkdown: true,
    maxLineLength: 80,
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

    // 1. Добавляем простые эмодзи для основных типов контента
    if (opts.useEmojis) {
      formattedText = this.addSimpleEmojis(formattedText);
    }

    // 2. Форматируем структуру текста
    formattedText = this.formatTextStructure(formattedText, opts);

    // 3. Проверяем длину строк
    formattedText = this.wrapLongLines(formattedText, opts.maxLineLength);

    // 4. Определяем режим парсинга
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
   * Добавляет простые эмодзи для основных типов контента
   */
  private addSimpleEmojis(text: string): string {
    const lowerText = text.toLowerCase();

    // Только самые важные эмодзи - проверяем в порядке приоритета
    if (lowerText.includes("ошибка") || lowerText.includes("error")) {
      return `❌ ${text}`;
    }

    if (lowerText.includes("успешно") || lowerText.includes("готово")) {
      return `✅ ${text}`;
    }

    if (lowerText.includes("внимание") || lowerText.includes("важно")) {
      return `⚠️ ${text}`;
    }

    if (lowerText.includes("анализ") || lowerText.includes("статистика")) {
      return `📊 ${text}`;
    }

    if (lowerText.includes("финанс") || lowerText.includes("деньги")) {
      return `💰 ${text}`;
    }

    if (lowerText.includes("ответ") || lowerText.includes("решение")) {
      return `💡 ${text}`;
    }

    if (lowerText.includes("вопрос") || lowerText.includes("question")) {
      return `❓ ${text}`;
    }

    // Для обычных ответов не добавляем эмодзи
    return text;
  }

  /**
   * Форматирует структуру текста
   */
  private formatTextStructure(
    text: string,
    options: Required<TelegramFormattingOptions>,
  ): string {
    let formatted = text;

    // 1. Форматируем заголовки (только очевидные)
    formatted = this.formatSimpleHeaders(formatted);

    // 2. Форматируем списки
    formatted = this.formatSimpleLists(formatted);

    // 3. Добавляем переносы строк для лучшей читаемости
    formatted = this.addSimpleLineBreaks(formatted);

    return formatted;
  }

  /**
   * Форматирует только очевидные заголовки
   */
  private formatSimpleHeaders(text: string): string {
    // Только строки, которые явно выглядят как заголовки
    return text.replace(/^(.{3,40})$/gm, (match) => {
      // Если строка короткая, заканчивается двоеточием и не содержит знаков препинания
      if (
        match.length < 40 &&
        match.endsWith(":") &&
        !/[.!?]/.test(match) &&
        !match.includes("\n")
      ) {
        return `**${match}**`;
      }
      return match;
    });
  }

  /**
   * Форматирует списки
   */
  private formatSimpleLists(text: string): string {
    // Форматируем маркированные списки
    text = text.replace(/^[-*•]\s+/gm, "• ");

    // Форматируем нумерованные списки
    text = text.replace(/^(\d+)\.\s+/gm, "$1\\. ");

    return text;
  }

  /**
   * Добавляет простые переносы строк
   */
  private addSimpleLineBreaks(text: string): string {
    // Добавляем переносы после заголовков
    text = text.replace(/(\*\*[^*]+\*\*)/g, "$1\n");

    // Убираем лишние пустые строки
    text = text.replace(/\n\n\n+/g, "\n\n");

    return text;
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
    // 1) защитим инлайн‑код: `...`
    const parts = text.split(/(`[^`]*`)/g);
    const esc = (s: string) =>
      s
        // сохраняем наши маркеры **...** и цитаты в начале строки
        .replace(/\*\*([^*]+)\*\*/g, "§§$1§§")
        .replace(/^\s*> /gm, "§Q ")
        // экранируем спецсимволы, НО не трогаем `*`, '`' и '>' (наши маркеры)
        .replace(/[_\[\]()~#+\-=|{}.!]/g, "\\$&")
        // возвращаем маркеры
        .replace(/§§([^§]+)§§/g, "**$1**")
        .replace(/^§Q /gm, "> ");

    return parts
      .map((seg) => (seg.startsWith("`") && seg.endsWith("`") ? seg : esc(seg)))
      .join("");
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
          useMarkdown: true,
        };

      case "financial":
      case "financial-advisor":
        return {
          useEmojis: true,
          useMarkdown: true,
        };

      case "analytics":
      case "data-analyst":
        return {
          useEmojis: true,
          useMarkdown: true,
        };

      case "event":
      case "event-processor":
        return {
          useEmojis: true,
          useMarkdown: true,
        };

      case "task":
      case "task-manager":
        return {
          useEmojis: true,
          useMarkdown: true,
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
