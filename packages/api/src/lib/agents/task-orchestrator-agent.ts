import { generateObject, generateText, tool, stepCountIs } from "ai";
import { z } from "zod";

import { AbstractAgent } from "./base-agent";
import type {
  AgentTask,
  AgentResult,
  AgentTelemetry,
  AgentCapability,
} from "./types";

// Схемы для оркестрации задач
const orchestrationPlanSchema = z.object({
  steps: z.array(z.object({
    id: z.string(),
    description: z.string(),
    requiredAgent: z.string(),
    dependsOn: z.array(z.string()).optional(),
    priority: z.enum(["low", "medium", "high"]),
    estimatedTime: z.string().optional(),
  })),
  totalSteps: z.number(),
  executionType: z.enum(["sequential", "parallel", "mixed"]),
  complexity: z.enum(["medium", "high"]),
  reasoning: z.string(),
});

const stepResultSchema = z.object({
  stepId: z.string(),
  success: z.boolean(),
  result: z.string(),
  confidence: z.number(),
  needsFollowUp: z.boolean(),
  suggestions: z.array(z.string()).optional(),
});

/**
 * Агент-оркестратор для координации сложных многоэтапных задач
 * Использует паттерны из AI SDK: routing, parallel processing, evaluation loops
 */
export class TaskOrchestratorAgent extends AbstractAgent {
  name = "Task Orchestrator";
  description = "Координирует выполнение сложных многоэтапных задач, управляя работой других агентов";
  
  capabilities: AgentCapability[] = [
    {
      name: "Complex Task Planning",
      description: "Разбиение сложных задач на этапы и планирование их выполнения",
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
      description: "Адаптация плана выполнения на основе промежуточных результатов",
      category: "complex_task",
      confidence: 0.7,
    },
  ];

  private availableAgents = [
    "qa-specialist",
    "event-processor", 
    "data-analyst",
    "financial-advisor",
    "task-manager",
    "chat-assistant",
  ];

  constructor() {
    super("gpt-4o", 0.3); // Более мощная модель для планирования
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    // Ключевые слова для сложных задач
    const complexTaskKeywords = [
      "анализ", "статистика", "отчет", "сравни", "найди паттерн",
      "оптимизируй", "улучши", "план", "стратегия", "исследование",
      "несколько", "комплексный", "подробный", "детальный"
    ];
    
    const text = task.input.toLowerCase();
    const hasComplexPattern = complexTaskKeywords.some(keyword => text.includes(keyword));
    
    // Проверяем длину запроса (длинные запросы часто сложные)
    const isLongRequest = task.input.length > 100;
    
    // Проверяем тип задачи
    const isComplexType = task.type === "complex_task" || 
                         task.type === "analysis" ||
                         task.type === "planning";
    
    return (hasComplexPattern || isLongRequest) && isComplexType;
  }

  /**
   * Создает инструмент для планирования задач
   */
  private getTaskPlannerTool() {
    return tool({
      description: "Создание плана выполнения сложной задачи с разбивкой на этапы",
      inputSchema: z.object({
        taskDescription: z.string(),
        complexity: z.enum(["medium", "high"]),
      }),
      execute: async ({ taskDescription, complexity }) => {
        // Логика планирования задач
        const commonSteps = {
          analysis: {
            id: "data-analysis",
            description: "Анализ доступных данных",
            requiredAgent: "data-analyst",
            priority: "high" as const,
          },
          financial: {
            id: "financial-review",
            description: "Финансовый анализ и рекомендации",
            requiredAgent: "financial-advisor", 
            priority: "medium" as const,
          },
          planning: {
            id: "task-planning",
            description: "Планирование и организация задач",
            requiredAgent: "task-manager",
            priority: "medium" as const,
          },
          qa: {
            id: "question-answer",
            description: "Ответы на вопросы и предоставление информации",
            requiredAgent: "qa-specialist",
            priority: "low" as const,
          },
        };
        
        const taskLower = taskDescription.toLowerCase();
        const relevantSteps = [];
        
        if (taskLower.includes("анализ") || taskLower.includes("статистика")) {
          relevantSteps.push(commonSteps.analysis);
        }
        if (taskLower.includes("финанс") || taskLower.includes("деньги") || taskLower.includes("расход")) {
          relevantSteps.push(commonSteps.financial);
        }
        if (taskLower.includes("план") || taskLower.includes("задач") || taskLower.includes("организ")) {
          relevantSteps.push(commonSteps.planning);
        }
        if (taskLower.includes("вопрос") || taskLower.includes("объясн")) {
          relevantSteps.push(commonSteps.qa);
        }
        
        // Если шагов мало, добавляем общие
        if (relevantSteps.length === 0) {
          relevantSteps.push(commonSteps.qa);
        }
        
        return {
          steps: relevantSteps,
          executionType: relevantSteps.length > 2 ? "mixed" : "sequential",
          totalSteps: relevantSteps.length,
        };
      },
    });
  }

  /**
   * Создает инструмент для оценки качества выполнения
   */
  private getQualityEvaluatorTool() {
    return tool({
      description: "Оценка качества выполнения этапа задачи",
      inputSchema: z.object({
        stepResult: z.string(),
        expectedOutcome: z.string(),
      }),
      execute: async ({ stepResult, expectedOutcome }) => {
        // Простая эвристическая оценка качества
        const qualityMetrics = {
          completeness: stepResult.length > 50 ? 0.8 : 0.4,
          relevance: stepResult.toLowerCase().includes(expectedOutcome.toLowerCase()) ? 0.9 : 0.5,
          clarity: stepResult.split('.').length > 2 ? 0.7 : 0.5,
        };
        
        const averageScore = Object.values(qualityMetrics).reduce((a, b) => a + b, 0) / 3;
        
        return {
          score: averageScore,
          metrics: qualityMetrics,
          needsImprovement: averageScore < 0.6,
          suggestions: averageScore < 0.6 ? ["Добавить больше деталей", "Уточнить информацию"] : [],
        };
      },
    });
  }

  /**
   * Создает план выполнения сложной задачи
   */
  private async createExecutionPlan(task: AgentTask, telemetry?: AgentTelemetry) {
    const { object: plan } = await generateObject({
      model: this.getModel(),
      schema: orchestrationPlanSchema,
      system: `Ты - архитектор задач в системе Synoro AI. Твоя задача - разбить сложную задачу на управляемые этапы.

ДОСТУПНЫЕ АГЕНТЫ:
- qa-specialist: Ответы на вопросы, информация о системе
- event-processor: Обработка и парсинг событий
- data-analyst: Анализ данных и выявление паттернов  
- financial-advisor: Финансовые советы и анализ расходов
- task-manager: Управление задачами и планирование
- chat-assistant: Общение и поддержка пользователя

ПРИНЦИПЫ ПЛАНИРОВАНИЯ:
1. Разбивай сложные задачи на простые этапы
2. Используй параллельное выполнение для независимых задач
3. Учитывай зависимости между этапами
4. Назначай подходящих агентов для каждого этапа`,
      prompt: `Создай план выполнения задачи: "${task.input}"

Контекст: пользователь ${task.context.userId || "anonymous"} в канале ${task.context.channel}

Определи этапы, их последовательность и ответственных агентов.`,
      temperature: this.defaultTemperature,
      tools: {
        planTask: this.getTaskPlannerTool(),
      },
      experimental_telemetry: {
        isEnabled: true,
        ...this.createTelemetry("create-plan", task, telemetry),
      },
    });

    return plan;
  }

  /**
   * Симулирует выполнение этапа другим агентом
   */
  private async executeStep(
    step: any,
    task: AgentTask,
    telemetry?: AgentTelemetry
  ): Promise<any> {
    // В реальной реализации здесь был бы вызов соответствующего агента
    // Для демонстрации симулируем выполнение
    
    const mockResults = {
      "qa-specialist": `Ответ от специалиста Q&A: обработан вопрос "${step.description}"`,
      "data-analyst": `Анализ данных: выявлены паттерны и тенденции для "${step.description}"`,
      "financial-advisor": `Финансовый совет: рекомендации по "${step.description}"`,
      "event-processor": `Событие обработано: структурированы данные для "${step.description}"`,
      "task-manager": `Задача организована: создан план для "${step.description}"`,
      "chat-assistant": `Диалог поддержан: дружеский ответ для "${step.description}"`,
    };

    const result = mockResults[step.requiredAgent as keyof typeof mockResults] || 
                  `Результат от ${step.requiredAgent}: выполнен этап "${step.description}"`;

    return {
      stepId: step.id,
      success: true,
      result,
      confidence: 0.8,
      needsFollowUp: false,
    };
  }

  async process(task: AgentTask, telemetry?: AgentTelemetry): Promise<AgentResult<{
    plan: any;
    results: any[];
    finalSummary: string;
    qualityScore: number;
  }>> {
    try {
      // 1. Создаем план выполнения
      const plan = await this.createExecutionPlan(task, telemetry);
      
      // 2. Выполняем этапы согласно плану
      const results = [];
      let overallQuality = 0;

      if (plan.executionType === "parallel") {
        // Параллельное выполнение независимых этапов
        const promises = plan.steps.map(step => 
          this.executeStep(step, task, telemetry)
        );
        const parallelResults = await Promise.all(promises);
        results.push(...parallelResults);
      } else {
        // Последовательное выполнение
        for (const step of plan.steps) {
          const stepResult = await this.executeStep(step, task, telemetry);
          results.push(stepResult);
          
          // Оценка качества каждого этапа
          const quality = await this.evaluateStepQuality(stepResult, step);
          overallQuality += quality.score;
          
          // Если качество низкое, можем попробовать улучшить
          if (quality.needsImprovement && quality.suggestions.length > 0) {
            console.log(`Quality improvement needed for step ${step.id}:`, quality.suggestions);
            // Здесь можно добавить логику повторного выполнения
          }
        }
      }

      // 3. Создаем итоговый отчет
      const finalSummary = await this.generateFinalSummary(task, plan, results, telemetry);
      
      const averageQuality = overallQuality / plan.steps.length;

      return this.createSuccessResult(
        {
          plan,
          results,
          finalSummary,
          qualityScore: averageQuality,
        },
        averageQuality,
        `Orchestrated ${plan.steps.length} steps with ${plan.executionType} execution`
      );
    } catch (error) {
      console.error("Error in task orchestrator:", error);
      return this.createErrorResult("Failed to orchestrate complex task");
    }
  }

  /**
   * Оценка качества выполнения этапа
   */
  private async evaluateStepQuality(stepResult: any, step: any) {
    // Простая оценка качества на основе результата
    return {
      score: stepResult.confidence || 0.7,
      needsImprovement: (stepResult.confidence || 0.7) < 0.6,
      suggestions: (stepResult.confidence || 0.7) < 0.6 ? ["Улучшить детализацию"] : [],
    };
  }

  /**
   * Генерация итогового резюме
   */
  private async generateFinalSummary(
    task: AgentTask,
    plan: any,
    results: any[],
    telemetry?: AgentTelemetry
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
${results.map(r => `- ${r.stepId}: ${r.result}`).join('\n')}

Сформируй понятное и полезное резюме для пользователя.`,
      temperature: 0.5,
      experimental_telemetry: {
        isEnabled: true,
        ...this.createTelemetry("generate-summary", task, telemetry),
      },
    });

    return text;
  }
}
