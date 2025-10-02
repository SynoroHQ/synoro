import type {
  AgentContext,
  AgentMiddleware,
  AgentResult,
  BaseAgent,
} from "./agent";

/**
 * Middleware execution context
 */
export interface MiddlewareContext {
  startTime: number;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Middleware manager for handling agent middleware chain
 */
export class AgentMiddlewareManager {
  private middlewares: AgentMiddleware[] = [];

  /**
   * Add middleware to the chain
   */
  use(middleware: AgentMiddleware): void {
    // Insert middleware in priority order (higher priority first)
    const insertIndex = this.middlewares.findIndex(
      (m) => m.priority < middleware.priority,
    );

    if (insertIndex === -1) {
      this.middlewares.push(middleware);
    } else {
      this.middlewares.splice(insertIndex, 0, middleware);
    }
  }

  /**
   * Remove middleware from the chain
   */
  remove(name: string): void {
    this.middlewares = this.middlewares.filter((m) => m.name !== name);
  }

  /**
   * Execute agent with middleware chain
   */
  async executeWithMiddleware(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
  ): Promise<AgentResult> {
    const middlewareContext: MiddlewareContext = {
      startTime: Date.now(),
      requestId: this.generateRequestId(),
      metadata: {},
    };

    let processedContext = context;
    let processedInput = input;

    try {
      // Execute beforeExecute middleware chain
      for (const middleware of this.middlewares) {
        if (middleware.beforeExecute) {
          const result = await middleware.beforeExecute(
            agent,
            processedContext,
            processedInput,
          );
          processedContext = result.context;
          processedInput = result.input;
        }
      }

      // Execute the agent
      let result = await agent.execute(processedContext, processedInput);

      // Execute afterExecute middleware chain (in reverse order)
      for (let i = this.middlewares.length - 1; i >= 0; i--) {
        const middleware = this.middlewares[i];
        if (middleware?.afterExecute) {
          result = await middleware.afterExecute(
            agent,
            processedContext,
            processedInput,
            result,
          );
        }
      }

      return result;
    } catch (error) {
      // Execute error handling middleware chain
      for (const middleware of this.middlewares) {
        if (middleware.onError) {
          const handledResult = await middleware.onError(
            agent,
            processedContext,
            processedInput,
            error as Error,
          );
          if (handledResult) {
            return handledResult;
          }
        }
      }

      // If no middleware handled the error, rethrow it
      throw error;
    }
  }

  /**
   * Get registered middleware
   */
  getMiddleware(): AgentMiddleware[] {
    return [...this.middlewares];
  }

  /**
   * Clear all middleware
   */
  clear(): void {
    this.middlewares = [];
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Logging middleware for agent execution
 */
export class LoggingMiddleware implements AgentMiddleware {
  name = "logging";
  priority = 100;

  async beforeExecute(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
  ): Promise<{ context: AgentContext; input: string }> {
    const config = agent.getConfig();
    console.log(
      `[Agent:${config.key}] Starting execution with input: ${input.substring(0, 100)}...`,
    );

    return { context, input };
  }

  async afterExecute(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
    result: AgentResult,
  ): Promise<AgentResult> {
    const config = agent.getConfig();
    console.log(
      `[Agent:${config.key}] Execution completed with confidence: ${result.confidence}`,
    );

    if (result.errors?.length) {
      console.warn(`[Agent:${config.key}] Errors:`, result.errors);
    }

    return result;
  }

  async onError(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
    error: Error,
  ): Promise<AgentResult | null> {
    const config = agent.getConfig();
    console.error(`[Agent:${config.key}] Execution failed:`, error);

    return null; // Let other middleware or the system handle the error
  }
}

/**
 * Performance monitoring middleware
 */
export class PerformanceMiddleware implements AgentMiddleware {
  name = "performance";
  priority = 90;

  private metrics = new Map<
    string,
    { totalTime: number; executions: number; errors: number }
  >();

  async beforeExecute(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
  ): Promise<{ context: AgentContext; input: string }> {
    const enhancedContext = {
      ...context,
      metadata: {
        ...context.metadata,
        startTime: Date.now(),
      },
    };

    return { context: enhancedContext, input };
  }

  async afterExecute(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
    result: AgentResult,
  ): Promise<AgentResult> {
    const startTime = context.metadata?.startTime as number;
    const executionTime = Date.now() - startTime;

    this.updateMetrics(agent.getConfig().key, executionTime, false);

    return {
      ...result,
      metadata: {
        ...result.metadata,
        executionTime,
      },
    };
  }

  async onError(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
    error: Error,
  ): Promise<AgentResult | null> {
    const startTime = context.metadata?.startTime as number;
    const executionTime = Date.now() - startTime;

    this.updateMetrics(agent.getConfig().key, executionTime, true);

    return null;
  }

  /**
   * Get performance metrics for an agent
   */
  getMetrics(
    agentKey: string,
  ): { avgTime: number; executions: number; errorRate: number } | null {
    const metrics = this.metrics.get(agentKey);
    if (!metrics) return null;

    return {
      avgTime: metrics.totalTime / metrics.executions,
      executions: metrics.executions,
      errorRate: metrics.errors / metrics.executions,
    };
  }

  /**
   * Get metrics for all agents
   */
  getAllMetrics(): Record<
    string,
    { avgTime: number; executions: number; errorRate: number }
  > {
    const result: Record<
      string,
      { avgTime: number; executions: number; errorRate: number }
    > = {};

    for (const [key, metrics] of this.metrics) {
      result[key] = {
        avgTime: metrics.totalTime / metrics.executions,
        executions: metrics.executions,
        errorRate: metrics.errors / metrics.executions,
      };
    }

    return result;
  }

  private updateMetrics(
    agentKey: string,
    executionTime: number,
    isError: boolean,
  ): void {
    const existing = this.metrics.get(agentKey) || {
      totalTime: 0,
      executions: 0,
      errors: 0,
    };

    existing.totalTime += executionTime;
    existing.executions += 1;
    if (isError) {
      existing.errors += 1;
    }

    this.metrics.set(agentKey, existing);
  }
}

/**
 * Rate limiting middleware
 */
export class RateLimitMiddleware implements AgentMiddleware {
  name = "rate-limit";
  priority = 95;

  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async beforeExecute(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
  ): Promise<{ context: AgentContext; input: string }> {
    const key = this.getRateLimitKey(agent, context);
    const now = Date.now();

    let requestData = this.requests.get(key);

    // Reset if window expired
    if (!requestData || now > requestData.resetTime) {
      requestData = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    // Check rate limit
    if (requestData.count >= this.maxRequests) {
      throw new Error(`Rate limit exceeded for agent ${agent.getConfig().key}`);
    }

    // Increment counter
    requestData.count += 1;
    this.requests.set(key, requestData);

    return { context, input };
  }

  private getRateLimitKey(agent: BaseAgent, context: AgentContext): string {
    // Use userId if available, otherwise use telegramChatId or a default key
    return (
      context.userId ||
      context.telegramChatId ||
      `agent_${agent.getConfig().key}`
    );
  }
}

/**
 * Input validation middleware
 */
export class ValidationMiddleware implements AgentMiddleware {
  name = "validation";
  priority = 110; // High priority to validate early

  async beforeExecute(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
  ): Promise<{ context: AgentContext; input: string }> {
    // Basic input validation
    if (!input?.trim()) {
      throw new Error("Input cannot be empty");
    }

    if (input.length > 10000) {
      throw new Error("Input too long (max 10000 characters)");
    }

    // Context validation
    if (!context.currentTime) {
      throw new Error("Current time is required");
    }

    if (!context.timezone) {
      throw new Error("Timezone is required");
    }

    return { context, input };
  }
}

// Global middleware manager instance
export const globalMiddlewareManager = new AgentMiddlewareManager();

// Register default middleware
globalMiddlewareManager.use(new ValidationMiddleware());
globalMiddlewareManager.use(new LoggingMiddleware());
globalMiddlewareManager.use(new PerformanceMiddleware());
globalMiddlewareManager.use(new RateLimitMiddleware());
