import { generateText } from "ai";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

import type { EventWithDetails } from "../services/event-service";
import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { DatabaseToolsService } from "../services/database-tools-service";
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

  private databaseService: DatabaseToolsService;

  constructor() {
    super("gpt-5");
    this.databaseService = new DatabaseToolsService();
  }

  canHandle(_task: AgentTask): Promise<boolean> {
    return Promise.resolve(true); // Обрабатываем все запросы через AI
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    try {
      // Проверяем, запрашивает ли пользователь события
      const eventRequest = this.detectEventRequest(task.input);

      let eventContext = "События не запрашивались";
      if (eventRequest && task.context.householdId) {
        try {
          const events = await this.databaseService.getUserEvents({
            userId: task.context.userId,
            householdId: task.context.householdId,
            limit: 20,
            startDate: eventRequest.startDate,
            endDate: eventRequest.endDate,
            type: eventRequest.type,
          });

          eventContext = this.formatEventsForPrompt(events);
        } catch (error) {
          console.error("Failed to fetch events:", error);
          eventContext = "Не удалось получить события из базы данных";
        }
      }

      // Получаем промпт из Langfuse облака
      const systemPrompt = await getPrompt(
        PROMPT_KEYS.GENERAL_ASSISTANT_AGENT,
        "latest",
        {
          userId: task.context.userId ?? "Неизвестен",
          householdId: task.context.householdId ?? "Неизвестно",
          currentTime: new Date().toLocaleString("ru-RU"),
          eventContext,
        },
      );

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

  /**
   * Определяет, запрашивает ли пользователь информацию о событиях
   */
  private detectEventRequest(input: string): {
    startDate?: string;
    endDate?: string;
    type?: string;
  } | null {
    const inputLower = input.toLowerCase();

    const eventKeywords = [
      "событи",
      "дела",
      "задач",
      "что я делал",
      "покажи",
      "расход",
      "трат",
      "покупк",
      "список",
      "мои дела",
      "мои события",
      "что было",
      "история",
    ];

    const needsEvents = eventKeywords.some((keyword) =>
      inputLower.includes(keyword),
    );

    if (!needsEvents) return null;

    // Определяем период
    let startDate: string | undefined;
    let endDate = new Date().toISOString();

    if (inputLower.includes("вчера")) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      startDate = yesterday.toISOString();

      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      endDate = endOfYesterday.toISOString();
    } else if (inputLower.includes("сегодня")) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate = today.toISOString();
    } else if (inputLower.includes("неделю") || inputLower.includes("7 дней")) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString();
    } else if (inputLower.includes("месяц") || inputLower.includes("30 дней")) {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      startDate = monthAgo.toISOString();
    } else {
      // По умолчанию - последние 7 дней
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString();
    }

    // Определяем тип события
    let type: string | undefined;
    if (
      inputLower.includes("покупк") ||
      inputLower.includes("трат") ||
      inputLower.includes("расход")
    ) {
      type = "purchase";
    } else if (
      inputLower.includes("работ") ||
      inputLower.includes("задач") ||
      inputLower.includes("дела")
    ) {
      type = "work";
    }

    return {
      startDate,
      endDate,
      type,
    };
  }

  /**
   * Форматирует события для включения в промпт
   */
  private formatEventsForPrompt(events: EventWithDetails[]): string {
    if (events.length === 0) {
      return "События не найдены";
    }

    const formatted = events
      .map((event) => {
        const date = new Date(event.occurredAt).toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const tags =
          event.tags.map((t: { name: string }) => t.name).join(", ") ?? "";
        const amount = event.amount
          ? ` (${event.amount} ${event.currency ?? "RUB"})`
          : "";

        return `- [${date}] ${event.title}${amount}${tags ? ` #${tags}` : ""}${event.notes ? `\n  ${event.notes}` : ""}`;
      })
      .join("\n");

    return `СОБЫТИЯ ПОЛЬЗОВАТЕЛЯ (${events.length} шт.):\n${formatted}`;
  }
}
