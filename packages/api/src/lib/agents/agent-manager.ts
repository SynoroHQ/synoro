import type {
  BaseAgent,
  AgentTask,
  AgentResult,
  AgentTelemetry,
  OrchestrationResult,
  AgentContext,
} from "./types";

// Импорт всех агентов
import { RouterAgent } from "./router-agent";
import { QASpecialistAgent } from "./qa-specialist-agent";
import { EventProcessorAgent } from "./event-processor-agent";
import { TaskOrchestratorAgent } from "./task-orchestrator-agent";
import { QualityEvaluatorAgent } from "./quality-evaluator-agent";

/**
 * Менеджер агентов - центральная точка управления мультиагентной системой
 * Реализует паттерны orchestration и routing из AI SDK
 */
export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();
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
    const agentInstances = [
      new QASpecialistAgent(),
      new EventProcessorAgent(),
      new TaskOrchestratorAgent(),
    ];

    agentInstances.forEach(agent => {
      this.agents.set(this.getAgentKey(agent.name), agent);
    });

    console.log(`Initialized ${this.agents.size} agents:`, Array.from(this.agents.keys()));
  }

  /**
   * Нормализация ключа агента
   */
  private getAgentKey(agentName: string): string {
    return agentName.toLowerCase().replace(/\s+/g, "-");
  }

  /**
   * Получение агента по ключу
   */
  private getAgent(agentKey: string): BaseAgent | undefined {
    return this.agents.get(agentKey);
  }

  /**
   * Создание задачи для агента
   */
  private createAgentTask(
    input: string,
    type: string,
    context: AgentContext,
    priority: number = 1
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
    telemetry?: AgentTelemetry
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
      console.log(`📋 Classification: ${classification.messageType} (${classification.complexity})`);
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
        context
      );

      const canHandle = await targetAgent.canHandle(processingTask);
      if (!canHandle) {
        console.warn(`⚠️ Agent ${routing.targetAgent} cannot handle task, using fallback`);
        // Fallback к QA агенту
        const fallbackAgent = this.getAgent("qa-specialist");
        if (fallbackAgent) {
          const fallbackResult = await fallbackAgent.process(processingTask, telemetry);
          agentsUsed.push(fallbackAgent.name);
          totalSteps++;
          
          return {
            finalResponse: fallbackResult.data || "Извините, произошла ошибка при обработке запроса.",
            agentsUsed,
            totalSteps,
            qualityScore: fallbackResult.confidence || 0.5,
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
      const processingResult = await targetAgent.process(processingTask, telemetry);
      agentsUsed.push(targetAgent.name);
      totalSteps++;

      if (!processingResult.success) {
        throw new Error(`Agent processing failed: ${processingResult.error}`);
      }

      let finalResponse = "";
      let qualityScore = processingResult.confidence || 0.7;

      // Извлекаем ответ в зависимости от типа агента
      if (typeof processingResult.data === "string") {
        finalResponse = processingResult.data;
      } else if (processingResult.data?.response) {
        finalResponse = processingResult.data.response;
      } else if (processingResult.data?.finalSummary) {
        finalResponse = processingResult.data.finalSummary;
      } else {
        // Формируем ответ на основе данных
        finalResponse = this.formatAgentResponse(classification.messageType, processingResult.data);
      }

      // 6. Контроль качества (если включен)
      if (options.useQualityControl && finalResponse) {
        console.log("🔍 Running quality control...");
        
        const qualityResult = await this.qualityEvaluator.evaluateAndImprove(
          input,
          finalResponse,
          options.maxQualityIterations || 2,
          options.targetQuality || 0.8,
          { classification, routing, agentData: processingResult.data },
          telemetry
        );

        agentsUsed.push(this.qualityEvaluator.name);
        totalSteps += qualityResult.iterationsUsed;
        finalResponse = qualityResult.finalResponse;
        qualityScore = qualityResult.finalQuality;

        console.log(`✨ Quality improved: ${qualityScore.toFixed(2)} (${qualityResult.iterationsUsed} iterations)`);
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
          agentData: processingResult.data,
          qualityControlUsed: options.useQualityControl || false,
        },
      };

      console.log(`✅ Processing completed in ${result.metadata.processingTime}ms`);
      console.log(`📊 Agents used: ${agentsUsed.join(" → ")}`);
      console.log(`⭐ Quality score: ${qualityScore.toFixed(2)}`);

      return result;
    } catch (error) {
      console.error("❌ Error in agent orchestration:", error);
      
      // Fallback к простому ответу
      return {
        finalResponse: "Извините, произошла ошибка при обработке вашего запроса. Попробуйте переформулировать вопрос.",
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
  private formatAgentResponse(messageType: string, agentData: any): string {
    switch (messageType) {
      case "event":
        if (agentData?.advice && agentData?.parsedEvent) {
          return `Записал событие: "${agentData.parsedEvent.object || 'событие'}". ${agentData.advice}`;
        }
        if (agentData?.parsedEvent) {
          return `Записал: "${agentData.parsedEvent.object || 'событие'}".`;
        }
        return "Событие записано.";

      case "question":
        return agentData || "Ответ получен.";

      case "complex_task":
        if (agentData?.finalSummary) {
          return agentData.finalSummary;
        }
        return "Сложная задача обработана.";

      case "chat":
        return agentData || "Понял, спасибо за сообщение!";

      default:
        return typeof agentData === "string" ? agentData : "Запрос обработан.";
    }
  }

  /**
   * Получение информации о доступных агентах
   */
  getAvailableAgents(): Array<{ key: string; name: string; description: string; capabilities: any[] }> {
    const result = [];
    
    for (const [key, agent] of this.agents) {
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
    return {
      totalAgents: this.agents.size,
      agentList: Array.from(this.agents.keys()),
    };
  }
}
