/**
 * Утилиты для построения красивых HTML сообщений в Telegram
 */

export interface HTMLMessageOptions {
  title?: string;
  subtitle?: string;
  content: string;
  footer?: string;
  useEmojis?: boolean;
  useColors?: boolean;
  compact?: boolean;
}

export interface HTMLTableOptions {
  headers: string[];
  rows: string[][];
  title?: string;
  compact?: boolean;
}

export interface HTMLListOptions {
  items: string[];
  title?: string;
  type?: "bullet" | "numbered";
  compact?: boolean;
}

/**
 * Класс для построения HTML сообщений
 */
export class HTMLMessageBuilder {
  /**
   * Создаёт заголовок сообщения
   */
  static createHeader(
    title: string,
    subtitle?: string,
    useEmojis = true,
  ): string {
    const emoji = useEmojis ? "📋 " : "";
    let header = `<b>${emoji}${title}</b>`;

    if (subtitle) {
      header += `\n<i>${subtitle}</i>`;
    }

    return header;
  }

  /**
   * Создаёт разделитель
   */
  static createSeparator(length = 40, char = "━"): string {
    return char.repeat(length);
  }

  /**
   * Создаёт блок с информацией
   */
  static createInfoBlock(
    content: string,
    icon = "ℹ️",
    useEmojis = true,
  ): string {
    const emoji = useEmojis ? `${icon} ` : "";
    return `${emoji}${content}`;
  }

  /**
   * Создаёт блок с предупреждением
   */
  static createWarningBlock(content: string, useEmojis = true): string {
    return this.createInfoBlock(content, "⚠️", useEmojis);
  }

  /**
   * Создаёт блок с ошибкой
   */
  static createErrorBlock(content: string, useEmojis = true): string {
    return this.createInfoBlock(content, "❌", useEmojis);
  }

  /**
   * Создаёт блок с успехом
   */
  static createSuccessBlock(content: string, useEmojis = true): string {
    return this.createInfoBlock(content, "✅", useEmojis);
  }

  /**
   * Создаёт блок с вопросом
   */
  static createQuestionBlock(content: string, useEmojis = true): string {
    return this.createInfoBlock(content, "❓", useEmojis);
  }

  /**
   * Создаёт блок с ответом
   */
  static createAnswerBlock(content: string, useEmojis = true): string {
    return this.createInfoBlock(content, "💡", useEmojis);
  }

  /**
   * Создаёт таблицу
   */
  static createTable(options: HTMLTableOptions): string {
    const { headers, rows, title, compact = false } = options;

    let table = "";

    if (title) {
      table += `<b>${title}</b>\n`;
    }

    // Заголовки
    const headerRow = headers
      .map((header) => `<code>${header}</code>`)
      .join(" | ");
    table += `${headerRow}\n`;

    // Разделитель
    const separator = compact ? "─" : "━";
    table += `${separator.repeat(headers.join(" | ").length)}\n`;

    // Строки данных
    rows.forEach((row) => {
      const formattedRow = row
        .map((cell) => `<code>${cell}</code>`)
        .join(" | ");
      table += `${formattedRow}\n`;
    });

    return table;
  }

  /**
   * Создаёт список
   */
  static createList(options: HTMLListOptions): string {
    const { items, title, type = "bullet", compact = false } = options;

    let list = "";

    if (title) {
      list += `<b>${title}</b>\n`;
    }

    const bullet = type === "bullet" ? "•" : "";

    items.forEach((item, index) => {
      const prefix = type === "numbered" ? `${index + 1}.` : bullet;
      const spacing = compact ? " " : "  ";
      list += `${prefix}${spacing}${item}\n`;
    });

    return list;
  }

  /**
   * Создаёт блок кода
   */
  static createCodeBlock(
    code: string,
    language?: string,
    title?: string,
  ): string {
    let block = "";

    if (title) {
      block += `<b>${title}</b>\n`;
    }

    if (language) {
      block += `<i>${language}</i>\n`;
    }

    block += `<pre><code>${code}</code></pre>`;

    return block;
  }

  /**
   * Создаёт ссылку
   */
  static createLink(url: string, text?: string): string {
    const linkText = text || url;
    return `<a href="${url}">${linkText}</a>`;
  }

  /**
   * Создаёт полное сообщение
   */
  static createMessage(options: HTMLMessageOptions): string {
    const {
      title,
      subtitle,
      content,
      footer,
      useEmojis = true,
      useColors = true,
      compact = false,
    } = options;

    let message = "";

    // Заголовок
    if (title) {
      message += this.createHeader(title, subtitle, useEmojis);
      message += "\n\n";
    }

    // Содержимое
    message += content;

    // Разделитель перед футером
    if (footer) {
      const separator = compact ? "─" : "━";
      message += `\n\n${separator.repeat(30)}\n`;
      message += footer;
    }

    return message;
  }

  /**
   * Создаёт сообщение с результатом анализа
   */
  static createAnalysisResult(
    title: string,
    summary: string,
    details: string[],
    recommendations?: string[],
  ): string {
    let message = this.createHeader(title);
    message += "\n\n";

    // Краткое резюме
    message += this.createInfoBlock(summary, "📊");
    message += "\n\n";

    // Детали
    if (details.length > 0) {
      message += this.createList({
        items: details,
        title: "📋 Детали:",
        type: "bullet",
      });
      message += "\n";
    }

    // Рекомендации
    if (recommendations && recommendations.length > 0) {
      message += this.createList({
        items: recommendations,
        title: "💡 Рекомендации:",
        type: "bullet",
      });
    }

    return message;
  }

  /**
   * Создаёт сообщение с финансовой информацией
   */
  static createFinancialInfo(
    title: string,
    amount: string,
    currency: string,
    details: Record<string, string>,
    trend?: "up" | "down" | "stable",
  ): string {
    let message = this.createHeader(title);
    message += "\n\n";

    // Сумма с трендом
    const trendEmoji = trend === "up" ? "📈" : trend === "down" ? "📉" : "➡️";
    message += `${trendEmoji} <b>${amount} ${currency}</b>\n\n`;

    // Детали
    Object.entries(details).forEach(([key, value]) => {
      message += `<b>${key}:</b> ${value}\n`;
    });

    return message;
  }

  /**
   * Создаёт сообщение с задачей
   */
  static createTaskInfo(
    title: string,
    description: string,
    priority: "high" | "medium" | "low",
    deadline?: string,
    assignee?: string,
  ): string {
    const priorityEmojis = {
      high: "🔴",
      medium: "🟡",
      low: "🟢",
    };

    let message = this.createHeader(title);
    message += "\n\n";

    // Приоритет
    message += `${priorityEmojis[priority]} <b>Приоритет:</b> ${priority}\n`;

    // Описание
    message += `📝 ${description}\n\n`;

    // Дедлайн
    if (deadline) {
      message += `⏰ <b>Дедлайн:</b> ${deadline}\n`;
    }

    // Исполнитель
    if (assignee) {
      message += `👤 <b>Исполнитель:</b> ${assignee}\n`;
    }

    return message;
  }
}

/**
 * Утилитарные функции для быстрого создания сообщений
 */
export function createSimpleMessage(content: string, title?: string): string {
  return HTMLMessageBuilder.createMessage({ content, title });
}

export function createInfoMessage(content: string, title?: string): string {
  return HTMLMessageBuilder.createMessage({
    content: HTMLMessageBuilder.createInfoBlock(content),
    title,
  });
}

export function createErrorMessage(content: string, title?: string): string {
  return HTMLMessageBuilder.createMessage({
    content: HTMLMessageBuilder.createErrorBlock(content),
    title,
  });
}

export function createSuccessMessage(content: string, title?: string): string {
  return HTMLMessageBuilder.createMessage({
    content: HTMLMessageBuilder.createSuccessBlock(content),
    title,
  });
}
