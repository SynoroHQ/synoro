import { generateText } from "ai";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { AbstractAgent } from "./base-agent";

/**
 * Агент для анализа событий и предоставления статистики
 * Основная задача - анализ данных и генерация отчетов
 */
export class EventAnalyzerAgent extends AbstractAgent {
  name = "Event Analyzer";
  description = "Агент для анализа событий и предоставления статистики";

  capabilities: AgentCapability[] = [
    {
      name: "Data Analysis",
      description: "Анализ данных событий и генерация отчетов",
      category: "analysis",
      confidence: 0.9,
    },
    {
      name: "Statistics",
      description: "Предоставление статистической информации по событиям",
      category: "analysis",
      confidence: 0.85,
    },
  ];

  constructor() {
    super("gpt-5-nano");
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    return true; // Обрабатываем все запросы через AI
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    try {
      const systemPrompt = `Ты - эксперт-аналитик данных в системе Synoro AI.

ТВОЯ ЗАДАЧА:
1. Анализировать запросы пользователей на анализ событий и статистику
2. Создавать детальные отчеты с выводами и рекомендациями
3. Выявлять тренды, паттерны и аномалии в данных
4. Предоставлять практические инсайты для принятия решений

ТВОИ ВОЗМОЖНОСТИ:
- 📊 Анализ расходов по категориям и периодам
- 📈 Статистика по типам событий с трендами
- 🔄 Сравнение периодов с выявлением изменений
- 💡 Выявление паттернов и аномалий в тратах
- 📋 Создание сводных отчетов с рекомендациями
- 🎯 Анализ эффективности и оптимизации

ФОРМАТ ОТВЕТОВ:
- Используй эмодзи для лучшего восприятия
- Структурируй данные в таблицы и списки
- Выделяй ключевые инсайты жирным шрифтом
- Предоставляй конкретные рекомендации
- Показывай процентные изменения и тренды
- Используй графики в текстовом формате (ASCII)

КОНТЕКСТ:
- Пользователь: ${task.context?.userId || "Неизвестен"}
- Домашнее хозяйство: ${task.context?.householdId || "Неизвестно"}
- Время запроса: ${new Date().toLocaleString("ru-RU")}

Отвечай на русском языке, будь максимально информативным и полезным.`;

      const { text: response } = await generateText({
        model: this.getModel(),
        system: systemPrompt,
        prompt: task.input,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("event-analysis", task),
        },
      });

      return this.createSuccessResult(response, 0.9);
    } catch (error) {
      console.error("Error in EventAnalyzerAgent:", error);
      return this.createErrorResult(
        "Извините, произошла ошибка при анализе данных",
      );
    }
  }

  shouldLog(_task: AgentTask): Promise<boolean> {
    return Promise.resolve(true);
  }
}
