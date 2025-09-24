import type {
  AgentContext,
  AgentRegistry,
  AgentResult,
  BaseAgent,
} from "./agent";
import type { AgentMiddlewareManager } from "./agent-middleware";

/**
 * Agent selection strategy interface
 */
export interface AgentSelectionStrategy {
  name: string;
  selectAgent(
    agents: BaseAgent[],
    context: AgentContext,
    input: string,
  ): Promise<BaseAgent | null>;
}

/**
 * Agent orchestration result
 */
export interface OrchestrationResult {
  result: AgentResult;
  selectedAgent: string;
  executionTime: number;
  fallbackUsed?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Agent orchestrator configuration
 */
export interface OrchestratorConfig {
  enableFallback?: boolean;
  fallbackAgent?: string;
  maxExecutionTime?: number;
  enableRetries?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Agent orchestrator for coordinating agent execution
 */
export class AgentOrchestrator {
  private registry: AgentRegistry;
  private middlewareManager: AgentMiddlewareManager;
  private config: OrchestratorConfig;
  private selectionStrategy: AgentSelectionStrategy;

  constructor(
    registry: AgentRegistry,
    middlewareManager: AgentMiddlewareManager,
    selectionStrategy: AgentSelectionStrategy,
    config: OrchestratorConfig = {},
  ) {
    this.registry = registry;
    this.middlewareManager = middlewareManager;
    this.selectionStrategy = selectionStrategy;
    this.config = {
      enableFallback: true,
      fallbackAgent: "general-assistant-agent",
      maxExecutionTime: 30000,
      enableRetries: true,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Execute request with agent orchestration
   */
  async execute(
    context: AgentContext,
    input: string,
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();

    try {
      // Select appropriate agent
      const selectedAgent = await this.selectAgent(context, input);

      if (!selectedAgent) {
        throw new Error("No suitable agent found for the request");
      }

      // Execute agent with middleware and retries
      const result = await this.executeWithRetries(
        selectedAgent,
        context,
        input,
      );

      return {
        result,
        selectedAgent: selectedAgent.getConfig().key,
        executionTime: Date.now() - startTime,
        metadata: {
          strategy: this.selectionStrategy.name,
          retries: 0,
        },
      };
    } catch (error) {
      // Try fallback agent if enabled
      if (this.config.enableFallback) {
        return await this.executeFallback(
          context,
          input,
          startTime,
          error as Error,
        );
      }

      throw error;
    }
  }

  /**
   * Select the best agent for the given context and input
   */
  async selectAgent(
    context: AgentContext,
    input: string,
  ): Promise<BaseAgent | null> {
    // Get all capable agents
    const capableAgents = await this.registry.getCapableAgents(context, input);

    if (capableAgents.length === 0) {
      return null;
    }

    // Use selection strategy to pick the best agent
    return await this.selectionStrategy.selectAgent(
      capableAgents,
      context,
      input,
    );
  }

  /**
   * Execute agent with retry logic
   */
  private async executeWithRetries(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
  ): Promise<AgentResult> {
    let lastError: Error | null = null;
    const maxRetries = this.config.enableRetries
      ? this.config.maxRetries || 3
      : 1;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Set timeout for execution
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                `Agent execution timeout after ${this.config.maxExecutionTime}ms`,
              ),
            );
          }, this.config.maxExecutionTime);
        });

        const executionPromise = this.middlewareManager.executeWithMiddleware(
          agent,
          context,
          input,
        );

        return await Promise.race([executionPromise, timeoutPromise]);
      } catch (error) {
        lastError = error as Error;

        // If this is the last attempt, don't wait
        if (attempt === maxRetries - 1) {
          break;
        }

        // Wait before retrying
        await this.sleep(this.config.retryDelay || 1000);
      }
    }

    throw lastError || new Error("Unknown error during agent execution");
  }

  /**
   * Execute fallback agent
   */
  private async executeFallback(
    context: AgentContext,
    input: string,
    startTime: number,
    originalError: Error,
  ): Promise<OrchestrationResult> {
    try {
      const fallbackAgent = this.registry.get(
        this.config.fallbackAgent || "general-assistant-agent",
      );

      if (!fallbackAgent) {
        throw new Error(
          `Fallback agent '${this.config.fallbackAgent}' not found`,
        );
      }

      const result = await this.executeWithRetries(
        fallbackAgent,
        context,
        input,
      );

      return {
        result,
        selectedAgent: fallbackAgent.getConfig().key,
        executionTime: Date.now() - startTime,
        fallbackUsed: true,
        metadata: {
          strategy: this.selectionStrategy.name,
          originalError: originalError.message,
        },
      };
    } catch (fallbackError) {
      // If fallback also fails, return error result
      return {
        result: {
          response:
            "Извините, произошла ошибка при обработке запроса. Попробуйте переформулировать или повторить позже.",
          confidence: 0,
          needsConfirmation: false,
          errors: [originalError.message, (fallbackError as Error).message],
        },
        selectedAgent: "error",
        executionTime: Date.now() - startTime,
        fallbackUsed: true,
        metadata: {
          strategy: this.selectionStrategy.name,
          originalError: originalError.message,
          fallbackError: (fallbackError as Error).message,
        },
      };
    }
  }

  /**
   * Update orchestrator configuration
   */
  updateConfig(config: Partial<OrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Update agent selection strategy
   */
  updateSelectionStrategy(strategy: AgentSelectionStrategy): void {
    this.selectionStrategy = strategy;
  }

  /**
   * Get current configuration
   */
  getConfig(): OrchestratorConfig {
    return { ...this.config };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Router-based agent selection strategy
 */
export class RouterBasedStrategy implements AgentSelectionStrategy {
  name = "router-based";

  async selectAgent(
    agents: BaseAgent[],
    context: AgentContext,
    input: string,
  ): Promise<BaseAgent | null> {
    // Find router agent
    const routerAgent = agents.find(
      (agent) =>
        agent.getConfig().key === "router-agent" ||
        agent.getCapabilities().canRoute,
    );

    if (!routerAgent) {
      // Fall back to first capable agent
      return agents[0] || null;
    }

    try {
      // Use router agent to determine the best agent
      const routerResult = await routerAgent.execute(context, input);
      const selectedAgentKey = routerResult.response.trim();

      // Find the selected agent
      const selectedAgent = agents.find(
        (agent) => agent.getConfig().key === selectedAgentKey,
      );

      return selectedAgent || agents[0] || null;
    } catch (error) {
      console.warn(
        "Router agent failed, falling back to first available agent:",
        error,
      );
      return agents[0] || null;
    }
  }
}

/**
 * Capability-based agent selection strategy
 */
export class CapabilityBasedStrategy implements AgentSelectionStrategy {
  name = "capability-based";

  async selectAgent(
    agents: BaseAgent[],
    context: AgentContext,
    input: string,
  ): Promise<BaseAgent | null> {
    // Analyze input to determine required capabilities
    const requiredCapabilities = this.analyzeRequiredCapabilities(input);

    // Score agents based on how well they match the required capabilities
    const scoredAgents = agents.map((agent) => ({
      agent,
      score: this.calculateCapabilityScore(agent, requiredCapabilities),
    }));

    // Sort by score descending
    scoredAgents.sort((a, b) => b.score - a.score);

    return scoredAgents[0]?.agent || null;
  }

  private analyzeRequiredCapabilities(input: string): string[] {
    const capabilities: string[] = [];
    const lowerInput = input.toLowerCase();

    // Analyze keywords to determine capabilities
    if (
      lowerInput.includes("потратил") ||
      lowerInput.includes("купил") ||
      lowerInput.includes("заплатил")
    ) {
      capabilities.push("canProcessEvents");
    }

    if (
      lowerInput.includes("статистика") ||
      lowerInput.includes("анализ") ||
      lowerInput.includes("отчет")
    ) {
      capabilities.push("canAnalyzeData");
    }

    if (
      lowerInput.includes("как") ||
      lowerInput.includes("что такое") ||
      lowerInput.includes("помоги")
    ) {
      capabilities.push("canProvideHelp");
    }

    return capabilities;
  }

  private calculateCapabilityScore(
    agent: BaseAgent,
    requiredCapabilities: string[],
  ): number {
    const agentCapabilities = agent.getCapabilities();
    let score = 0;

    for (const capability of requiredCapabilities) {
      if (agentCapabilities[capability as keyof typeof agentCapabilities]) {
        score += 1;
      }
    }

    // Bonus for general assistant capabilities
    if (agentCapabilities.canProvideHelp) {
      score += 0.1;
    }

    return score;
  }
}

/**
 * Round-robin agent selection strategy
 */
export class RoundRobinStrategy implements AgentSelectionStrategy {
  name = "round-robin";
  private currentIndex = 0;

  async selectAgent(
    agents: BaseAgent[],
    context: AgentContext,
    input: string,
  ): Promise<BaseAgent | null> {
    if (agents.length === 0) {
      return null;
    }

    const agent = agents[this.currentIndex % agents.length];
    this.currentIndex = (this.currentIndex + 1) % agents.length;

    return agent || null;
  }
}

/**
 * Weighted random agent selection strategy
 */
export class WeightedRandomStrategy implements AgentSelectionStrategy {
  name = "weighted-random";
  private weights: Map<string, number> = new Map();

  constructor(weights: Record<string, number> = {}) {
    this.weights = new Map(Object.entries(weights));
  }

  async selectAgent(
    agents: BaseAgent[],
    context: AgentContext,
    input: string,
  ): Promise<BaseAgent | null> {
    if (agents.length === 0) {
      return null;
    }

    if (agents.length === 1) {
      return agents[0] || null;
    }

    // Calculate total weight
    let totalWeight = 0;
    const agentWeights = agents.map((agent) => {
      const weight = this.weights.get(agent.getConfig().key) || 1;
      totalWeight += weight;
      return { agent, weight };
    });

    // Generate random number
    const random = Math.random() * totalWeight;

    // Select agent based on weighted probability
    let currentWeight = 0;
    for (const { agent, weight } of agentWeights) {
      currentWeight += weight;
      if (random <= currentWeight) {
        return agent;
      }
    }

    // Fallback to last agent
    return agents.length > 0 ? agents[agents.length - 1] || null : null;
  }

  /**
   * Update weights for agents
   */
  updateWeights(weights: Record<string, number>): void {
    for (const [key, weight] of Object.entries(weights)) {
      this.weights.set(key, weight);
    }
  }
}
