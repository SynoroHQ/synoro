import { generateObject, generateText } from "ai";
import { z } from "zod";

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
    ["complex_task", ["task-orchestrator", "data-analyst"]],
    ["irrelevant", ["general-assistant"]],
  ]);

  constructor() {
    super("gpt-5-mini", 0.1); // Используем более точную модель для роутинга
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    // Роутер может обработать любое сообщение
    return true;
  }

  /**
   * Классифицирует сообщение
   */
  async classifyMessage(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<ClassificationResult> {
    const systemPrompt = `Ты - агент классификации сообщений в системе Synoro AI.

Твоя задача - проанализировать сообщение пользователя и определить:
1. Тип сообщения (question, event, chat, complex_task, irrelevant)
2. Подтип (если применимо)
3. Уровень сложности (simple, medium, complex)
4. Нужно ли логировать в базу данных
5. Какие агенты лучше всего подходят для обработки

ТИПЫ СООБЩЕНИЙ:
- question: Вопросы к боту, запросы информации, просьбы о помощи
- event: События для логирования (покупки, задачи, встречи, заметки)
- chat: Обычное общение, приветствия, благодарности
- complex_task: Сложные задачи требующие анализа данных или множественных операций
- irrelevant: Спам, бессмысленные сообщения

ВАЖНОЕ ПРАВИЛО ДЛЯ ЛОГИРОВАНИЯ:
- Если сообщение описывает конкретное событие, действие или факт из жизни пользователя - ОБЯЗАТЕЛЬНО устанавливай needsLogging: true
- События включают: покупки, траты, доходы, задачи, встречи, заметки, ремонт, поездки, здоровье
- НЕ спрашивай пользователя, нужно ли записать событие - если это событие, то ЗАПИСЫВАЙ автоматически
- needsLogging: false только для вопросов, обычного общения и спама

ДОСТУПНЫЕ АГЕНТЫ:
- qa-specialist: Отвечает на вопросы, предоставляет информацию
- general-assistant: Универсальный помощник и дружелюбный собеседник
- event-processor: Обрабатывает и парсит события для логирования
- task-manager: Управляет задачами/делами пользователя
- data-analyst: Анализирует числа, метрики, тренды и отчеты
- task-orchestrator: Координирует сложные многоэтапные задачи
- quality-evaluator: Оценивает и улучшает качество ответов`;

    const prompt = `Проанализируй это сообщение: "${task.input}"

Контекст: канал ${task.context?.channel || "unknown"}, пользователь ${task.context?.userId || "anonymous"}

ВАЖНО: Если сообщение описывает событие (покупка, задача, встреча, заметка и т.д.) - ОБЯЗАТЕЛЬНО установи needsLogging: true. НЕ спрашивай пользователя о необходимости записи.

Верни JSON с классификацией.`;

    try {
      const { object } = await generateObject({
        model: this.getModel(),
        schema: classificationSchema,
        system: systemPrompt,
        prompt,
        temperature: this.defaultTemperature,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("classify", task),
        },
      });

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
          system: `Ты - эксперт по классификации сообщений. Классифицируй сообщение по типам: question, event, chat, complex_task, irrelevant.

ПРАВИЛА:
- question: вопросы, запросы информации
- event: события для записи (покупки, задачи, встречи, заметки, ремонт, поездки)
- chat: обычное общение, приветствия
- complex_task: сложные многоэтапные задачи
- irrelevant: спам, бессмысленные сообщения

ВАЖНО: Если сообщение описывает событие - ОБЯЗАТЕЛЬНО нужно логировать (needsLogging: true).

Верни только тип сообщения, ничего больше.`,
          prompt: `Классифицируй: "${task.input}"`,
          temperature: 0.1,
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
    telemetry?: AgentTelemetry,
  ): Promise<RoutingDecision> {
    const systemPrompt = `Ты - агент маршрутизации в мультиагентной системе Synoro AI.

На основе классификации сообщения выбери наиболее подходящего агента для обработки.

КЛАССИФИКАЦИЯ: ${JSON.stringify(classification, null, 2)}

ДОСТУПНЫЕ АГЕНТЫ И ИХ СПЕЦИАЛИЗАЦИЯ:
- qa-specialist: Отвечает на вопросы о функциях бота, дает информацию
- general-assistant: Универсальный помощник и собеседник
- event-processor: Парсит и обрабатывает события для записи в базу
- task-manager: Управляет задачами/делами пользователя
- data-analyst: Выполняет аналитические запросы и рекомендации по визуализации
- task-orchestrator: Координирует сложные задачи, требующие нескольких агентов
- quality-evaluator: Оценивает и улучшает качество ответов`;

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
          },
        },
      });

      return object;
    } catch (error) {
      console.error("Error in routing decision:", error);

      // Fallback маршрутизация на основе типа сообщения
      const fallbackAgents = this.availableAgents.get(
        classification.messageType,
      ) ?? ["qa-specialist"];

      return {
        targetAgent: fallbackAgents[0] ?? "qa-specialist",
        confidence: 0.3,
        reasoning: "Fallback routing due to error",
      };
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
