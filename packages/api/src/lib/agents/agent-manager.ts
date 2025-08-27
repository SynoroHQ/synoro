import type {
  AgentCapability,
  AgentContext,
  AgentTask,
  AgentTelemetry,
  BaseAgent,
  OrchestrationResult,
} from "./types";
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
import { globalAgentRegistry } from "./agent-registry";

/**
 * Менеджер агентов - центральная точка управления мультиагентной системой
 * Реализует паттерны orchestration и routing из AI SDK
 */
export class AgentManager {
  private router: RouterAgent;
  private qualityEvaluator: QualityEvaluatorAgent;

  constructor() {
    this.initializeAgents();
    this.router = new RouterAgent();
    this.qualityEvaluator = new QualityEvaluatorAgent();
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
   * Обработка сообщения с использованием мультиагентной системы
   */
  async processMessage(
    input: string,
    context: AgentContext,
    options: {
      useQualityControl?: boolean;
      maxQualityIterations?: number;
      targetQuality?: number;
    } = {},
    telemetry?: AgentTelemetry,
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const agentsUsed: string[] = [];
    let totalSteps = 0;

    try {
      // 1. Создаем задачу для роутера
      const routingTask = this.createAgentTask(input, "routing", context);

      // 2. Классифицируем и маршрутизируем сообщение
      console.log("🤖 Starting message routing...");
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

      // 4. Проверяем, может ли агент обработать задачу
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

      // 5. Обрабатываем задачу основным агентом
      console.log(`⚙️ Processing with ${targetAgent.name}...`);
      const processingResult = await targetAgent.process(
        processingTask,
        telemetry,
      );
      agentsUsed.push(targetAgent.name);
      totalSteps++;

      if (!processingResult.success) {
        throw new Error(`Agent processing failed: ${processingResult.error}`);
      }

      let finalResponse = "";
      let qualityScore = processingResult.confidence ?? 0.7;

      // Извлекаем ответ в зависимости от типа агента
      const extracted = this.extractStringResponse(processingResult.data);
      if (extracted !== null) {
        finalResponse = extracted;
      } else {
        // Формируем ответ на основе данных
        finalResponse = this.formatAgentResponse(
          classification.messageType,
          processingResult.data,
        );
      }

      // 6. Контроль качества (если включен)
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
          telemetry,
        );

        agentsUsed.push(this.qualityEvaluator.name);
        totalSteps += iterationsUsed;
        finalResponse = improvedResponse;
        qualityScore = finalQuality;

        console.log(
          `✨ Quality improved: ${qualityScore.toFixed(2)} (${iterationsUsed} iterations)`,
        );
      }

      // 7. Формируем окончательный результат
      const result: OrchestrationResult = {
        finalResponse,
        agentsUsed,
        totalSteps,
        qualityScore,
        metadata: {
          classification,
          routing,
          processingTime: Date.now() - startTime,
          agentData: this.isRecord(processingResult.data)
            ? processingResult.data
            : undefined,
          qualityControlUsed: options.useQualityControl ?? false,
        },
      };

      console.log(
        `✅ Processing completed in ${result.metadata.processingTime}ms`,
      );
      console.log(`📊 Agents used: ${agentsUsed.join(" → ")}`);
      console.log(`⭐ Quality score: ${qualityScore.toFixed(2)}`);

      return result;
    } catch (error) {
      console.error("❌ Error in agent orchestration:", error);

      // Fallback к простому ответу
      return {
        finalResponse:
          "Извините, произошла ошибка при обработке вашего запроса. Попробуйте переформулировать вопрос.",
        agentsUsed: agentsUsed.length > 0 ? agentsUsed : ["error-handler"],
        totalSteps: totalSteps + 1,
        qualityScore: 0.3,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          processingTime: Date.now() - startTime,
        },
      };
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
   * Получение статистики работы агентов
   */
  getAgentStats(): { totalAgents: number; agentList: string[] } {
    const agents = globalAgentRegistry.getAll();
    return {
      totalAgents: agents.size,
      agentList: Array.from(agents.keys()),
    };
  }
}
