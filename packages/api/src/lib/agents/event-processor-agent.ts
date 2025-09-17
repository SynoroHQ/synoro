import { generateText } from "ai";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { AbstractAgent } from "./base-agent";

/**
 * Упрощенный агент для обработки и логирования событий
 * Основная задача - сохранять события и предоставлять информацию о них
 */
export class EventProcessorAgent extends AbstractAgent {
  name = "Event Processor";
  description = "Агент для логирования событий и предоставления информации";

  capabilities: AgentCapability[] = [
    {
      name: "Event Logging",
      description: "Логирование и сохранение событий в базу данных",
      category: "event",
      confidence: 0.95,
    },
    {
      name: "Event Information",
      description: "Предоставление информации о сохраненных событиях",
      category: "event",
      confidence: 0.9,
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
      const systemPrompt = `Ты - эксперт по обработке событий в системе Synoro AI.

ТВОЯ ЗАДАЧА:
1. Анализировать запросы пользователей на создание и управление событиями
2. Классифицировать события по типам: expense, task, maintenance, other
3. Предоставлять информацию о событиях и их аналитику
4. Давать рекомендации по управлению событиями

КЛАССИФИКАЦИЯ СОБЫТИЙ:
- expense: покупки, траты, расходы, оплата услуг
- task: задачи, дела, напоминания, планы
- maintenance: ремонт, обслуживание, техобслуживание
- other: все остальное

КАТЕГОРИИ ДЛЯ РАСХОДОВ:
- продукты: еда, напитки, продукты питания
- транспорт: проезд, топливо, такси, общественный транспорт
- развлечения: кино, театр, игры, книги, хобби
- одежда: одежда, обувь, аксессуары
- здоровье: лекарства, медицинские услуги, спорт
- дом: мебель, ремонт, коммунальные услуги, техника
- образование: курсы, обучение, семинары, книги
- услуги: различные платные услуги
- подарки: подарки для других людей
- прочее: не подходящее под другие категории

ФОРМАТ ОТВЕТОВ:
- Используй эмодзи для лучшего восприятия
- Структурируй информацию в списки и таблицы
- Выделяй ключевые моменты жирным шрифтом
- Предоставляй конкретные рекомендации
- Показывай примеры и шаблоны

КОНТЕКСТ:
- Пользователь: ${task.context?.userId || "Неизвестен"}
- Домашнее хозяйство: ${task.context?.householdId || "Неизвестно"}
- Время запроса: ${new Date().toLocaleString("ru-RU")}

Отвечай на русском языке, будь максимально полезным и информативным.`;

      const { text: response } = await generateText({
        model: this.getModel(),
        system: systemPrompt,
        prompt: task.input,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("event-processing", task),
        },
      });

      return this.createSuccessResult(response, 0.95);
    } catch (error) {
      console.error("Error in EventProcessorAgent:", error);
      return this.createErrorResult(
        "Извините, произошла ошибка при обработке события",
      );
    }
  }

  shouldLog(_task: AgentTask): Promise<boolean> {
    // Логируем все события для отслеживания
    return Promise.resolve(true);
  }
}
