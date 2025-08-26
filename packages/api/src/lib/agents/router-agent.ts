import { generateObject } from "ai";
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
    ["question", ["qa-specialist"]],
    ["event", ["event-processor"]],
    ["chat", ["qa-specialist"]],
    ["complex_task", ["task-orchestrator"]],
    ["irrelevant", ["qa-specialist"]],
  ]);

  constructor() {
    super("gpt-4o", 0.1); // Используем более точную модель для роутинга
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

ДОСТУПНЫЕ АГЕНТЫ:
- qa-specialist: Отвечает на вопросы, предоставляет информацию
- event-processor: Обрабатывает и парсит события для логирования  
- quality-evaluator: Оценивает и улучшает качество ответов
- task-orchestrator: Координирует сложные многоэтапные задачи
- quality-evaluator: Оценивает и улучшает качество ответов`;

    const prompt = `Проанализируй это сообщение: "${task.input}"

Контекст: канал ${task.context.channel}, пользователь ${task.context.userId || "anonymous"}

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
          ...this.createTelemetry("classify", task, telemetry),
        },
      });

      return object;
    } catch (error) {
      console.error("Error in message classification:", error);

      // Fallback классификация
      return {
        messageType: "chat",
        confidence: 0.3,
        needsLogging: false,
        complexity: "simple",
        reasoning: "Fallback due to classification error",
        suggestedAgents: ["qa-specialist"],
      };
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
- event-processor: Парсит и обрабатывает события для записи в базу
- qa-specialist: Ведет дружеское общение, поддерживает диалог
- quality-evaluator: Оценивает и улучшает качество ответов
- task-orchestrator: Координирует сложные задачи, требующие несколько агентов
- quality-evaluator: Оценивает и улучшает качество ответов

ПРАВИЛА ВЫБОРА:
1. Для простых вопросов - qa-specialist
2. Для событий/покупок - event-processor
3. Для общения - qa-specialist
4. Для сложных задач - task-orchestrator
5. Для улучшения качества - quality-evaluator`;

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
          ...this.createTelemetry("route", task, telemetry),
        },
      });

      return object;
    } catch (error) {
      console.error("Error in routing decision:", error);

      // Fallback маршрутизация на основе типа сообщения
      const fallbackAgents = this.availableAgents.get(
        classification.messageType,
      ) || ["qa-specialist"];

      return {
        targetAgent: fallbackAgents[0] || "qa-specialist",
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
