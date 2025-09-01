import type { AgentContext } from "./agent-context";
import type {
  AgentCapability,
  AgentTask,
  AgentTelemetry,
  BaseAgent,
  OrchestrationResult,
} from "./types";
import { globalAgentRegistry } from "./agent-registry";
import { DataAnalystAgent } from "./data-analyst-agent";
import { EventProcessorAgent } from "./event-processor-agent";
import { FastResponseAgent } from "./fast-response-agent";
import { GeneralAssistantAgent } from "./general-assistant-agent";
import { QASpecialistAgent } from "./qa-specialist-agent";
import { QualityEvaluatorAgent } from "./quality-evaluator-agent";
// Импорт всех агентов
import { RouterAgent } from "./router-agent";
import { TaskManagerAgent } from "./task-manager-agent";
import { TaskOrchestratorAgent } from "./task-orchestrator-agent";
import { TelegramFormatterAgent } from "./telegram-formatter-agent";

// Интерфейс для параллельной обработки
interface ParallelTask {
  id: string;
  agent: BaseAgent;
  task: AgentTask;
  priority: number;
}

// Интерфейс для кэша результатов
interface CachedResult {
  result: OrchestrationResult;
  timestamp: number;
  inputHash: string;
}

/**
 * Улучшенный менеджер агентов с оптимизацией производительности
 * Реализует паттерны orchestration, routing, параллельную обработку и интеллектуальное кэширование
 */
export class AgentManager {
  private router: RouterAgent;
  private qualityEvaluator: QualityEvaluatorAgent;
  private fastResponseAgent: FastResponseAgent;

  // Система кэширования для повышения производительности
  private resultCache = new Map<string, CachedResult>();
  private cacheTimeout = 15 * 60 * 1000; // 15 минут
  private maxCacheSize = 1000;

  // Очередь задач для параллельной обработки
  private taskQueue: ParallelTask[] = [];
  private processingTasks = new Set<string>();
  private maxConcurrentTasks = 3;

  // Метрики производительности
  private performanceMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    averageResponseTime: 0,
    errorRate: 0,
    parallelTasksProcessed: 0,
  };

  constructor() {
    this.initializeAgents();
    this.router = new RouterAgent();
    this.qualityEvaluator = new QualityEvaluatorAgent();
    this.fastResponseAgent = new FastResponseAgent();

    // Запускаем фоновые процессы
    this.startBackgroundTasks();
  }

  /**
   * Инициализация всех доступных агентов
   */
  private initializeAgents() {
    // Проверяем, есть ли уже зарегистрированные агенты
    if (globalAgentRegistry.getAll().size === 0) {
      const agentInstances = [
        new QASpecialistAgent(),
        new EventProcessorAgent(),
        new TaskOrchestratorAgent(),
        new GeneralAssistantAgent(),
        new DataAnalystAgent(),
        new TaskManagerAgent(),
        new TelegramFormatterAgent(),
        new FastResponseAgent(),
      ];

      agentInstances.forEach((agent) => {
        globalAgentRegistry.register(agent);
      });

      console.log(
        `Initialized ${globalAgentRegistry.getAll().size} agents:`,
        Array.from(globalAgentRegistry.getAll().keys()),
      );
    } else {
      console.log(
        `Using existing ${globalAgentRegistry.getAll().size} agents from registry:`,
        Array.from(globalAgentRegistry.getAll().keys()),
      );
    }
  }

  /**
   * Получение агента по ключу
   */
  getAgent(agentKey: string): BaseAgent | undefined {
    return globalAgentRegistry.get(agentKey);
  }

  /**
   * Создание хэша для входных данных
   */
  private createInputHash(input: string, context: AgentContext): string {
    const contextStr = JSON.stringify({
      channel: context.channel,
      userId: context.userId,
      // Исключаем изменяющиеся поля
    });
    return `${input.slice(0, 100)}-${contextStr}`
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 64);
  }

  /**
   * Получение кэшированного результата
   */
  private getCachedResult(
    input: string,
    context: AgentContext,
  ): OrchestrationResult | null {
    const hash = this.createInputHash(input, context);
    const cached = this.resultCache.get(hash);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      this.performanceMetrics.cacheHits++;
      console.log("🚀 Использован кэшированный результат");
      return cached.result;
    }

    if (cached) {
      this.resultCache.delete(hash);
    }

    return null;
  }

  /**
   * Сохранение результата в кэш
   */
  private setCachedResult(
    input: string,
    context: AgentContext,
    result: OrchestrationResult,
  ): void {
    // Управление размером кэша
    if (this.resultCache.size >= this.maxCacheSize) {
      const oldestKey = this.resultCache.keys().next().value;
      if (oldestKey) {
        this.resultCache.delete(oldestKey);
      }
    }

    const hash = this.createInputHash(input, context);
    this.resultCache.set(hash, {
      result,
      timestamp: Date.now(),
      inputHash: hash,
    });
  }

  /**
   * Запуск фоновых задач для оптимизации
   */
  private startBackgroundTasks(): void {
    // Очистка кэша каждые 5 минут
    setInterval(
      () => {
        this.cleanupCache();
      },
      5 * 60 * 1000,
    );

    // Обработка очереди задач
    setInterval(() => {
      void this.processTaskQueue();
    }, 100);
  }

  /**
   * Очистка устаревшего кэша
   */
  private cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, cached] of this.resultCache.entries()) {
      if (now - cached.timestamp > this.cacheTimeout) {
        this.resultCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Очищено ${cleaned} устаревших записей кэша`);
    }
  }

  /**
   * Обработка очереди параллельных задач
   */
  private async processTaskQueue(): Promise<void> {
    if (
      this.taskQueue.length === 0 ||
      this.processingTasks.size >= this.maxConcurrentTasks
    ) {
      return;
    }

    // Сортируем по приоритету
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    const task = this.taskQueue.shift();
    if (!task) return;

    this.processingTasks.add(task.id);

    try {
      await task.agent.process(task.task);
      this.performanceMetrics.parallelTasksProcessed++;
    } catch (error) {
      console.error(`Ошибка в параллельной задаче ${task.id}:`, error);
    } finally {
      this.processingTasks.delete(task.id);
    }
  }

  /**
   * Добавление задачи в очередь для параллельной обработки
   */
  private addToTaskQueue(
    agent: BaseAgent,
    task: AgentTask,
    priority = 1,
  ): void {
    this.taskQueue.push({
      id: `parallel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agent,
      task,
      priority,
    });
  }

  /**
   * Узкий type guard для объектов
   */
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  /**
   * Пытается извлечь строковый ответ из результата агента произвольного типа
   */
  private extractStringResponse(data: unknown): string | null {
    if (typeof data === "string") return data;
    if (this.isRecord(data)) {
      const maybeResponse = data.response;
      if (typeof maybeResponse === "string") return maybeResponse;

      const maybeFinal = data.finalSummary;
      if (typeof maybeFinal === "string") return maybeFinal;
    }
    return null;
  }

  /**
   * Создание задачи для агента
   */
  private createAgentTask(
    input: string,
    type: string,
    context: AgentContext,
    priority = 1,
  ): AgentTask {
    return {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      input,
      context,
      priority,
      createdAt: new Date(),
    };
  }

  /**
   * Улучшенная обработка сообщения с оптимизацией производительности
   */
  async processMessage(
    input: string,
    context: AgentContext,
    options: {
      useQualityControl?: boolean;
      maxQualityIterations?: number;
      targetQuality?: number;
      useCache?: boolean;
      enableParallelProcessing?: boolean;
    } = {},
    telemetry?: AgentTelemetry,
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const agentsUsed: string[] = [];
    let totalSteps = 0;

    // Обновляем метрики
    this.performanceMetrics.totalRequests++;

    try {
      // 1. Проверяем кэш (если включен)
      if (options.useCache !== false) {
        const cachedResult = this.getCachedResult(input, context);
        if (cachedResult) {
          // Обновляем время ответа в кэшированном результате
          cachedResult.metadata.processingTime = Date.now() - startTime;
          cachedResult.metadata.fromCache = true;
          return cachedResult;
        }
      }

      // 2. Проверяем возможность быстрого ответа через ИИ
      if (
        await this.fastResponseAgent.canHandle(
          this.createAgentTask(input, "fast-response", context),
        )
      ) {
        console.log("⚡ Попытка быстрого ИИ-ответа...");
        const fastResult = await this.fastResponseAgent.process(
          this.createAgentTask(input, "fast-response", context),
          telemetry,
        );

        if (
          fastResult.success &&
          fastResult.confidence &&
          fastResult.confidence > 0.7
        ) {
          const fastProcessingTime = Date.now() - startTime;
          agentsUsed.push(this.fastResponseAgent.name);
          totalSteps++;

          const fastResponse: OrchestrationResult = {
            finalResponse: fastResult.data!,
            agentsUsed,
            totalSteps,
            qualityScore: fastResult.confidence,
            metadata: {
              processingTime: fastProcessingTime,
              fastResponse: true,
              responseTimeCategory: "fast",
              agentEfficiency:
                fastResult.confidence / (fastProcessingTime / 1000),
            },
          };

          console.log(`⚡ Быстрый ИИ-ответ за ${fastProcessingTime}ms`);

          // Кэшируем быстрый ответ
          if (options.useCache !== false) {
            this.setCachedResult(input, context, fastResponse);
          }

          return fastResponse;
        }
      }
      // 3. Создаем задачу для роутера
      const routingTask = this.createAgentTask(input, "routing", context);

      // 4. Классифицируем и маршрутизируем сообщение
      console.log("🤖 Запуск интеллектуальной маршрутизации...");
      const routingResult = await this.router.process(routingTask, telemetry);
      agentsUsed.push(this.router.name);
      totalSteps++;

      if (!routingResult.success || !routingResult.data) {
        throw new Error("Failed to route message");
      }

      const { classification, routing } = routingResult.data;
      console.log(
        `📋 Classification: ${classification.messageType} (${classification.complexity})`,
      );
      console.log(`🎯 Routed to: ${routing.targetAgent}`);

      // 5. Получаем целевого агента
      const targetAgent = this.getAgent(routing.targetAgent);
      if (!targetAgent) {
        throw new Error(`Target agent not found: ${routing.targetAgent}`);
      }

      // Проверяем возможность параллельной обработки
      const canUseParallel =
        options.enableParallelProcessing &&
        classification.complexity === "complex" &&
        routing.shouldParallel;

      if (canUseParallel && routing.followUpAgents?.length) {
        console.log("⚡ Включена параллельная обработка для сложной задачи");
        // Добавляем дополнительные агенты в очередь
        routing.followUpAgents.forEach((agentKey) => {
          const agent = this.getAgent(agentKey);
          if (agent) {
            const parallelTask = this.createAgentTask(
              input,
              classification.messageType,
              context,
              2,
            );
            this.addToTaskQueue(agent, parallelTask, 2);
          }
        });
      }

      // 6. Проверяем, может ли агент обработать задачу
      const processingTask = this.createAgentTask(
        input,
        classification.messageType,
        context,
      );

      const canHandle = await targetAgent.canHandle(processingTask);
      if (!canHandle) {
        console.warn(
          `⚠️ Agent ${routing.targetAgent} cannot handle task, using fallback`,
        );
        // Fallback к QA агенту
        const fallbackAgent = this.getAgent("qa-specialist");
        if (fallbackAgent) {
          const fallbackResult = await fallbackAgent.process(
            processingTask,
            telemetry,
          );
          agentsUsed.push(fallbackAgent.name);
          totalSteps++;

          return {
            finalResponse:
              this.extractStringResponse(fallbackResult.data) ??
              "Извините, произошла ошибка при обработке запроса.",
            agentsUsed,
            totalSteps,
            qualityScore: fallbackResult.confidence ?? 0.5,
            metadata: {
              classification,
              routing,
              fallbackUsed: true,
              processingTime: Date.now() - startTime,
            },
          };
        }
      }

      // 7. Обрабатываем задачу основным агентом с улучшенной обработкой ошибок
      console.log(`⚙️ Обработка с помощью ${targetAgent.name}...`);
      let processingResult: any;

      try {
        processingResult = (await Promise.race([
          targetAgent.process(processingTask, telemetry),
          new Promise(
            (_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 30000), // 30 секунд таймаут
          ),
        ])) as any;
      } catch (error) {
        if (error instanceof Error && error.message === "Timeout") {
          console.warn(
            `⏰ Таймаут для агента ${targetAgent.name}, используем fallback`,
          );
          const fallbackAgent = this.getAgent("general-assistant");
          if (fallbackAgent) {
            processingResult = await fallbackAgent.process(
              processingTask,
              telemetry,
            );
            agentsUsed.push(fallbackAgent.name + " (fallback)");
          } else {
            throw new Error("Fallback agent not available");
          }
        } else {
          throw error;
        }
      }

      agentsUsed.push(targetAgent.name);
      totalSteps++;

      if (!processingResult?.success) {
        throw new Error(
          `Agent processing failed: ${processingResult?.error ?? "Unknown error"}`,
        );
      }

      let finalResponse = "";
      let qualityScore = processingResult?.confidence ?? 0.7;

      // Извлекаем ответ в зависимости от типа агента
      const extracted = this.extractStringResponse(processingResult?.data);
      if (extracted !== null) {
        finalResponse = extracted;
      } else {
        // Формируем ответ на основе данных
        finalResponse = this.formatAgentResponse(
          classification.messageType,
          processingResult?.data,
        );
      }

      // 8. Контроль качества (если включен)
      if (options.useQualityControl && finalResponse) {
        console.log("🔍 Running quality control...");

        const {
          iterationsUsed,
          finalResponse: improvedResponse,
          finalQuality,
        } = await this.qualityEvaluator.evaluateAndImprove(
          input,
          finalResponse,
          options.maxQualityIterations ?? 2,
          options.targetQuality ?? 0.8,
          processingTask,
          context,
        );

        agentsUsed.push(this.qualityEvaluator.name);
        totalSteps += iterationsUsed;
        finalResponse = improvedResponse;
        qualityScore = finalQuality;

        console.log(
          `✨ Quality improved: ${qualityScore.toFixed(2)} (${iterationsUsed} iterations)`,
        );
      }

      // 9. Формируем окончательный результат с расширенными метриками
      const processingTime = Date.now() - startTime;

      const result: OrchestrationResult = {
        finalResponse,
        agentsUsed,
        totalSteps,
        qualityScore,
        metadata: {
          classification,
          routing,
          processingTime,
          agentData: this.isRecord(processingResult?.data)
            ? processingResult.data
            : undefined,
          qualityControlUsed: options.useQualityControl ?? false,
          shouldLogEvent: classification.needsLogging,
          // Дополнительные метрики производительности
          cacheUsed: false,
          parallelProcessingUsed: canUseParallel,
          responseTimeCategory:
            processingTime < 1000
              ? "fast"
              : processingTime < 3000
                ? "medium"
                : "slow",
          agentEfficiency: qualityScore / (processingTime / 1000), // качество/секунда
        },
      };

      // Обновляем метрики производительности
      this.updatePerformanceMetrics(processingTime, true);

      // 10. Форматируем ответ для Telegram, если это Telegram канал
      if (context.channel === "telegram" && finalResponse) {
        console.log("📱 Formatting response for Telegram...");

        const telegramFormatter = this.getAgent("telegram-formatter");
        if (telegramFormatter) {
          const formattingTask = this.createAgentTask(
            finalResponse,
            "telegram-formatting",
            context,
            1,
          );

          try {
            const formattingResult = await telegramFormatter.process(
              formattingTask,
              telemetry,
            );
            if (formattingResult.success && formattingResult.data) {
              result.finalResponse = formattingResult.data as string;
              agentsUsed.push(telegramFormatter.name);
              totalSteps++;
              console.log("✅ Response formatted for Telegram");
            }
          } catch (error) {
            console.warn(
              "⚠️ Telegram formatting failed, using original response:",
              error,
            );
          }
        }
      }

      console.log(
        `✅ Обработка завершена за ${processingTime}ms с ${totalSteps} шагами`,
      );
      console.log(`📊 Использованные агенты: ${agentsUsed.join(" → ")}`);
      console.log(`⭐ Оценка качества: ${qualityScore.toFixed(2)}`);
      console.log(
        `🚀 Эффективность: ${(result.metadata.agentEfficiency as number)?.toFixed(2) ?? "N/A"} качество/сек`,
      );

      // Сохраняем в кэш (если включен)
      if (options.useCache !== false && qualityScore > 0.7) {
        this.setCachedResult(input, context, result);
      }

      return result;
    } catch (error) {
      console.error("❌ Ошибка в оркестрации агентов:", error);

      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime, false);

      // Пробрасываем ошибку дальше для обработки на уровне выше
      throw error;
    }
  }

  /**
   * Обновление метрик производительности
   */
  private updatePerformanceMetrics(
    processingTime: number,
    success: boolean,
  ): void {
    // Обновляем среднее время ответа
    this.performanceMetrics.averageResponseTime =
      (this.performanceMetrics.averageResponseTime *
        (this.performanceMetrics.totalRequests - 1) +
        processingTime) /
      this.performanceMetrics.totalRequests;

    // Обновляем частоту ошибок
    if (!success) {
      this.performanceMetrics.errorRate =
        (this.performanceMetrics.errorRate *
          (this.performanceMetrics.totalRequests - 1) +
          1) /
        this.performanceMetrics.totalRequests;
    } else {
      this.performanceMetrics.errorRate =
        (this.performanceMetrics.errorRate *
          (this.performanceMetrics.totalRequests - 1)) /
        this.performanceMetrics.totalRequests;
    }
  }

  /**
   * Форматирование ответа агента в зависимости от типа
   */
  private formatAgentResponse(messageType: string, agentData: unknown): string {
    switch (messageType) {
      case "event":
        if (this.isRecord(agentData)) {
          const adv = agentData.advice;
          const parsed = agentData.parsedEvent;
          let objectName = "событие";
          if (this.isRecord(parsed)) {
            const objVal = (parsed as { object?: unknown }).object;
            if (typeof objVal === "string") objectName = objVal;
            const adviceStr = typeof adv === "string" ? adv : null;
            if (adviceStr) {
              return `Записал событие: "${objectName}". ${adviceStr}`;
            }
            return `Записал: "${objectName}".`;
          }
        }
        return "Событие записано.";

      case "question":
        return typeof agentData === "string" ? agentData : "Ответ получен.";

      case "complex_task":
        if (this.isRecord(agentData)) {
          const final = agentData.finalSummary;
          if (typeof final === "string") return final;
        }
        return "Сложная задача обработана.";

      case "chat":
        return typeof agentData === "string"
          ? agentData
          : "Понял, спасибо за сообщение!";

      default:
        return typeof agentData === "string" ? agentData : "Запрос обработан.";
    }
  }

  /**
   * Получение информации о доступных агентах
   */
  getAvailableAgents(): {
    key: string;
    name: string;
    description: string;
    capabilities: AgentCapability[];
  }[] {
    const result = [];
    const agents = globalAgentRegistry.getAll();

    for (const [key, agent] of agents) {
      result.push({
        key,
        name: agent.name,
        description: agent.description,
        capabilities: agent.capabilities,
      });
    }

    return result;
  }

  /**
   * Получение расширенной статистики работы агентов
   */
  getAgentStats(): {
    totalAgents: number;
    agentList: string[];
    performance: {
      totalRequests: number;
      cacheHits: number;
      averageResponseTime: number;
      errorRate: number;
      parallelTasksProcessed: number;
    };
    cacheStats: {
      size: number;
      hitRate: number;
      memoryUsage: string;
    };
    queueStats: {
      pendingTasks: number;
      processingTasks: number;
      maxConcurrency: number;
    };
  } {
    const agents = globalAgentRegistry.getAll();

    return {
      totalAgents: agents.size,
      agentList: Array.from(agents.keys()),
      performance: { ...this.performanceMetrics },
      cacheStats: {
        size: this.resultCache.size,
        hitRate:
          this.performanceMetrics.totalRequests > 0
            ? this.performanceMetrics.cacheHits /
              this.performanceMetrics.totalRequests
            : 0,
        memoryUsage: `${Math.round(this.resultCache.size * 0.001)} KB`, // Приблизительная оценка
      },
      queueStats: {
        pendingTasks: this.taskQueue.length,
        processingTasks: this.processingTasks.size,
        maxConcurrency: this.maxConcurrentTasks,
      },
    };
  }

  /**
   * Очистка всех кэшей и сброс метрик
   */
  resetPerformanceData(): void {
    this.resultCache.clear();
    this.taskQueue.length = 0;
    this.processingTasks.clear();

    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      averageResponseTime: 0,
      errorRate: 0,
      parallelTasksProcessed: 0,
    };

    console.log("🔄 Данные производительности сброшены");
  }

  /**
   * Настройка параметров производительности
   */
  configurePerformance(config: {
    maxCacheSize?: number;
    cacheTimeout?: number;
    maxConcurrentTasks?: number;
  }): void {
    if (config.maxCacheSize !== undefined) {
      this.maxCacheSize = config.maxCacheSize;
    }
    if (config.cacheTimeout !== undefined) {
      this.cacheTimeout = config.cacheTimeout;
    }
    if (config.maxConcurrentTasks !== undefined) {
      this.maxConcurrentTasks = config.maxConcurrentTasks;
    }

    console.log("⚙️ Параметры производительности обновлены:", config);
  }
}
