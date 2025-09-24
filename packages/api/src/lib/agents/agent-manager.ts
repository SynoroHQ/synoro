import type { MessageHistoryItem } from "@synoro/db";
import { getConversationHistory } from "@synoro/db";

import type { AgentResult, AgentTask, BaseAgent } from "./types";
import { EventAnalyzerAgent } from "./event-analyzer-agent";
import { EventCreationAgent } from "./event-creation-agent";
import { EventProcessorAgent } from "./event-processor-agent";
import { GeneralAssistantAgent } from "./general-assistant-agent";
import { RouterAgent } from "./router-agent";

/**
 * Упрощенный менеджер агентов для работы с тремя основными агентами
 */
export class AgentManager {
  private router: RouterAgent;
  private agents!: Map<string, BaseAgent>;

  constructor() {
    this.initializeAgents();
    this.router = new RouterAgent();
  }

  /**
   * Инициализация четырех основных агентов
   */
  private initializeAgents() {
    this.agents = new Map();

    // Создаем экземпляры агентов
    const eventProcessor = new EventProcessorAgent();
    const eventAnalyzer = new EventAnalyzerAgent();
    const eventCreation = new EventCreationAgent();
    const generalAssistant = new GeneralAssistantAgent();

    // Регистрируем агентов
    this.agents.set("event-processor", eventProcessor);
    this.agents.set("event-analyzer", eventAnalyzer);
    this.agents.set("event-creation", eventCreation);
    this.agents.set("general-assistant", generalAssistant);

    console.log("Initialized 4 core agents:", Array.from(this.agents.keys()));
  }

  /**
   * Получение агента по ключу
   */
  getAgent(agentKey: string): BaseAgent | undefined {
    return this.agents.get(agentKey);
  }

  /**
   * Обработка запроса с автоматической маршрутизацией
   */
  async processRequest(
    input: string,
    context?: any,
  ): Promise<AgentResult<string>> {
    try {
      // Получаем историю диалога если есть контекст пользователя
      let messageHistory: MessageHistoryItem[] = [];
      if (context?.userId && context?.channel && context?.db) {
        try {
          messageHistory = await getConversationHistory({
            db: context.db,
            userId: context.userId,
            channel: context.channel,
            limit: 10, // Берем последние 10 сообщений для контекста
            conversationId: context.conversationId,
          });
        } catch (error) {
          console.warn("Failed to fetch conversation history:", error);
        }
      } else {
        console.log("No context for message history:", {
          hasUserId: !!context?.userId,
          hasChannel: !!context?.channel,
          hasDb: !!context?.db,
        });
      }

      // Создаем задачу для агента с историей
      const task: AgentTask = {
        id: `task-${Date.now()}`,
        input,
        type: "general",
        context: context || {},
        priority: 1,
        createdAt: new Date(),
        messageHistory,
      };

      // Определяем подходящего агента через роутер
      const routingResult = await this.router.process(task);

      if (!routingResult.success || !routingResult.data) {
        // Fallback к GeneralAssistant
        const generalAgent = this.getAgent("general-assistant");
        if (generalAgent) {
          const result = await generalAgent.process(task);
          return {
            success: result.success,
            data: result.data as string,
            error: result.error,
            confidence: result.confidence,
            reasoning: result.reasoning,
          };
        }
        throw new Error("No suitable agent found");
      }

      const targetAgentKey = routingResult.data.targetAgent;
      const targetAgent = this.getAgent(targetAgentKey);

      if (!targetAgent) {
        console.warn(
          `Agent ${targetAgentKey} not found, using general assistant`,
        );
        const generalAgent = this.getAgent("general-assistant");
        if (generalAgent) {
          const result = await generalAgent.process(task);
          return {
            success: result.success,
            data: result.data as string,
            error: result.error,
            confidence: result.confidence,
            reasoning: result.reasoning,
          };
        }
        throw new Error(`Agent ${targetAgentKey} not found`);
      }

      // Обрабатываем запрос через выбранного агента
      const result = await targetAgent.process(task);

      return {
        success: result.success,
        data: result.data as string,
        error: result.error,
        confidence: result.confidence,
        reasoning: result.reasoning,
      };
    } catch (error) {
      console.error("Error in AgentManager:", error);
      return {
        success: false,
        error: "Произошла ошибка при обработке запроса",
        confidence: 0,
        reasoning: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Получение списка доступных агентов
   */
  getAvailableAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Получение объектов агентов для статистики
   */
  getAgentsForStats(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Проверка работоспособности агентов
   */
  async healthCheck(): Promise<{ agent: string; healthy: boolean }[]> {
    const results: { agent: string; healthy: boolean }[] = [];

    for (const [key, agent] of this.agents) {
      try {
        const canHandle = await agent.canHandle({
          id: "health-check",
          input: "test",
          type: "general",
          context: {},
          priority: 1,
          createdAt: new Date(),
        });
        results.push({ agent: key, healthy: canHandle });
      } catch (error) {
        results.push({ agent: key, healthy: false });
      }
    }

    return results;
  }
}
