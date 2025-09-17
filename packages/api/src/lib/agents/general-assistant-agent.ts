import { generateText } from "ai";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { AbstractAgent } from "./base-agent";

export class GeneralAssistantAgent extends AbstractAgent {
  name = "General Assistant";
  description =
    "Универсальный помощник для общего общения и ответов на вопросы";
  capabilities: AgentCapability[] = [
    {
      name: "General Help",
      description: "Ответы на общие вопросы и повседневные задачи",
      category: "general",
      confidence: 0.85,
    },
    {
      name: "Conversation",
      description: "Дружелюбная беседа и поддержка общения",
      category: "chat",
      confidence: 0.8,
    },
    {
      name: "Basic Q&A",
      description: "Базовые ответы без спец. экспертизы",
      category: "question",
      confidence: 0.75,
    },
  ];

  constructor() {
    super("gpt-5-mini");
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    return true; // Обрабатываем все запросы через AI
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    try {
      const systemPrompt = `Ты - универсальный помощник Synoro AI.

ТВОЯ ЗАДАЧА:
1. Помогать пользователям с любыми вопросами и задачами
2. Поддерживать дружелюбную беседу
3. Предоставлять полезную информацию и советы
4. Анализировать запросы и давать релевантные ответы

ТВОИ ВОЗМОЖНОСТИ:
- 💬 Общение и поддержка разговора
- ❓ Ответы на общие вопросы
- 💡 Полезные советы по повседневным вопросам
- 🧠 Помощь с организацией мыслей и планированием
- 📊 Базовая аналитика и статистика
- 📝 Помощь с текстами и документами
- 🎯 Рекомендации и решения проблем
- 🔍 Поиск и структурирование информации

ФОРМАТ ОТВЕТОВ:
- Используй эмодзи для лучшего восприятия
- Структурируй информацию в списки и блоки
- Выделяй ключевые моменты жирным шрифтом
- Предоставляй конкретные примеры и решения
- Будь дружелюбным и понятным

КОНТЕКСТ:
- Пользователь: ${task.context?.userId || "Неизвестен"}
- Домашнее хозяйство: ${task.context?.householdId || "Неизвестно"}
- Время запроса: ${new Date().toLocaleString("ru-RU")}

Отвечай на русском языке, будь максимально полезным и дружелюбным.`;

      const { text } = await generateText({
        model: this.getModel(),
        system: systemPrompt,
        prompt: task.input,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("general-assistant", task),
        },
      });

      return this.createSuccessResult(text, 0.8);
    } catch (error) {
      console.error("Error in GeneralAssistantAgent:", error);
      return this.createErrorResult(
        "Извините, произошла ошибка при обработке вашего запроса. Попробуйте переформулировать вопрос.",
      );
    }
  }

  shouldLog(task: AgentTask): Promise<boolean> {
    // Логируем только важные взаимодействия
    return Promise.resolve(
      task.input.length > 50 || task.context.channel === "telegram",
    );
  }
}
