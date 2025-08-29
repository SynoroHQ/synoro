/**
 * 🚀 Fast Response System - Система быстрых ответов
 *
 * Обеспечивает мгновенную реакцию на сообщения пользователя
 * с последующей обработкой через мультиагентов при необходимости
 */

export interface FastResponse {
  shouldSendFast: boolean;
  fastResponse: string;
  needsFullProcessing: boolean;
  processingType?: "agents" | "simple" | "none";
}

export interface FastResponseRule {
  pattern: string | RegExp;
  response: string;
  confidence: number;
  needsFullProcessing: boolean;
}

export class FastResponseSystem {
  private rules: FastResponseRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Инициализация правил быстрых ответов
   */
  private initializeDefaultRules() {
    this.rules = [
      // Приветствия
      {
        pattern:
          /^(привет|здравствуй|hi|hello|добрый день|доброе утро|добрый вечер)/i,
        response: "👋 Привет! Чем могу помочь?",
        confidence: 0.9,
        needsFullProcessing: false,
      },
      // Благодарности
      {
        pattern: /^(спасибо|благодарю|thanks|thank you|сенкс)/i,
        response: "🙏 Рад был помочь!",
        confidence: 0.95,
        needsFullProcessing: false,
      },
      // Прощания
      {
        pattern: /^(пока|до свидания|до встречи|bye|goodbye|увидимся)/i,
        response: "👋 До встречи! Буду рад помочь снова!",
        confidence: 0.9,
        needsFullProcessing: false,
      },
      // Статус/состояние
      {
        pattern: /^(как дела|как ты|как жизнь|how are you|how is it going)/i,
        response: "😊 Спасибо, у меня все отлично! Готов помогать вам!",
        confidence: 0.8,
        needsFullProcessing: false,
      },
      // Простые вопросы о возможностях
      {
        pattern: /^(что умеешь|что можешь|помощь|help|возможности)/i,
        response:
          "🤖 Я умею:\n• Отвечать на вопросы\n• Обрабатывать события\n• Помогать с задачами\n• Анализировать данные\n\nПросто опишите, что вам нужно!",
        confidence: 0.85,
        needsFullProcessing: false,
      },
      // Короткие подтверждения
      {
        pattern: /^(да|нет|ок|хорошо|понятно|ясно|согласен|не согласен)/i,
        response: "👍 Понял!",
        confidence: 0.7,
        needsFullProcessing: false,
      },
      // Вопросы о времени
      {
        pattern: /^(который час|время|what time|сколько времени)/i,
        response: `🕐 Текущее время: ${new Date().toLocaleTimeString("ru-RU")}`,
        confidence: 0.9,
        needsFullProcessing: false,
      },
      // Вопросы о дате
      {
        pattern: /(какая дата|сегодня|какое число|what date|today)/i,
        response: `📅 Сегодня: ${new Date().toLocaleDateString("ru-RU", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        confidence: 0.9,
        needsFullProcessing: false,
      },
    ];
  }

  /**
   * Анализ сообщения и определение быстрого ответа
   */
  analyzeMessage(message: string): FastResponse {
    const normalizedMessage = message.trim().toLowerCase();

    // Ищем подходящее правило
    for (const rule of this.rules) {
      if (typeof rule.pattern === "string") {
        if (normalizedMessage.includes(rule.pattern.toLowerCase())) {
          return {
            shouldSendFast: true,
            fastResponse: rule.response,
            needsFullProcessing: rule.needsFullProcessing,
            processingType: rule.needsFullProcessing ? "agents" : "simple",
          };
        }
      } else {
        if (rule.pattern.test(normalizedMessage)) {
          return {
            shouldSendFast: true,
            fastResponse: rule.response,
            needsFullProcessing: rule.needsFullProcessing,
            processingType: rule.needsFullProcessing ? "agents" : "simple",
          };
        }
      }
    }

    // Если не нашли правило, отправляем на полную обработку
    return {
      shouldSendFast: false,
      fastResponse: "",
      needsFullProcessing: true,
      processingType: "agents",
    };
  }

  /**
   * Добавление нового правила
   */
  addRule(rule: FastResponseRule) {
    this.rules.push(rule);
  }

  /**
   * Удаление правила по паттерну
   */
  removeRule(pattern: string | RegExp) {
    this.rules = this.rules.filter((rule) => {
      if (typeof rule.pattern === "string" && typeof pattern === "string") {
        return rule.pattern !== pattern;
      }
      if (typeof rule.pattern === "object" && typeof pattern === "object") {
        return rule.pattern.source !== pattern.source;
      }
      return true;
    });
  }

  /**
   * Получение статистики правил
   */
  getStats() {
    return {
      totalRules: this.rules.length,
      rules: this.rules.map((rule) => ({
        pattern:
          typeof rule.pattern === "string" ? rule.pattern : rule.pattern.source,
        confidence: rule.confidence,
        needsFullProcessing: rule.needsFullProcessing,
      })),
    };
  }
}

// Экспортируем singleton instance
export const fastResponseSystem = new FastResponseSystem();
