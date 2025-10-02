/**
 * Оптимизатор агентов для максимальной скорости и стабильности
 */

import type { AgentConfig, AgentContext, AgentResult } from "./agent";

export interface OptimizationConfig {
  enablePromptCompression: boolean;
  enableResponseCaching: boolean;
  enableBatching: boolean;
  maxPromptLength: number;
  timeoutMs: number;
  retryAttempts: number;
}

export const DEFAULT_OPTIMIZATION_CONFIG: OptimizationConfig = {
  enablePromptCompression: true,
  enableResponseCaching: true,
  enableBatching: false,
  maxPromptLength: 2000, // Максимальная длина промпта для скорости
  timeoutMs: 15000, // 15 секунд таймаут
  retryAttempts: 2,
};

export class AgentOptimizer {
  constructor(private config = DEFAULT_OPTIMIZATION_CONFIG) {}

  // Сжатие промпта для ускорения обработки
  compressPrompt(prompt: string): string {
    if (!this.config.enablePromptCompression) {
      return prompt;
    }

    let compressed = prompt
      // Удаляем лишние пробелы и переносы
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      // Удаляем комментарии в скобках
      .replace(/\([^)]*\)/g, "")
      // Сокращаем повторяющиеся фразы
      .replace(/ПРАВИЛА?:?\s*/gi, "Правила: ")
      .replace(/ПРИНЦИПЫ?:?\s*/gi, "Принципы: ")
      .replace(/ПРИМЕРЫ?:?\s*/gi, "Примеры: ")
      .trim();

    // Обрезаем если слишком длинный
    if (compressed.length > this.config.maxPromptLength) {
      compressed = compressed.substring(0, this.config.maxPromptLength) + "...";
    }

    return compressed;
  }

  // Оптимизация конфигурации агента
  optimizeConfig(config: AgentConfig): AgentConfig {
    return {
      ...config,
      // Уменьшаем температуру для более стабильных ответов
      temperature: Math.min(config.temperature || 0.7, 0.3),
      // Ограничиваем токены для скорости
      maxTokens: Math.min(config.maxTokens || 2000, 1000),
      // Устанавливаем таймаут
      timeout: Math.min(config.timeout || 30000, this.config.timeoutMs),
      // Включаем стриминг для быстрого отклика
      stream: true,
    };
  }

  // Предварительная обработка контекста
  optimizeContext(context: AgentContext): AgentContext {
    return {
      ...context,
      // Ограничиваем историю сообщений
      messageHistory: this.limitMessageHistory(context.messageHistory),
      // Добавляем метки времени для кэширования
      timestamp: Date.now(),
    };
  }

  // Пост-обработка результата
  optimizeResult(result: AgentResult): AgentResult {
    return {
      ...result,
      // Сжимаем ответ если слишком длинный
      response: this.compressResponse(result.response),
      // Добавляем метрики производительности
      metadata: {
        ...result.metadata,
        optimized: true,
        timestamp: Date.now(),
      },
    };
  }

  private limitMessageHistory(history?: string): string | undefined {
    if (!history) return history;

    const lines = history.split("\n");
    // Оставляем только последние 10 сообщений
    if (lines.length > 10) {
      return lines.slice(-10).join("\n");
    }

    return history;
  }

  private compressResponse(response: string): string {
    // Удаляем лишние пробелы, но сохраняем форматирование
    return response
      .replace(/\n\s*\n\s*\n/g, "\n\n") // Убираем тройные переносы
      .replace(/\s+/g, " ") // Убираем лишние пробелы
      .trim();
  }

  // Создание быстрого промпта для роутера
  createFastRoutingPrompt(input: string): string {
    const keywords = this.extractKeywords(input);

    return `Классифицируй по ключевым словам: ${keywords.join(", ")}
    
Агенты:
- event-processor: создание, запись, трата, купил, задача
- event-analyzer: анализ, статистика, покажи, сколько
- general-assistant: как, что такое, помощь

Ответ: название агента`;
  }

  private extractKeywords(input: string): string[] {
    const keywords = input
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .slice(0, 5); // Берем только первые 5 слов

    return keywords;
  }
}

// Глобальный оптимизатор
export const globalOptimizer = new AgentOptimizer();

// Middleware для оптимизации
export class OptimizationMiddleware {
  name = "optimization";
  priority = 5;

  constructor(private optimizer = globalOptimizer) {}

  async beforeExecute(agent: any, context: any, input: string) {
    const optimizedContext = this.optimizer.optimizeContext(context);
    return { context: optimizedContext, input };
  }

  async afterExecute(agent: any, context: any, input: string, result: any) {
    return this.optimizer.optimizeResult(result);
  }
}
