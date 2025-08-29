/**
 * Простой и эффективный сервис форматирования ответов для Telegram
 * Использует HTML форматирование для максимальной совместимости
 */

export interface TelegramFormattingOptions {
  useEmojis?: boolean;
  useHTML?: boolean;
  maxLineLength?: number;
}

export interface FormattedMessage {
  text: string;
  parse_mode?: "HTML";
  disable_web_page_preview?: boolean;
}

/**
 * Простой класс для форматирования ответов Telegram
 */
export class TelegramFormatter {
  private defaultOptions: Required<TelegramFormattingOptions> = {
    useEmojis: true,
    useHTML: true,
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

    // 4. Применяем HTML форматирование
    if (opts.useHTML) {
      formattedText = this.applyHTMLFormatting(formattedText);
    }

    return {
      text: formattedText,
      parse_mode: opts.useHTML ? "HTML" : undefined,
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
        return `<b>${match}</b>`;
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
    text = text.replace(/^(\d+)\.\s+/gm, "$1. ");

    return text;
  }

  /**
   * Добавляет простые переносы строк
   */
  private addSimpleLineBreaks(text: string): string {
    // Добавляем переносы после заголовков
    text = text.replace(/(<b>[^<]+<\/b>)/g, "$1\n");

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
   * Применяет HTML форматирование для Telegram
   */
  private applyHTMLFormatting(text: string): string {
    let formatted = text;

    // 1. Заменяем Markdown заголовки на HTML (если они есть)
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");

    // 2. Форматируем код
    formatted = this.formatHTMLCode(formatted);

    // 3. Форматируем ссылки (если они есть)
    formatted = this.formatHTMLLinks(formatted);

    // 4. Экранируем HTML символы
    formatted = this.escapeHTML(formatted);

    return formatted;
  }

  /**
   * Форматирует код в HTML
   */
  private formatHTMLCode(text: string): string {
    // Инлайн код
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Блоки кода (если есть)
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    });

    return text;
  }

  /**
   * Форматирует ссылки в HTML
   */
  private formatHTMLLinks(text: string): string {
    // Простые URL ссылки
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    text = text.replace(urlRegex, '<a href="$1">$1</a>');

    return text;
  }

  /**
   * Экранирует HTML символы
   */
  private escapeHTML(text: string): string {
    // Защищаем HTML теги от экранирования
    const parts = text.split(/(<[^>]+>)/g);

    return parts
      .map((part, index) => {
        // Если это HTML тег (четные индексы), не экранируем
        if (index % 2 === 1) {
          return part;
        }

        // Если это обычный текст, экранируем только амперсанд
        return part.replace(/&/g, "&amp;");
      })
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
          useHTML: true,
        };

      case "financial":
      case "financial-advisor":
        return {
          useEmojis: true,
          useHTML: true,
        };

      case "analytics":
      case "data-analyst":
        return {
          useEmojis: true,
          useHTML: true,
        };

      case "event":
      case "event-processor":
        return {
          useEmojis: true,
          useHTML: true,
        };

      case "task":
      case "task-manager":
        return {
          useEmojis: true,
          useHTML: true,
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
