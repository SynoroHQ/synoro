import { generateObject } from "ai";
import { z } from "zod";

import type {
  AgentCapability,
  AgentResult,
  AgentTask,
  RoutingDecision,
} from "./types";
import { AbstractAgent } from "./base-agent";

/**
 * Упрощенный роутер для маршрутизации запросов к трем основным агентам
 */
export class RouterAgent extends AbstractAgent {
  name = "Message Router";
  description =
    "AI-роутер для умного направления запросов к подходящим агентам";

  capabilities: AgentCapability[] = [
    {
      name: "AI Routing",
      description: "Умная AI-маршрутизация запросов",
      category: "routing",
      confidence: 0.95,
    },
  ];

  private availableAgents = {
    eventProcessor: "event-processor",
    eventAnalyzer: "event-analyzer",
    generalAssistant: "general-assistant",
  };

  constructor() {
    super("gpt-5-mini");
  }

  canHandle(_task: AgentTask): Promise<boolean> {
    // Роутер обрабатывает все запросы для маршрутизации
    return Promise.resolve(true);
  }

  /**
   * Схема для AI классификации запросов
   */
  private getRoutingSchema() {
    return z.object({
      targetAgent: z.enum([
        "event-processor",
        "event-analyzer",
        "general-assistant",
      ]),
      confidence: z.number().min(0).max(1),
      reasoning: z.string(),
      category: z.enum(["event_logging", "data_analysis", "general_chat"]),
    });
  }

  /**
   * AI-маршрутизация запросов
   */
  private async aiRoute(input: string): Promise<{
    targetAgent: string;
    confidence: number;
    reasoning: string;
    category: string;
  }> {
    const systemPrompt = `Ты - эксперт по маршрутизации запросов в системе Synoro AI.

ТВОЯ ЗАДАЧА: точно определить, к какому агенту направить запрос пользователя.

ДОСТУПНЫЕ АГЕНТЫ:
1. event-processor - для логирования событий (покупки, траты, задачи, встречи, ремонт, обслуживание)
2. event-analyzer - для анализа данных и статистики (отчеты, графики, тренды, сравнения)
3. general-assistant - для общих вопросов и разговора

ПРАВИЛА КЛАССИФИКАЦИИ:
- event-processor: запросы на сохранение, логирование, создание событий
- event-analyzer: запросы на анализ, статистику, отчеты, получение данных
- general-assistant: все остальные запросы (вопросы, разговор, помощь)

Отвечай точно и обоснованно.`;

    const { object } = await generateObject({
      model: this.getModel(),
      schema: this.getRoutingSchema(),
      system: systemPrompt,
      prompt: `Классифицируй запрос: "${input}"`,
      experimental_telemetry: {
        isEnabled: true,
        ...this.createTelemetry("ai-routing", {
          id: "routing-task",
          input,
          type: "routing",
          context: {},
          priority: 1,
          createdAt: new Date(),
        }),
      },
    });

    return object;
  }

  async process(task: AgentTask): Promise<AgentResult<RoutingDecision>> {
    try {
      // Используем AI для маршрутизации
      const aiResult = await this.aiRoute(task.input);

      const routingDecision: RoutingDecision = {
        targetAgent: aiResult.targetAgent,
        confidence: aiResult.confidence,
        reasoning: aiResult.reasoning,
        shouldParallel: false,
        followUpAgents: [],
      };

      return this.createSuccessResult(routingDecision, aiResult.confidence);
    } catch (error) {
      console.error("Error in RouterAgent:", error);
      return this.createErrorResult("Ошибка AI маршрутизации");
    }
  }

  shouldLog(_task: AgentTask): Promise<boolean> {
    // Роутер логирует все решения о маршрутизации
    return Promise.resolve(true);
  }
}
