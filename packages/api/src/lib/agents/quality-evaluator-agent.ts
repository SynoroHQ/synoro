import { generateObject, generateText } from "ai";
import { z } from "zod";

import type {
  AgentCapability,
  AgentResult,
  AgentTask,
  AgentTelemetry,
  QualityMetrics,
} from "./types";
import { AbstractAgent } from "./base-agent";

// Схема для оценки качества
const qualityEvaluationSchema = z.object({
  accuracy: z
    .number()
    .min(0)
    .max(1)
    .describe("Точность и корректность информации"),
  relevance: z.number().min(0).max(1).describe("Релевантность ответа запросу"),
  completeness: z.number().min(0).max(1).describe("Полнота ответа"),
  clarity: z.number().min(0).max(1).describe("Ясность и понятность"),
  helpfulness: z.number().min(0).max(1).describe("Полезность для пользователя"),
  overallScore: z.number().min(0).max(1).describe("Общая оценка качества"),
  reasoning: z.string().describe("Обоснование оценки"),
  suggestions: z.array(z.string()).describe("Предложения по улучшению"),
  needsImprovement: z.boolean().describe("Требуется ли улучшение"),
});

const improvementRequestSchema = z.object({
  originalResponse: z.string(),
  issues: z.array(z.string()),
  improvementGuidelines: z.array(z.string()),
  targetQuality: z.number().min(0).max(1),
});

/**
 * Агент для оценки качества ответов других агентов
 * Реализует паттерн Evaluator-Optimizer из AI SDK
 */
export class QualityEvaluatorAgent extends AbstractAgent {
  name = "Quality Evaluator";
  description =
    "Оценивает качество ответов других агентов и предлагает улучшения";

  capabilities: AgentCapability[] = [
    {
      name: "Response Evaluation",
      description: "Оценка качества ответов по множественным критериям",
      category: "quality",
      confidence: 0.9,
    },
    {
      name: "Improvement Suggestions",
      description: "Предложения по улучшению качества ответов",
      category: "quality",
      confidence: 0.85,
    },
    {
      name: "Quality Metrics",
      description: "Расчет детализированных метрик качества",
      category: "quality",
      confidence: 0.8,
    },
    {
      name: "Context Awareness",
      description: "Учет контекста при оценке качества",
      category: "quality",
      confidence: 0.75,
    },
  ];

  private qualityThresholds: Record<
    "excellent" | "good" | "acceptable" | "poor",
    number
  > = {
    excellent: 0.9,
    good: 0.7,
    acceptable: 0.5,
    poor: 0.3,
  };

  constructor() {
    super("gpt-5o", 0.2); // Низкая температура для объективной оценки
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    // Этот агент используется для оценки ответов других агентов
    return task.type === "evaluation" || task.type === "quality_check";
  }

  /**
   * Оценивает качество ответа агента
   */
  async evaluateResponse(
    originalInput: string,
    agentResponse: string,
    context?: any,
    telemetry?: AgentTelemetry,
  ): Promise<
    QualityMetrics & { needsImprovement: boolean; suggestions: string[] }
  > {
    try {
      const { object: evaluation } = await generateObject({
        model: this.getModel(),
        schema: qualityEvaluationSchema,
        system: `Ты - эксперт по оценке качества ответов AI-агентов в системе Synoro.

Оценивай ответы по следующим критериям:

1. ТОЧНОСТЬ (0-1): Корректность фактической информации
2. РЕЛЕВАНТНОСТЬ (0-1): Соответствие ответа запросу
3. ПОЛНОТА (0-1): Достаточность информации для решения задачи
4. ЯСНОСТЬ (0-1): Понятность и структурированность ответа
5. ПОЛЕЗНОСТЬ (0-1): Практическая ценность для пользователя

КОНТЕКСТ СИСТЕМЫ SYNORO:
- Это система для логирования жизненных событий и персональной аналитики
- Пользователи записывают покупки, задачи, встречи, получают советы
- Ответы должны быть дружелюбными, конкретными и практичными
- Длина ответа: обычно 2-4 предложения, больше для сложных вопросов

КРИТЕРИИ КАЧЕСТВА:
- Отличный ответ (0.9+): точный, полный, ясный, очень полезный
- Хороший ответ (0.7-0.9): корректный, релевантный, достаточно полный
- Приемлемый ответ (0.5-0.7): базово корректный, но может быть неполным
- Плохой ответ (<0.5): неточный, нерелевантный или непонятный`,
        prompt: `ОЦЕНКА КАЧЕСТВА ОТВЕТА

Запрос пользователя: "${originalInput}"

Ответ агента: "${agentResponse}"

${context ? `Дополнительный контекст: ${JSON.stringify(context, null, 2)}` : ""}

Проанализируй качество ответа по всем критериям и дай объективную оценку.`,
        temperature: this.defaultTemperature,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("quality-evaluation", task, telemetry),
          metadata: {
            ...telemetry?.metadata,
            originalInput: originalInput.substring(0, 100),
            responseLength: agentResponse.length,
          },
        },
      });

      return evaluation;
    } catch (error) {
      console.error("Error in quality evaluation:", error);

      // Fallback простая оценка
      return {
        accuracy: 0.5,
        relevance: 0.5,
        completeness: 0.5,
        clarity: 0.5,
        helpfulness: 0.5,
        overallScore: 0.5,
        suggestions: ["Проверить ответ агента"],
        needsImprovement: true,
      };
    }
  }

  /**
   * Генерирует улучшенную версию ответа
   */
  async improveResponse(
    originalInput: string,
    originalResponse: string,
    evaluation: any,
    telemetry?: AgentTelemetry,
  ): Promise<string> {
    if (!evaluation.needsImprovement) {
      return originalResponse;
    }

    try {
      const { text: improvedResponse } = await generateText({
        model: this.getModel(),
        system: `Ты - редактор ответов в системе Synoro AI. Твоя задача - улучшить качество ответа агента.

ПРИНЦИПЫ УЛУЧШЕНИЯ:
1. Сохраняй дружелюбный тон Synoro AI
2. Делай ответы конкретными и практичными
3. Добавляй полезные детали, если их не хватает
4. Упрощай сложные формулировки
5. Связывай ответ с возможностями Synoro где уместно

ПРОБЛЕМЫ ДЛЯ ИСПРАВЛЕНИЯ:
${evaluation.suggestions.join("\n- ")}

ЦЕЛЕВОЕ КАЧЕСТВО: ${evaluation.targetQuality || 0.8}`,
        prompt: `УЛУЧШЕНИЕ ОТВЕТА

Исходный запрос: "${originalInput}"

Оригинальный ответ: "${originalResponse}"

Проблемы качества:
${evaluation.suggestions.join("\n- ")}

Текущая оценка: ${evaluation.overallScore}
Обоснование: ${evaluation.reasoning}

Создай улучшенную версию ответа, исправив указанные проблемы.`,
        temperature: 0.5,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("response-improvement", task, telemetry),
          metadata: {
            ...telemetry?.metadata,
            originalQuality: evaluation.overallScore,
            improvementNeeded: evaluation.needsImprovement,
          },
        },
      });

      return improvedResponse.trim();
    } catch (error) {
      console.error("Error in response improvement:", error);
      return originalResponse; // Возвращаем оригинал при ошибке
    }
  }

  /**
   * Полный цикл оценки и улучшения ответа
   */
  async evaluateAndImprove(
    originalInput: string,
    agentResponse: string,
    maxIterations = 2,
    targetQuality = 0.8,
    context?: any,
    telemetry?: AgentTelemetry,
  ): Promise<{
    finalResponse: string;
    evaluations: any[];
    iterationsUsed: number;
    finalQuality: number;
  }> {
    let currentResponse = agentResponse;
    const evaluations = [];
    let iterationsUsed = 0;

    for (let i = 0; i < maxIterations; i++) {
      // Оцениваем текущий ответ
      const evaluation = await this.evaluateResponse(
        originalInput,
        currentResponse,
        context,
        telemetry,
      );

      evaluations.push(evaluation);
      iterationsUsed++;

      // Если качество достаточное, останавливаемся
      if (
        evaluation.overallScore >= targetQuality ||
        !evaluation.needsImprovement
      ) {
        break;
      }

      // Улучшаем ответ
      const improvedResponse = await this.improveResponse(
        originalInput,
        currentResponse,
        evaluation,
        telemetry,
      );

      // Если улучшений нет, останавливаемся
      if (improvedResponse === currentResponse) {
        break;
      }

      currentResponse = improvedResponse;
    }

    const finalEvaluation = evaluations[evaluations.length - 1];

    return {
      finalResponse: currentResponse,
      evaluations,
      iterationsUsed,
      finalQuality: finalEvaluation?.overallScore ?? 0.5,
    };
  }

  async process(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<AgentResult<any>> {
    // Этот агент обычно не используется напрямую через process
    // Он вызывается другими агентами для оценки качества
    return this.createErrorResult(
      "Quality evaluator should be called via specific methods",
    );
  }
}
