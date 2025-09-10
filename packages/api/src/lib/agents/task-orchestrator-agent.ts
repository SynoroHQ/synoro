import type { JSONSchema7 } from "json-schema";
import { generateObject, generateText } from "ai";
import * as z from "zod";

import { getPrompt, PROMPT_KEYS } from "@synoro/prompts";

import type {
  AgentCapability,
  AgentResult,
  AgentTask,
  AgentTelemetry,
} from "./types";
import { globalAgentRegistry } from "./agent-registry";
import { AbstractAgent } from "./base-agent";

// Утилита для компактного форматирования ошибок Zod
function formatZodIssues(error: z.ZodError): string {
  return error.issues
    .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("; ");
}

// Схемы для оркестрации задач
const orchestrationPlanSchema = z.object({
  steps: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      requiredAgent: z.string(),
      dependsOn: z.array(z.string()).optional(),
      priority: z.enum(["low", "medium", "high"]),
      estimatedTime: z.string().optional(),
    }),
  ),
  totalSteps: z.number(),
  executionType: z.enum(["sequential", "parallel", "mixed"]),
  complexity: z.enum(["medium", "high"]),
  reasoning: z.string(),
});

// Полная схема плана (алиас для читабельности)
const PlanSchema = orchestrationPlanSchema;

const stepResultSchema = z.object({
  stepId: z.string(),
  success: z.boolean(),
  result: z.string(),
  confidence: z.number(),
  needsFollowUp: z.boolean(),
  suggestions: z.array(z.string()).optional(),
});

// Схемы для типизации методов
const stepSchema = z.object({
  id: z.string(),
  description: z.string(),
  requiredAgent: z.string(),
  dependsOn: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high"]),
  estimatedTime: z.string().optional(),
  taskType: z.string().optional(),
});

const evaluateStepInputSchema = z.object({
  stepResult: stepResultSchema,
  step: stepSchema,
});

// Частичная схема плана для парсинга стриминговых чанков
const PartialStepSchema = stepSchema.partial();
const PartialPlanSchema = z
  .object({
    steps: z.array(PartialStepSchema).optional(),
    totalSteps: z.number().optional(),
    executionType: z.enum(["sequential", "parallel", "mixed"]).optional(),
    complexity: z.enum(["medium", "high"]).optional(),
    reasoning: z.string().optional(),
  })
  .strict();

// Типы на основе схем
type Step = z.infer<typeof stepSchema>;
type StepResult = z.infer<typeof stepResultSchema>;
type OrchestrationPlan = z.infer<typeof orchestrationPlanSchema>;
type EvaluateStepInput = z.infer<typeof evaluateStepInputSchema>;

/**
 * Агент-оркестратор для координации сложных многоэтапных задач
 * Использует паттерны из AI SDK: routing, parallel processing, evaluation loops
 */
export class TaskOrchestratorAgent extends AbstractAgent {
  name = "Task Orchestrator";
  description =
    "Координирует выполнение сложных многоэтапных задач, управляя работой других агентов";

  capabilities: AgentCapability[] = [
    {
      name: "Complex Task Planning",
      description:
        "Разбиение сложных задач на этапы и планирование их выполнения",
      category: "complex_task",
      confidence: 0.9,
    },
    {
      name: "Agent Coordination",
      description: "Координация работы различных специализированных агентов",
      category: "complex_task",
      confidence: 0.85,
    },
    {
      name: "Parallel Processing",
      description: "Организация параллельного выполнения независимых задач",
      category: "complex_task",
      confidence: 0.8,
    },
    {
      name: "Quality Control",
      description: "Контроль качества и оценка результатов выполнения",
      category: "complex_task",
      confidence: 0.75,
    },
    {
      name: "Adaptive Planning",
      description:
        "Адаптация плана выполнения на основе промежуточных результатов",
      category: "complex_task",
      confidence: 0.7,
    },
  ];

  constructor() {
    super("gpt-5-mini"); // Более мощная модель для планирования
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    try {
      // Используем AI для определения сложности задачи
      const { object: taskAnalysis } = await generateObject({
        model: this.getModel(),
        schema: z.object({
          isComplexTask: z
            .boolean()
            .describe("Требует ли задача сложной многоэтапной обработки"),
          complexity: z
            .enum(["simple", "medium", "complex"])
            .describe("Уровень сложности задачи"),
          requiresOrchestration: z
            .boolean()
            .describe("Нужна ли координация нескольких агентов"),
          reasoning: z.string().describe("Обоснование оценки сложности"),
        }),
        system: `Ты - эксперт по оценке сложности задач в системе Synoro AI.

ТВОЯ ЗАДАЧА:
Определи, является ли задача сложной и требует ли она координации нескольких агентов.

ПРИЗНАКИ СЛОЖНЫХ ЗАДАЧ:
- Требует анализа данных и выявления паттернов
- Включает несколько независимых подзадач
- Нуждается в планировании и стратегии
- Требует сравнения, оптимизации, улучшения
- Содержит исследовательские элементы
- Длинные и детальные запросы

ПРИЗНАКИ ПРОСТЫХ ЗАДАЧ:
- Одиночные действия или запросы
- Простые вопросы или команды
- Не требуют планирования или координации
- Могут быть выполнены одним агентом

ПРАВИЛА:
1. Если задача требует нескольких этапов - она сложная
2. Если нужна координация агентов - требуется оркестрация
3. Учитывай контекст и детализацию запроса`,
        prompt: `Проанализируй задачу: "${task.input}"

Определи, является ли она сложной и требует ли координации нескольких агентов.`,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("task-complexity-analysis", task),
          metadata: { inputLength: task.input.length },
        },
      });

      // Проверяем тип задачи
      const isComplexType =
        task.type === "complex_task" ||
        task.type === "analysis" ||
        task.type === "planning";

      return taskAnalysis.isComplexTask && isComplexType;
    } catch (error) {
      console.error("Error in AI task complexity analysis:", error);
      throw new Error("Ошибка анализа сложности задачи");
    }
  }

  /**
   * Создает план выполнения сложной задачи
   */
  private async createExecutionPlan(
    task: AgentTask,
  ): Promise<OrchestrationPlan> {
    const { text } = await generateText({
      model: this.getModel(),
      system: await getPrompt(PROMPT_KEYS.TASK_ORCHESTRATOR),
      prompt:
        this.createPromptWithHistory(
          `Создай план выполнения задачи: "${task.input}"

Контекст: пользователь ${task.context?.userId || "anonymous"} в канале ${task.context?.channel || "unknown"}

Определи этапы, их последовательность и ответственных агентов.

Верни результат в формате JSON со следующей структурой:`,
          task,
          { includeSummary: true },
        ) +
        `
{
  "steps": [
    {
      "id": "уникальный_идентификатор",
      "description": "описание этапа",
      "requiredAgent": "имя_агента",
      "dependsOn": ["id_зависимого_этапа"],
      "priority": "low|medium|high",
      "estimatedTime": "примерное время"
    }
  ],
  "totalSteps": количество_этапов,
  "executionType": "sequential|parallel|mixed",
  "complexity": "medium|high",
  "reasoning": "объяснение логики планирования"
}`,
      experimental_output: {
        type: "object",
        responseFormat: {
          type: "json",
          schema: z.toJSONSchema(orchestrationPlanSchema) as JSONSchema7,
        },
        parsePartial: async (options) => {
          try {
            const parsed = JSON.parse(options.text);
            const result = PartialPlanSchema.safeParse(parsed);
            if (!result.success) {
              throw new Error(
                `Partial plan validation failed: ${formatZodIssues(result.error)}`,
              );
            }
            return { partial: result.data };
          } catch (err) {
            throw new Error(
              `Failed to parse partial plan: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        },
        parseOutput: async (options, context) => {
          try {
            const parsed = JSON.parse(options.text);
            const result = PlanSchema.safeParse(parsed);
            if (!result.success) {
              throw new Error(
                `Plan validation failed: ${formatZodIssues(result.error)}`,
              );
            }
            return result.data;
          } catch (err) {
            throw new Error(
              `Failed to parse plan: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        },
      },
      experimental_telemetry: {
        isEnabled: true,
        ...this.createTelemetry("create-plan", task),
      },
    });

    // Парсим результат и валидируем схему
    try {
      const parsedPlan = JSON.parse(text);
      const validatedPlan = orchestrationPlanSchema.parse(parsedPlan);
      return validatedPlan;
    } catch (error) {
      console.error("Failed to parse or validate plan:", error);
      throw new Error("Не удалось создать план выполнения задачи");
    }
  }

  /**
   * Выполняет этап через соответствующего агента
   */
  private async executeStep(
    step: Step,
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<StepResult> {
    try {
      // Получаем агента для выполнения этапа из глобального реестра
      const targetAgent = globalAgentRegistry.get(step.requiredAgent);

      if (!targetAgent) {
        throw new Error(`Агент ${step.requiredAgent} недоступен`);
      }

      // Создаем задачу для агента
      const agentTask: AgentTask = {
        id: `${step.id}-${Date.now()}`,
        type: step.taskType || "general",
        input: step.description,
        context: task.context || {
          userId: "anonymous",
          channel: "unknown",
        },
        priority:
          step.priority === "high" ? 1 : step.priority === "medium" ? 2 : 3,
        createdAt: new Date(),
      };

      // Выполняем задачу через агента
      const agentResult = await targetAgent.process(agentTask, telemetry);

      if (!agentResult.success) {
        return {
          stepId: step.id,
          success: false,
          result: agentResult.error || "Ошибка выполнения",
          confidence: agentResult.confidence || 0.3,
          needsFollowUp: true,
        };
      }

      return {
        stepId: step.id,
        success: true,
        result: agentResult.data as string,
        confidence: agentResult.confidence || 0.8,
        needsFollowUp: false,
      };
    } catch (error) {
      console.error(`Error executing step ${step.id}:`, error);
      return {
        stepId: step.id,
        success: false,
        result: `Ошибка выполнения: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        confidence: 0.2,
        needsFollowUp: true,
      };
    }
  }

  async process(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<
    AgentResult<{
      plan: OrchestrationPlan;
      results: StepResult[];
      finalSummary: string;
      qualityScore: number;
    }>
  > {
    try {
      // 1. Создаем план выполнения
      const plan = await this.createExecutionPlan(task);

      // 2. Выполняем этапы согласно плану
      const results = [];
      let overallQuality = 0;

      if (plan.executionType === "parallel") {
        // Параллельное выполнение независимых этапов
        const promises = plan.steps.map((step) =>
          this.executeStep(step, task, telemetry),
        );
        const parallelResults = await Promise.all(promises);
        results.push(...parallelResults);

        // Оценка качества каждого этапа в параллельном режиме
        for (const stepResult of parallelResults) {
          const quality = await this.evaluateStepQuality(
            stepResult,
            plan.steps[0] as Step,
            task,
          );
          overallQuality += quality.score;
        }
      } else {
        // Последовательное выполнение
        for (const step of plan.steps) {
          const stepResult = await this.executeStep(step, task, telemetry);
          results.push(stepResult);

          // Оценка качества каждого этапа
          const quality = await this.evaluateStepQuality(
            stepResult,
            step,
            task,
          );
          overallQuality += quality.score;

          // Если качество низкое, можем попробовать улучшить
          if (quality.needsImprovement && quality.suggestions.length > 0) {
            console.log(
              `Quality improvement needed for step ${step.id}:`,
              quality.suggestions,
            );
            // Здесь можно добавить логику повторного выполнения
          }
        }
      }

      // 3. Создаем итоговый отчет
      const finalSummary = await this.generateFinalSummary(task, plan, results);

      // Защита от деления на ноль при вычислении среднего качества
      const totalSteps = plan.steps.length;
      const averageQuality = totalSteps === 0 ? 0 : overallQuality / totalSteps;

      return this.createSuccessResult(
        {
          plan,
          results,
          finalSummary,
          qualityScore: averageQuality,
        },
        averageQuality,
        `Orchestrated ${plan.steps.length} steps with ${plan.executionType} execution`,
      );
    } catch (error) {
      console.error("Error in task orchestrator:", error);
      return this.createErrorResult("Failed to orchestrate complex task");
    }
  }

  /**
   * Оценка качества выполнения этапа с помощью AI
   */
  private async evaluateStepQuality(
    stepResult: StepResult,
    step: Step,
    task: AgentTask,
  ): Promise<{
    score: number;
    needsImprovement: boolean;
    suggestions: string[];
  }> {
    try {
      const { object: quality } = await generateObject({
        model: this.getModel(),
        schema: z.object({
          score: z.number().min(0).max(1).describe("Оценка качества (0-1)"),
          needsImprovement: z.boolean().describe("Требуется ли улучшение"),
          suggestions: z.array(z.string()).describe("Предложения по улучшению"),
        }),
        system: `Ты - эксперт по оценке качества выполнения задач в системе Synoro AI.

Оценивай качество выполнения этапов по следующим критериям:
1. Успешность выполнения (успех/ошибка)
2. Уровень уверенности агента
3. Полезность результата
4. Соответствие описанию этапа

ПРАВИЛА ОЦЕНКИ:
- Высокое качество (0.8+): этап выполнен успешно, результат полезен
- Среднее качество (0.6-0.8): этап выполнен, но может быть улучшен
- Низкое качество (<0.6): этап не выполнен или результат неудовлетворителен`,
        prompt: `Оцени качество выполнения этапа:

Описание этапа: "${step.description}"
Результат: ${JSON.stringify(stepResult.result)}
Успех: ${stepResult.success}
Уверенность: ${stepResult.confidence}

Дай объективную оценку качества.`,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("step-quality-evaluation", task),
          metadata: { stepId: step.id },
        },
      });

      return quality;
    } catch (error) {
      console.error("Error in AI quality evaluation:", error);
      throw new Error("Ошибка оценки качества выполнения этапа");
    }
  }

  /**
   * Генерация итогового резюме
   */
  private async generateFinalSummary(
    task: AgentTask,
    plan: OrchestrationPlan,
    results: StepResult[],
  ): Promise<string> {
    const { text } = await generateText({
      model: this.getModel(),
      system: `Ты - координатор задач в системе Synoro AI. Создай итоговое резюме выполнения сложной задачи.

Включи:
1. Краткое описание выполненных этапов
2. Основные результаты
3. Рекомендации пользователю
4. Следующие шаги (если нужны)`,
      prompt: `Создай итоговое резюме для задачи: "${task.input}"

План выполнения:
${JSON.stringify(plan, null, 2)}

Результаты этапов:
${results.map((r) => `- ${r.stepId}: ${r.result}`).join("\n")}

Сформируй понятное и полезное резюме для пользователя.`,
      experimental_telemetry: {
        isEnabled: true,
        ...this.createTelemetry("generate-summary", task),
      },
    });

    return text;
  }
}
