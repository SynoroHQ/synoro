import { generateObject } from "ai";
import { z } from "zod";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

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
    eventCreation: "event-creation",
    generalAssistant: "general-assistant",
  };

  constructor() {
    super("gpt-5");
  }

  private normalizeAgentKey(value: string): string {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, "-")
      .replace(/ё/g, "е");

    const mapping: Record<string, string> = {
      "event-processor": "event-processor",
      processor: "event-processor",
      "eventprocessor": "event-processor",
      "обработчик-событий": "event-processor",
      "обработка-событий": "event-processor",
      "анализатор-событий": "event-analyzer",
      "анализ-событий": "event-analyzer",
      "event-analyzer": "event-analyzer",
      analyzer: "event-analyzer",
      "eventanalyzer": "event-analyzer",
      "создание-событий": "event-creation",
      "создатель-событий": "event-creation",
      "event-creation": "event-creation",
      creation: "event-creation",
      "eventcreation": "event-creation",
      "general-assistant": "general-assistant",
      assistant: "general-assistant",
      "generalassistant": "general-assistant",
      "общий-помощник": "general-assistant",
      "универсальный-помощник": "general-assistant",
      "помощник": "general-assistant",
    };

    if (mapping[normalized]) {
      return mapping[normalized];
    }

    if (normalized.includes("анализ")) {
      return "event-analyzer";
    }

    if (normalized.includes("обработ")) {
      return "event-processor";
    }

    if (normalized.includes("созд") || normalized.includes("планир")) {
      return "event-creation";
    }

    if (normalized.includes("assist") || normalized.includes("помощ")) {
      return "general-assistant";
    }

    return normalized;
  }

  private normalizeCategory(value: string): string {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, "-")
      .replace(/ё/g, "е");

    const mapping: Record<string, string> = {
      "event-logging": "event_logging",
      "event_logging": "event_logging",
      "логирование-событий": "event_logging",
      "logging": "event_logging",
      "data-analysis": "data_analysis",
      "data_analysis": "data_analysis",
      "анализ-данных": "data_analysis",
      "event-creation": "event_creation",
      "event_creation": "event_creation",
      "создание-событий": "event_creation",
      "general-chat": "general_chat",
      "general_chat": "general_chat",
      "общий-чат": "general_chat",
      "чат": "general_chat",
    };

    if (mapping[normalized]) {
      return mapping[normalized];
    }

    if (normalized.includes("лог")) {
      return "event_logging";
    }

    if (normalized.includes("анализ")) {
      return "data_analysis";
    }

    if (normalized.includes("созд") || normalized.includes("планир")) {
      return "event_creation";
    }

    if (normalized.includes("чат") || normalized.includes("общ")) {
      return "general_chat";
    }

    return normalized;
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
      targetAgent: z
        .string()
        .transform((value) => this.normalizeAgentKey(value))
        .pipe(
          z.enum([
            "event-processor",
            "event-analyzer",
            "event-creation",
            "general-assistant",
          ]),
        ),
      confidence: z.number().min(0).max(1),
      reasoning: z.string(),
      category: z
        .string()
        .transform((value) => this.normalizeCategory(value))
        .pipe(
          z.enum([
            "event_logging",
            "data_analysis",
            "event_creation",
            "general_chat",
          ]),
        ),
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
    // Получаем промпт из Langfuse облака
    const systemPrompt = await getPrompt(PROMPT_KEYS.ROUTER_AGENT, "latest");

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
