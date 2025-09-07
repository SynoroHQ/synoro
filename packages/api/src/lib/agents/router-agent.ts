import { generateObject, generateText } from "ai";
import { z } from "zod";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

import type {
  AgentCapability,
  AgentResult,
  AgentTask,
  AgentTelemetry,
  ClassificationResult,
  RoutingDecision,
} from "./types";
import { AbstractAgent } from "./base-agent";

// Схема для классификации сообщений
const classificationSchema = z.object({
  messageType: z.enum([
    "question",
    "event",
    "chat",
    "complex_task",
    "irrelevant",
  ]),
  subtype: z.string().optional(),
  confidence: z.number().min(0).max(1),
  needsLogging: z.boolean(),
  complexity: z.enum(["simple", "medium", "complex"]),
  reasoning: z.string(),
  suggestedAgents: z.array(z.string()),
});

// Схема для принятия решения о маршрутизации
const routingDecisionSchema = z.object({
  targetAgent: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  shouldParallel: z.boolean().optional(),
  followUpAgents: z.array(z.string()).optional(),
});

/**
 * Агент-роутер, который классифицирует сообщения и направляет их к подходящим агентам
 */
export class RouterAgent extends AbstractAgent {
  name = "Message Router";
  description =
    "Классифицирует сообщения и направляет их к подходящим специализированным агентам";

  capabilities: AgentCapability[] = [
    {
      name: "Message Classification",
      description: "Классификация типа и сложности сообщения",
      category: "routing",
      confidence: 0.95,
    },
    {
      name: "Agent Selection",
      description: "Выбор наиболее подходящего агента для обработки",
      category: "routing",
      confidence: 0.9,
    },
    {
      name: "Task Orchestration",
      description:
        "Определение необходимости параллельной или последовательной обработки",
      category: "routing",
      confidence: 0.85,
    },
  ];

  private availableAgents = new Map<string, string[]>([
    ["question", ["qa-specialist", "general-assistant", "data-analyst"]],
    ["event", ["event-processor", "task-manager"]],
    ["chat", ["general-assistant", "qa-specialist"]],
    ["complex_task", ["task-orchestrator", "data-analyst", "qa-specialist"]],
    ["irrelevant", ["general-assistant"]],
  ]);

  // Кэш для классификаций похожих сообщений
  private classificationCache = new Map<
    string,
    { result: ClassificationResult; timestamp: number }
  >();
  protected cacheTimeout = 10 * 60 * 1000; // 10 минут для классификаций

  constructor() {
    super("gpt-5-mini"); // Temperature removed
  }

  canHandle(_task: AgentTask): Promise<boolean> {
    // Роутер может обработать любое сообщение
    return Promise.resolve(true);
  }

  /**
   * Быстрая предварительная классификация на основе ключевых слов
   */
  private quickClassify(input: string): Partial<ClassificationResult> | null {
    const lowerInput = input.toLowerCase().trim();

    // Паттерны для быстрой классификации
    const patterns: Record<string, RegExp[]> = {
      event: [
        /купил|потратил|заработал|получил|оплатил|продал/,
        /встреча|задача|дело|напомни|запланировал/,
        /поездка|ремонт|лечение|врач|больница/,
        /сделал|выполнил|закончил|начал/,
      ],
      question: [
        /что|как|где|когда|почему|зачем|какой|сколько/,
        /можешь|умеешь|знаешь|расскажи|объясни/,
        /помоги|подскажи|посоветуй|рекомендуй/,
      ],
      chat: [
        /привет|здравствуй|добрый|пока|до свидания/,
        /спасибо|благодарю|отлично|хорошо|понятно/,
        /да|нет|ок|окей|ладно|согласен/,
      ],
      complex_task: [
        /анализ|отчет|статистика|сравни|проанализируй/,
        /план|стратегия|алгоритм|схема|структура/,
      ],
    };

    for (const [type, typePatterns] of Object.entries(patterns)) {
      if (typePatterns.some((pattern) => pattern.test(lowerInput))) {
        return {
          messageType: type as ClassificationResult["messageType"],
          confidence: 0.8,
          needsLogging: type === "event",
          complexity: type === "complex_task" ? "complex" : "simple",
        };
      }
    }

    return null;
  }

  /**
   * Получение кэшированной классификации
   */
  private getCachedClassification(input: string): ClassificationResult | null {
    // Создаем хэш для похожих сообщений
    const hash = this.createInputHash(input);
    const cached = this.classificationCache.get(hash);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }

    this.classificationCache.delete(hash);
    return null;
  }

  /**
   * Сохранение классификации в кэш
   */
  private setCachedClassification(
    input: string,
    result: ClassificationResult,
  ): void {
    const hash = this.createInputHash(input);
    this.classificationCache.set(hash, { result, timestamp: Date.now() });
  }

  /**
   * Классифицирует сообщение с оптимизацией производительности
   */
  async classifyMessage(
    task: AgentTask,
    _telemetry?: AgentTelemetry,
  ): Promise<ClassificationResult> {
    // 1. Проверяем кэш
    const cached = this.getCachedClassification(task.input);
    if (cached) {
      console.log("🚀 Использована кэшированная классификация");
      return cached;
    }

    // 2. Быстрая классификация по паттернам
    const quickResult = this.quickClassify(task.input);
    if (
      quickResult?.confidence &&
      quickResult.confidence > 0.7 &&
      quickResult.messageType
    ) {
      const result: ClassificationResult = {
        messageType: quickResult.messageType,
        confidence: quickResult.confidence,
        needsLogging: quickResult.needsLogging ?? false,
        complexity: quickResult.complexity ?? "simple",
        suggestedAgents: this.availableAgents.get(quickResult.messageType) ?? [
          "general-assistant",
        ],
        reasoning: "Быстрая классификация по паттернам",
      };

      this.setCachedClassification(task.input, result);
      console.log("⚡ Использована быстрая классификация");
      return result;
    }
    const systemPrompt = await getPrompt(PROMPT_KEYS.ROUTER_CLASSIFICATION);

    const prompt = `Проанализируй это сообщение: "${task.input}"

Контекст: канал ${task.context.channel ?? "unknown"}, пользователь ${task.context.userId ?? "anonymous"}

ВАЖНО: Если сообщение описывает событие (покупка, задача, встреча, заметка и т.д.) - ОБЯЗАТЕЛЬНО установи needsLogging: true. НЕ спрашивай пользователя о необходимости записи.

Верни JSON с классификацией.`;

    // 3. Полная ИИ классификация
    try {
      const { object } = await generateObject({
        model: this.getModel(),
        schema: classificationSchema,
        system: systemPrompt,
        prompt,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("classify", task),
        },
      });

      // Сохраняем в кэш
      this.setCachedClassification(task.input, object);
      console.log("🧠 Использована полная ИИ классификация");
      return object;
    } catch (error) {
      console.error("Error in message classification:", error);

      // Fallback классификация с помощью AI
      try {
        const telemetryData = this.createTelemetry(
          "fallback-classification",
          task,
        );

        const { text: fallbackClassification } = await generateText({
          model: this.getModel(),
          system: await getPrompt(PROMPT_KEYS.ROUTER_FALLBACK),
          prompt: `Классифицируй: "${task.input}"`,
          experimental_telemetry: {
            isEnabled: true,
            ...telemetryData,
            metadata: { ...(telemetryData.metadata ?? {}), fallback: true },
          },
        });

        const messageType = fallbackClassification.trim().toLowerCase();
        const validTypes = [
          "question",
          "event",
          "chat",
          "complex_task",
          "irrelevant",
        ];
        const validatedType = validTypes.includes(messageType)
          ? messageType
          : "chat";

        // Автоматически определяем необходимость логирования для событий
        const needsLogging = validatedType === "event";

        return {
          messageType: validatedType as
            | "question"
            | "event"
            | "chat"
            | "complex_task"
            | "irrelevant",
          confidence: 0.4,
          needsLogging,
          complexity: messageType === "complex_task" ? "complex" : "simple",
          suggestedAgents:
            messageType === "question"
              ? ["qa-specialist"]
              : messageType === "event"
                ? ["event-processor"]
                : ["general-assistant"],
        };
      } catch (fallbackError) {
        console.error("Fallback classification also failed:", fallbackError);
        return {
          messageType: "chat",
          confidence: 0.3,
          needsLogging: false,
          complexity: "simple",
          suggestedAgents: ["qa-specialist"],
        };
      }
    }
  }

  /**
   * Принимает решение о маршрутизации на основе классификации
   */
  async routeMessage(
    classification: ClassificationResult,
    task: AgentTask,
    _telemetry?: AgentTelemetry,
  ): Promise<RoutingDecision> {
    const systemPrompt = await getPrompt(PROMPT_KEYS.ROUTER_ROUTING);

    const prompt = `Выбери агента для обработки сообщения: "${task.input}"

Учти классификацию и контекст. Верни JSON с решением о маршрутизации.`;

    try {
      const { object } = await generateObject({
        model: this.getModel(),
        schema: routingDecisionSchema,
        system: systemPrompt,
        prompt,
        temperature: this.defaultTemperature,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("route", task),
          metadata: {
            operation: "route",
            classification: classification.messageType,
            complexity: classification.complexity,
          },
        },
      });

      // Валидация выбранного агента
      const availableForType =
        this.availableAgents.get(classification.messageType) ?? [];
      if (!availableForType.includes(object.targetAgent)) {
        console.warn(
          `Выбранный агент ${object.targetAgent} не подходит для типа ${classification.messageType}, используем fallback`,
        );
        object.targetAgent = availableForType[0] ?? "general-assistant";
        object.confidence = Math.max(0.3, object.confidence - 0.2);
        object.reasoning += " (с коррекцией выбора агента)";
      }

      return object;
    } catch (error) {
      console.error("Error in routing decision:", error);
      throw new Error("Ошибка принятия решения о маршрутизации");
    }
  }

  /**
   * Основная обработка - классифицирует и маршрутизирует сообщение
   */
  async process(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<
    AgentResult<{
      classification: ClassificationResult;
      routing: RoutingDecision;
    }>
  > {
    try {
      // Классифицируем сообщение
      const classification = await this.classifyMessage(task, telemetry);

      // Принимаем решение о маршрутизации
      const routing = await this.routeMessage(classification, task, telemetry);

      return this.createSuccessResult(
        { classification, routing },
        Math.min(classification.confidence, routing.confidence),
        `Classified as ${classification.messageType} (${classification.complexity}), routed to ${routing.targetAgent}`,
      );
    } catch (error) {
      console.error("Error in router agent processing:", error);
      return this.createErrorResult("Failed to classify and route message");
    }
  }
}
