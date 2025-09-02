/**
 * Простой и эффективный сервис форматирования ответов для Telegram
 * Использует HTML форматирование для максимальной совместимости
 */

export interface TelegramFormattingOptions {
  useEmojis?: boolean;
  useHTML?: boolean;
  addSeparators?: boolean;
  maxLineLength?: number;
  addContextInfo?: boolean;
  useColors?: boolean;
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
    addSeparators: true,
    maxLineLength: 80,
    addContextInfo: false,
    useColors: true,
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

    // 2. Применяем HTML форматирование (включая структуру текста)
    if (opts.useHTML) {
      formattedText = this.applyHTMLFormatting(formattedText, opts);
    }

    // 3. Проверяем длину строк
    formattedText = this.wrapLongLines(formattedText, opts.maxLineLength);

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
    formatted = this.formatHeaders(formatted);

    // 2. Форматируем списки
    formatted = this.formatSimpleLists(formatted);

    // 3. Добавляем переносы строк для лучшей читаемости
    formatted = this.addLineBreaks(formatted);

    return formatted;
  }

  /**
   * Форматирует только очевидные заголовки
   */
  private formatHeaders(text: string): string {
    // Ищем строки, которые выглядят как заголовки
    return text.replace(/^(.{3,50})$/gm, (match) => {
      // Если строка короткая и заканчивается двоеточием или не содержит знаков препинания
      if (match.length < 50 && (match.endsWith(":") || !/[.!?]/.test(match))) {
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
  private formatCodeBlocks(text: string): string {
    // Ищем строки, которые выглядят как код (содержат технические термины)
    // Но только те, которые ещё не обёрнуты в <code> теги
    const codePatterns = [
      /\b([A-Z_]{3,})\b/g, // Константы
      /\b([a-z]+\([^)]*\))/g, // Функции
      /\b(\d+\.\d+\.\d+)\b/g, // Версии
      /\b([A-Z][a-z]+[A-Z][a-z]+)\b/g, // CamelCase
    ];

    codePatterns.forEach((pattern) => {
      text = text.replace(pattern, (match, group) => {
        // Проверяем, не обёрнут ли уже в <code> тег
        if (text.includes(`<code>${group}</code>`)) {
          return match;
        }
        return `<code>${group}</code>`;
      });
    });

    return text;
  }

  /**
   * Форматирует цитаты
   */
  private formatQuotes(text: string): string {
    // Ищем строки в кавычках
    return text.replace(/"([^"]+)"/g, '<i>"$1"</i>');
  }

  /**
   * Добавляет переносы строк для лучшей читаемости
   */
  private addLineBreaks(text: string): string {
    // Добавляем переносы после заголовков
    text = text.replace(/(<b>[^<]+<\/b>)/g, "$1\n");

    // Убираем лишние пустые строки
    text = text.replace(/\n\n\n+/g, "\n\n");

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
      if (line && line.includes("<b>") && line.length < 50) {
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
   * Применяет HTML форматирование
   */
  private applyHTMLFormatting(
    text: string,
    options: Required<TelegramFormattingOptions>,
  ): string {
    let formatted = text;

    // 1. Форматируем структуру текста
    formatted = this.formatTextStructure(formatted, options);

    // 2. Форматируем важные части текста
    formatted = this.formatImportantParts(formatted);

    // 3. Форматируем технические термины
    formatted = this.formatTechnicalTerms(formatted);

    // 4. Добавляем цветовое выделение если включено
    if (options.useColors) {
      formatted = this.addColorHighlighting(formatted);
    }

    // 5. Форматируем ссылки
    formatted = this.formatLinks(formatted);

    // 6. Форматируем таблицы
    formatted = this.formatTables(formatted);

    return formatted;
  }

  /**
   * Форматирует важные части текста
   */
  private formatImportantParts(text: string): string {
    // Выделяем важные слова жирным
    const importantWords = [
      "важно",
      "внимание",
      "срочно",
      "критично",
      "успешно",
      "ошибка",
      "предупреждение",
    ];

    importantWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      text = text.replace(regex, `<b>${word}</b>`);
    });

    return text;
  }

  /**
   * Форматирует технические термины
   */
  private formatTechnicalTerms(text: string): string {
    // Выделяем технические термины моноширинным шрифтом
    const techTerms = [
      "API",
      "HTTP",
      "JSON",
      "XML",
      "SQL",
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "Java",
      "C++",
      "Git",
      "Docker",
      "Kubernetes",
    ];

    techTerms.forEach((term) => {
      // Экранируем специальные символы в термине для регулярного выражения
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedTerm}\\b`, "g");

      // Заменяем только если термин ещё не обёрнут в <code> тег
      text = text.replace(regex, (match) => {
        if (text.includes(`<code>${match}</code>`)) {
          return match;
        }
        return `<code>${match}</code>`;
      });
    });

    return text;
  }

  /**
   * Добавляет цветовое выделение
   */
  private addColorHighlighting(text: string): string {
    // Используем HTML-сущности для цветов (ограниченная поддержка в Telegram)
    // Зелёный для успеха
    text = text.replace(/✅/g, "🟢");
    // Красный для ошибок
    text = text.replace(/❌/g, "🔴");
    // Жёлтый для предупреждений
    text = text.replace(/⚠️/g, "🟡");
    // Синий для информации
    text = text.replace(/ℹ️/g, "🔵");

    return text;
  }

  /**
   * Форматирует ссылки
   */
  private formatLinks(text: string): string {
    // Ищем URL и оборачиваем их в HTML ссылки
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1">$1</a>');
  }

  /**
   * Форматирует таблицы
   */
  private formatTables(text: string): string {
    // Простое форматирование таблиц
    const lines = text.split("\n");
    const formattedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Если строка содержит разделители таблицы
      if (line && line.includes("|")) {
        const cells = line.split("|").map((cell) => cell.trim());
        const formattedCells = cells.map((cell) => `<code>${cell}</code>`);
        formattedLines.push(formattedCells.join(" | "));
      } else {
        formattedLines.push(line ?? "");
      }
    }

    return formattedLines.join("\n");
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
          useColors: true,
        };

      case "financial":
      case "financial-advisor":
        return {
          useEmojis: true,
          addSeparators: true,
          addContextInfo: true,
          useColors: true,
        };

      case "analytics":
      case "data-analyst":
        return {
          useEmojis: true,
          addSeparators: true,
          addContextInfo: true,
          useColors: true,
        };

      case "event":
      case "event-processor":
        return {
          useEmojis: true,
          addSeparators: true,
          addContextInfo: true,
          useColors: true,
        };

      case "task":
      case "task-manager":
        return {
          useEmojis: true,
          addSeparators: true,
          addContextInfo: false,
          useColors: true,
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
