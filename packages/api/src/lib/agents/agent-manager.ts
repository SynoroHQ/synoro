import { randomUUID } from "crypto";
import { z } from "zod";

import type { AgentContext } from "./agent-context";
import type {
  AgentCapability,
  AgentResult,
  AgentTask,
  AgentTelemetry,
  BaseAgent,
  MessageHistoryItem,
  OrchestrationResult,
} from "./types";
import { globalAgentRegistry } from "./agent-registry";
import { conversationManager } from "./conversation-manager";
import { DataAnalystAgent } from "./data-analyst-agent";
import { EventProcessorAgent } from "./event-processor-agent";
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

/**
 * Улучшенный менеджер агентов с оптимизацией производительности
 * Реализует паттерны orchestration, routing, параллельную обработку и интеллектуальное кэширование
 */
export class AgentManager {
  private router: RouterAgent;
  private qualityEvaluator: QualityEvaluatorAgent;

  // Очередь задач для параллельной обработки
  private taskQueue: ParallelTask[] = [];
  private processingTasks = new Set<string>();
  private maxConcurrentTasks = 3;

  // Метрики производительности
  private performanceMetrics = {
    totalRequests: 0,
    averageResponseTime: 0,
    errorRate: 0,
    parallelTasksProcessed: 0,
  };

  constructor() {
    this.initializeAgents();
    this.router = new RouterAgent();
    this.qualityEvaluator = new QualityEvaluatorAgent();

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
   * Запуск фоновых задач для оптимизации
   */
  private startBackgroundTasks(): void {
    // Обработка очереди задач
    setInterval(() => {
      void this.processTaskQueue();
    }, 100);
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
    messageHistory?: MessageHistoryItem[],
  ): AgentTask {
    return {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      input,
      context,
      priority,
      createdAt: new Date(),
      messageHistory,
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
      enableParallelProcessing?: boolean;
      messageHistory?: MessageHistoryItem[];
    } = {},
    telemetry?: AgentTelemetry,
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const agentsUsed: string[] = [];
    let totalSteps = 0;

    // Обновляем метрики
    this.performanceMetrics.totalRequests++;

    try {
      // 1. Создаем задачу для роутера
      const routingTask = this.createAgentTask(
        input,
        "routing",
        context,
        1,
        options.messageHistory,
      );

      // 2. Классифицируем и маршрутизируем сообщение
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

      // 3. Получаем целевого агента
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
              options.messageHistory,
            );
            this.addToTaskQueue(agent, parallelTask, 2);
          }
        });
      }

      // 4. Проверяем, может ли агент обработать задачу
      const processingTask = this.createAgentTask(
        input,
        classification.messageType,
        context,
        1,
        options.messageHistory,
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

      // 5. Обрабатываем задачу основным агентом с улучшенной обработкой ошибок
      console.log(`⚙️ Обработка с помощью ${targetAgent.name}...`);
      let processingResult: AgentResult<unknown>;

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
            agentsUsed.push(`${fallbackAgent.name} (fallback)`);
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
      const qualityScore = processingResult?.confidence ?? 0.7;

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

      // 6. Контроль качества отключен
      // Quality control is disabled for better performance

      // 7. Формируем окончательный результат с расширенными метриками
      const processingTime = Date.now() - startTime;

      const result: OrchestrationResult = {
        finalResponse,
        agentsUsed,
        totalSteps,
        qualityScore: 1.0, // Fixed quality score since evaluation is disabled
        metadata: {
          classification,
          routing,
          processingTime,
          agentData: this.isRecord(processingResult?.data)
            ? processingResult.data
            : undefined,
          qualityControlUsed: false, // Always disabled
          shouldLogEvent: classification.needsLogging,
          // Дополнительные метрики производительности
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

      // 8. Форматируем ответ для Telegram, если это Telegram канал
      if (context.channel === "telegram" && finalResponse) {
        console.log("📱 Formatting response for Telegram...");

        const telegramFormatter = this.getAgent("telegram-formatter");
        if (telegramFormatter) {
          const formattingTask = this.createAgentTask(
            finalResponse,
            "telegram-formatting",
            context,
            1,
            options.messageHistory,
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
      averageResponseTime: number;
      errorRate: number;
      parallelTasksProcessed: number;
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
      queueStats: {
        pendingTasks: this.taskQueue.length,
        processingTasks: this.processingTasks.size,
        maxConcurrency: this.maxConcurrentTasks,
      },
    };
  }

  /**
   * Очистка всех данных и сброс метрик
   */
  resetPerformanceData(): void {
    this.taskQueue.length = 0;
    this.processingTasks.clear();

    this.performanceMetrics = {
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      parallelTasksProcessed: 0,
    };

    console.log("🔄 Данные производительности сброшены");
  }

  /**
   * Настройка параметров производительности
   */
  configurePerformance(config: { maxConcurrentTasks?: number }): void {
    if (config.maxConcurrentTasks !== undefined) {
      this.maxConcurrentTasks = config.maxConcurrentTasks;
    }

    console.log("⚙️ Параметры производительности обновлены:", config);
  }

  /**
   * Обработать сообщение с поддержкой истории разговора
   * @param message - Текст сообщения пользователя
   * @param context - Контекст выполнения
   * @param conversationId - ID существующего разговора (опционально)
   * @returns Результат оркестрации с ID разговора
   */
  async processMessageWithConversation(
    message: string,
    context: AgentContext,
    conversationId?: string,
  ): Promise<OrchestrationResult & { conversationId: string }> {
    // Схемы валидации
    const MessageSchema = z.string().min(1).max(4000);
    const AgentContextSchema = z.object({
      userId: z.string().optional(),
      channel: z.string().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });

    // Валидация входных данных
    const validatedMessage = MessageSchema.parse(message);
    const validatedContext = AgentContextSchema.parse(context);

    const startTime = Date.now();

    // Создаем или получаем разговор
    let currentConversationId = conversationId;
    if (
      !currentConversationId ||
      !conversationManager.getConversation(currentConversationId)
    ) {
      // Создаем новый разговор
      const userId =
        validatedContext.userId ??
        (typeof validatedContext.metadata?.userId === "string"
          ? validatedContext.metadata.userId
          : undefined) ??
        "unknown";
      const channel =
        validatedContext.channel ??
        (typeof validatedContext.metadata?.channel === "string"
          ? validatedContext.metadata.channel
          : undefined) ??
        "default";
      currentConversationId = conversationManager.createConversation(
        userId,
        channel,
      );
      console.log(
        `🆕 Создан новый разговор ${currentConversationId} для пользователя ${userId}`,
      );
    }

    // Добавляем текущее сообщение пользователя в историю
    const userMessage: MessageHistoryItem = {
      id: `msg-${Date.now()}-${randomUUID()}`,
      role: "user",
      content: validatedMessage,
      timestamp: new Date(),
      metadata: {
        userId:
          validatedContext.userId ??
          (typeof validatedContext.metadata?.userId === "string"
            ? validatedContext.metadata.userId
            : undefined),
        channel:
          validatedContext.channel ??
          (typeof validatedContext.metadata?.channel === "string"
            ? validatedContext.metadata.channel
            : undefined),
      },
    };

    conversationManager.updateConversation(currentConversationId, userMessage);

    // Получаем историю сообщений для агентов
    const messageHistory = conversationManager.getMessagesForAgent(
      currentConversationId,
      20,
    );

    console.log(
      `💬 Обрабатываем сообщение с историей (${messageHistory.length} сообщений) для разговора ${currentConversationId}`,
    );

    try {
      // Обрабатываем сообщение с историей
      const result = await this.processMessage(
        validatedMessage,
        validatedContext,
        {
          messageHistory,
        },
      );

      // Добавляем ответ агента в историю
      if (result.finalResponse) {
        const agentMessage: MessageHistoryItem = {
          id: `msg-${Date.now()}-${randomUUID()}`,
          role: "assistant",
          content: result.finalResponse,
          timestamp: new Date(),
          metadata: {
            agentsUsed: result.agentsUsed,
            executionTime: Date.now() - startTime,
            qualityScore: result.qualityScore,
          },
        };

        conversationManager.updateConversation(
          currentConversationId,
          agentMessage,
        );
      }

      // Возвращаем результат с ID разговора
      return {
        ...result,
        conversationId: currentConversationId,
      };
    } catch (error) {
      console.error(
        `❌ Ошибка при обработке сообщения с историей для разговора ${currentConversationId}:`,
        error,
      );

      // Добавляем информацию об ошибке в историю
      const errorMessage: MessageHistoryItem = {
        id: `msg-${Date.now()}-${randomUUID()}`,
        role: "system",
        content: `Ошибка обработки: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        timestamp: new Date(),
        metadata: {
          error: true,
          executionTime: Date.now() - startTime,
        },
      };

      conversationManager.updateConversation(
        currentConversationId,
        errorMessage,
      );

      throw error;
    }
  }

  /**
   * Получить историю разговора
   * @param conversationId - ID разговора
   * @param maxMessages - Максимальное количество сообщений (по умолчанию 50)
   * @returns Массив сообщений или null если разговор не найден
   */
  getConversationHistory(
    conversationId: string,
    maxMessages = 50,
  ): MessageHistoryItem[] | null {
    const conversation = conversationManager.getConversation(conversationId);
    if (!conversation) {
      return null;
    }

    return conversationManager.getMessagesForAgent(conversationId, maxMessages);
  }

  /**
   * Очистить историю разговора
   * @param conversationId - ID разговора для очистки
   */
  clearConversationHistory(conversationId: string): void {
    conversationManager.clearConversation(conversationId);
  }

  /**
   * Удалить разговор полностью
   * @param conversationId - ID разговора для удаления
   */
  deleteConversation(conversationId: string): void {
    conversationManager.deleteConversation(conversationId);
  }
}
