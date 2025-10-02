import type { AgentContext, AgentResult, BaseAgent } from "./agent";

/**
 * Error types for agent execution
 */
export enum AgentErrorType {
  TIMEOUT = "timeout",
  VALIDATION = "validation",
  EXECUTION = "execution",
  RATE_LIMIT = "rate_limit",
  CONFIGURATION = "configuration",
  NETWORK = "network",
  PARSING = "parsing",
  PERMISSION = "permission",
  UNKNOWN = "unknown",
}

/**
 * Agent error class with enhanced error information
 */
export class AgentError extends Error {
  public readonly type: AgentErrorType;
  public readonly agentKey: string;
  public readonly context?: AgentContext;
  public readonly input?: string;
  public readonly retryable: boolean;
  public readonly statusCode?: number;
  public readonly metadata?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: AgentErrorType,
    agentKey: string,
    options: {
      context?: AgentContext;
      input?: string;
      retryable?: boolean;
      statusCode?: number;
      metadata?: Record<string, unknown>;
      cause?: Error;
    } = {},
  ) {
    super(message);
    this.name = "AgentError";
    this.type = type;
    this.agentKey = agentKey;
    this.context = options.context;
    this.input = options.input;
    this.retryable = options.retryable ?? this.isRetryableByType(type);
    this.statusCode = options.statusCode;
    this.metadata = options.metadata;
    this.timestamp = new Date();

    if (options.cause) {
      this.cause = options.cause;
    }

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentError);
    }
  }

  private isRetryableByType(type: AgentErrorType): boolean {
    const retryableTypes: AgentErrorType[] = [
      AgentErrorType.TIMEOUT,
      AgentErrorType.NETWORK,
      AgentErrorType.RATE_LIMIT,
    ];
    return retryableTypes.includes(type);
  }

  /**
   * Convert error to structured object for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      agentKey: this.agentKey,
      retryable: this.retryable,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      metadata: this.metadata,
      stack: this.stack,
    };
  }
}

/**
 * Retry strategy interface
 */
export interface RetryStrategy {
  name: string;
  shouldRetry(error: AgentError, attempt: number, maxRetries: number): boolean;
  getDelay(attempt: number, baseDelay: number): number;
}

/**
 * Exponential backoff retry strategy
 */
export class ExponentialBackoffStrategy implements RetryStrategy {
  name = "exponential-backoff";

  constructor(
    private backoffMultiplier = 2,
    private maxDelay = 30000,
    private jitter = true,
  ) {}

  shouldRetry(error: AgentError, attempt: number, maxRetries: number): boolean {
    return error.retryable && attempt < maxRetries;
  }

  getDelay(attempt: number, baseDelay: number): number {
    const delay = baseDelay * this.backoffMultiplier ** attempt;
    const cappedDelay = Math.min(delay, this.maxDelay);

    if (this.jitter) {
      // Add random jitter ±20%
      const jitterRange = cappedDelay * 0.2;
      const jitter = (Math.random() - 0.5) * jitterRange * 2;
      return Math.max(0, cappedDelay + jitter);
    }

    return cappedDelay;
  }
}

/**
 * Linear backoff retry strategy
 */
export class LinearBackoffStrategy implements RetryStrategy {
  name = "linear-backoff";

  shouldRetry(error: AgentError, attempt: number, maxRetries: number): boolean {
    return error.retryable && attempt < maxRetries;
  }

  getDelay(attempt: number, baseDelay: number): number {
    return baseDelay * (attempt + 1);
  }
}

/**
 * Fixed delay retry strategy
 */
export class FixedDelayStrategy implements RetryStrategy {
  name = "fixed-delay";

  shouldRetry(error: AgentError, attempt: number, maxRetries: number): boolean {
    return error.retryable && attempt < maxRetries;
  }

  getDelay(attempt: number, baseDelay: number): number {
    return baseDelay;
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  strategy: RetryStrategy;
  enableCircuitBreaker?: boolean;
  circuitBreakerThreshold?: number;
  circuitBreakerResetTime?: number;
}

/**
 * Circuit breaker state
 */
export enum CircuitBreakerState {
  CLOSED = "closed",
  OPEN = "open",
  HALF_OPEN = "half_open",
}

/**
 * Circuit breaker for agent execution
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failures = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(
    private threshold = 5,
    private resetTime = 60000, // 1 minute
  ) {}

  /**
   * Check if execution should proceed
   */
  canExecute(): boolean {
    switch (this.state) {
      case CircuitBreakerState.CLOSED:
        return true;
      case CircuitBreakerState.OPEN:
        return this.shouldAttemptReset();
      case CircuitBreakerState.HALF_OPEN:
        return true;
      default:
        return false;
    }
  }

  /**
   * Record successful execution
   */
  recordSuccess(): void {
    this.failures = 0;
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 2) {
        this.state = CircuitBreakerState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  /**
   * Record failed execution
   */
  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.OPEN;
      this.successCount = 0;
    } else if (this.failures >= this.threshold) {
      this.state = CircuitBreakerState.OPEN;
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failures;
  }

  private shouldAttemptReset(): boolean {
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    if (timeSinceLastFailure >= this.resetTime) {
      this.state = CircuitBreakerState.HALF_OPEN;
      this.successCount = 0;
      return true;
    }
    return false;
  }
}

/**
 * Comprehensive error handler for agents
 */
export class AgentErrorHandler {
  private retryConfig: RetryConfig;
  private circuitBreakers = new Map<string, CircuitBreaker>();

  constructor(retryConfig: RetryConfig) {
    this.retryConfig = retryConfig;
  }

  /**
   * Execute agent with comprehensive error handling
   */
  async executeWithErrorHandling(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
    executeFunction: (
      agent: BaseAgent,
      context: AgentContext,
      input: string,
    ) => Promise<AgentResult>,
  ): Promise<AgentResult> {
    const agentKey = agent.getConfig().key;
    const circuitBreaker = this.getCircuitBreaker(agentKey);

    // Check circuit breaker
    if (!circuitBreaker.canExecute()) {
      throw new AgentError(
        `Circuit breaker is open for agent '${agentKey}'`,
        AgentErrorType.EXECUTION,
        agentKey,
        { context, input, retryable: false },
      );
    }

    let lastError: AgentError | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const result = await executeFunction(agent, context, input);

        // Record success in circuit breaker
        circuitBreaker.recordSuccess();

        return result;
      } catch (error) {
        const agentError = this.normalizeError(error, agent, context, input);
        lastError = agentError;

        // Record failure in circuit breaker
        circuitBreaker.recordFailure();

        // Check if we should retry
        if (
          !this.retryConfig.strategy.shouldRetry(
            agentError,
            attempt,
            this.retryConfig.maxRetries,
          )
        ) {
          throw agentError;
        }

        // If this is the last attempt, don't wait
        if (attempt === this.retryConfig.maxRetries) {
          throw agentError;
        }

        // Wait before retrying
        const delay = this.retryConfig.strategy.getDelay(
          attempt,
          this.retryConfig.baseDelay,
        );
        await this.sleep(delay);
      }
    }

    throw (
      lastError ||
      new AgentError(
        "Unknown error during agent execution",
        AgentErrorType.UNKNOWN,
        agentKey,
        { context, input },
      )
    );
  }

  /**
   * Normalize various error types to AgentError
   */
  private normalizeError(
    error: unknown,
    agent: BaseAgent,
    context: AgentContext,
    input: string,
  ): AgentError {
    const agentKey = agent.getConfig().key;

    if (error instanceof AgentError) {
      return error;
    }

    if (error instanceof Error) {
      // Detect error types based on error message/properties
      let errorType = AgentErrorType.UNKNOWN;
      let retryable = false;

      if (error.message.toLowerCase().includes("timeout")) {
        errorType = AgentErrorType.TIMEOUT;
        retryable = true;
      } else if (error.message.toLowerCase().includes("rate limit")) {
        errorType = AgentErrorType.RATE_LIMIT;
        retryable = true;
      } else if (
        error.message.toLowerCase().includes("network") ||
        error.message.toLowerCase().includes("connection")
      ) {
        errorType = AgentErrorType.NETWORK;
        retryable = true;
      } else if (error.message.toLowerCase().includes("validation")) {
        errorType = AgentErrorType.VALIDATION;
        retryable = false;
      } else if (
        error.message.toLowerCase().includes("permission") ||
        error.message.toLowerCase().includes("unauthorized")
      ) {
        errorType = AgentErrorType.PERMISSION;
        retryable = false;
      }

      return new AgentError(error.message, errorType, agentKey, {
        context,
        input,
        retryable,
        cause: error,
      });
    }

    // Handle non-Error objects
    const message =
      typeof error === "string" ? error : "Unknown error occurred";
    return new AgentError(message, AgentErrorType.UNKNOWN, agentKey, {
      context,
      input,
    });
  }

  /**
   * Get or create circuit breaker for agent
   */
  private getCircuitBreaker(agentKey: string): CircuitBreaker {
    if (!this.circuitBreakers.has(agentKey)) {
      this.circuitBreakers.set(
        agentKey,
        new CircuitBreaker(
          this.retryConfig.circuitBreakerThreshold,
          this.retryConfig.circuitBreakerResetTime,
        ),
      );
    }
    const breaker = this.circuitBreakers.get(agentKey);
    if (!breaker) {
      throw new Error(`Circuit breaker not found for agent: ${agentKey}`);
    }
    return breaker;
  }

  /**
   * Get circuit breaker states for all agents
   */
  getCircuitBreakerStates(): Record<
    string,
    { state: CircuitBreakerState; failures: number }
  > {
    const states: Record<
      string,
      { state: CircuitBreakerState; failures: number }
    > = {};

    for (const [agentKey, breaker] of this.circuitBreakers) {
      states[agentKey] = {
        state: breaker.getState(),
        failures: breaker.getFailureCount(),
      };
    }

    return states;
  }

  /**
   * Update retry configuration
   */
  updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  /**
   * Reset circuit breaker for specific agent
   */
  resetCircuitBreaker(agentKey: string): void {
    this.circuitBreakers.delete(agentKey);
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuitBreakers(): void {
    this.circuitBreakers.clear();
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Default error handler configuration
 */
export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  strategy: new ExponentialBackoffStrategy(),
  enableCircuitBreaker: true,
  circuitBreakerThreshold: 5,
  circuitBreakerResetTime: 60000,
};

/**
 * Global error handler instance
 */
export const globalErrorHandler = new AgentErrorHandler(defaultRetryConfig);
