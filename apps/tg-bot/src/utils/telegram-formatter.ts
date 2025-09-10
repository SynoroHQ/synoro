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

/**
 * Оптимальные настройки форматирования для Telegram
 */
export const OPTIMAL_TELEGRAM_FORMATTING: Required<TelegramFormattingOptions> =
  {
    useEmojis: true,
    useHTML: true,
    addSeparators: false,
    maxLineLength: 100,
    addContextInfo: false,
    useColors: false,
  };

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
    addSeparators: false, // Убираем разделители для более чистого вида
    maxLineLength: 100, // Увеличиваем длину строк для лучшей читаемости
    addContextInfo: false,
    useColors: false, // Отключаем цвета для лучшей совместимости
  };


  constructor(options?: Partial<TelegramFormattingOptions>) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Создает регулярное выражение
   */
  private getRegex(pattern: string, flags?: string): RegExp {
    return new RegExp(pattern, flags);
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

    // Валидируем HTML если используется HTML режим
    if (opts.useHTML && !this.validateHTMLTags(formattedText)) {
      console.warn(
        "HTML validation failed in TelegramFormatter, falling back to plain text",
      );
      formattedText = formattedText.replace(/<[^>]*>/g, ""); // Удаляем все HTML теги
    }

    return {
      text: formattedText,
      parse_mode: opts.useHTML ? "HTML" : undefined,
      disable_web_page_preview: true,
    };
  }

  /**
   * Валидирует HTML теги в тексте
   */
  private validateHTMLTags(text: string): boolean {
    const tagStack: string[] = [];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    let match;

    while ((match = tagRegex.exec(text)) !== null) {
      const fullTag = match[0];
      const tagName = match[1].toLowerCase();

      // Пропускаем самозакрывающиеся теги
      if (fullTag.endsWith("/>")) {
        continue;
      }

      if (fullTag.startsWith("</")) {
        // Закрывающий тег
        if (
          tagStack.length === 0 ||
          tagStack[tagStack.length - 1] !== tagName
        ) {
          console.warn(
            `HTML validation failed: unmatched closing tag </${tagName}>`,
          );
          return false;
        }
        tagStack.pop();
      } else {
        // Открывающий тег
        tagStack.push(tagName);
      }
    }

    if (tagStack.length > 0) {
      console.warn(
        `HTML validation failed: unclosed tags: ${tagStack.join(", ")}`,
      );
      return false;
    }

    return true;
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
   * Форматирует заголовки в HTML
   */
  private formatHeaders(text: string): string {
    // Форматируем заголовки с # (конвертируем в HTML)
    const headerRegex = this.getRegex("^#{1,6}\\s+(.+)$", "gm");
    text = text.replace(headerRegex, (match, content) => {
      const level = match.match(/^#+/)?.[0].length || 1;
      return `<b>${content.trim()}</b>`;
    });

    // Форматируем заголовки с ** (жирный текст)
    const boldRegex = this.getRegex("^\\*\\*(.+)\\*\\*$", "gm");
    text = text.replace(boldRegex, "<b>$1</b>");

    // Ищем строки, которые выглядят как заголовки (короткие, без знаков препинания в конце)
    const shortLineRegex = this.getRegex("^(.{3,50})$", "gm");
    const punctuationRegex = this.getRegex("[.!?]");
    text = text.replace(shortLineRegex, (match) => {
      const trimmed = match.trim();
      // Если строка короткая, заканчивается двоеточием или не содержит знаков препинания
      if (
        trimmed.length < 50 &&
        (trimmed.endsWith(":") || !punctuationRegex.test(trimmed))
      ) {
        return `<b>${trimmed}</b>`;
      }
      return match;
    });

    return text;
  }

  /**
   * Форматирует списки в HTML
   */
  private formatSimpleLists(text: string): string {
    // Форматируем маркированные списки
    text = text.replace(/^[-*•]\s+(.+)$/gm, "• $1");

    // Форматируем нумерованные списки
    text = text.replace(/^(\d+)\.\s+(.+)$/gm, "$1. $2");

    // Форматируем вложенные списки
    text = text.replace(/^(\s+)[-*•]\s+(.+)$/gm, "$1  • $2");

    return text;
  }

  /**
   * Форматирует код блоки в HTML
   */
  private formatCodeBlocks(text: string): string {
    // Форматируем блоки кода с ```
    const codeBlockRegex = this.getRegex("```(\\w+)?\\n([\\s\\S]*?)```", "g");
    text = text.replace(codeBlockRegex, (match, lang, code) => {
      const trimmedCode = code.trim();
      return `<pre><code>${trimmedCode}</code></pre>`;
    });

    // Форматируем инлайн код с `
    const inlineCodeRegex = this.getRegex("`([^`]+)`", "g");
    text = text.replace(inlineCodeRegex, "<code>$1</code>");

    // Форматируем строки, которые выглядят как код (только если не в тегах)
    const codePatterns = [
      this.getRegex("\\b([A-Z_]{3,})\\b", "g"), // Константы
      this.getRegex("\\b([a-z]+\\([^)]*\\))", "g"), // Функции
      this.getRegex("\\b(\\d+\\.\\d+\\.\\d+)\\b", "g"), // Версии
      this.getRegex("\\b([A-Z][a-z]+[A-Z][a-z]+)\\b", "g"), // CamelCase
    ];

    const openTagRegex = this.getRegex("<[^>]*>", "g");
    const closeTagRegex = this.getRegex("</[^>]*>", "g");

    codePatterns.forEach((pattern) => {
      text = text.replace(pattern, (match, group) => {
        // Проверяем, не находится ли уже внутри HTML тегов
        const beforeMatch = text.substring(0, text.indexOf(match));
        const openTags = (beforeMatch.match(openTagRegex) || []).length;
        const closeTags = (beforeMatch.match(closeTagRegex) || []).length;

        // Если мы внутри тега, не форматируем
        if (openTags > closeTags) {
          return match;
        }

        return `<code>${group}</code>`;
      });
    });

    return text;
  }

  /**
   * Форматирует цитаты в HTML
   */
  private formatQuotes(text: string): string {
    // Форматируем блоки цитат с >
    text = text.replace(/^>\s*(.+)$/gm, "<i>$1</i>");

    // Ищем строки в кавычках
    text = text.replace(/"([^"]+)"/g, '<i>"$1"</i>');

    return text;
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

    // 1. Экранируем HTML символы в начале
    formatted = this.escapeHtmlCharacters(formatted);

    // 2. Форматируем код блоки (до других форматирований)
    formatted = this.formatCodeBlocks(formatted);

    // 3. Форматируем структуру текста
    formatted = this.formatTextStructure(formatted, options);

    // 4. Форматируем важные части текста
    formatted = this.formatImportantParts(formatted);

    // 5. Форматируем технические термины
    formatted = this.formatTechnicalTerms(formatted);

    // 6. Форматируем цитаты
    formatted = this.formatQuotes(formatted);

    // 7. Добавляем цветовое выделение если включено
    if (options.useColors) {
      formatted = this.addColorHighlighting(formatted);
    }

    // 8. Форматируем ссылки
    formatted = this.formatLinks(formatted);

    // 9. Форматируем таблицы
    formatted = this.formatTables(formatted);

    // 10. Добавляем разделители если включено
    if (options.addSeparators) {
      formatted = this.addSeparators(formatted);
    }

    // 11. Добавляем контекстную информацию если включено
    if (options.addContextInfo) {
      formatted = this.addContextInfo(formatted);
    }

    return formatted;
  }

  /**
   * Экранирует HTML символы для безопасного отображения
   */
  private escapeHtmlCharacters(text: string): string {
    // Экранируем только те символы, которые не находятся внутри HTML тегов
    const parts = text.split(/(<[^>]+>)/g);
    return parts
      .map((part, index) => {
        // Если это HTML тег (нечетные индексы), не экранируем
        if (index % 2 === 1) {
          return part;
        }

        // Если это обычный текст, экранируем HTML символы
        return part
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      })
      .join("");
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
    const urlRegex = /(https?:\/\/[^\s<>]+)/g;
    return text.replace(urlRegex, (url) => {
      // Проверяем, не находится ли URL уже внутри HTML тегов
      const beforeUrl = text.substring(0, text.indexOf(url));
      const openTags = (beforeUrl.match(/<[^>]*>/g) || []).length;
      const closeTags = (beforeUrl.match(/<\/[^>]*>/g) || []).length;

      // Если мы внутри тега, не форматируем
      if (openTags > closeTags) {
        return url;
      }

      return `<a href="${url}">${url}</a>`;
    });
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
