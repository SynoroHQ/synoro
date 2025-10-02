import type { AIModel } from "./models";
import type { PromptMessage } from "./types";

/**
 * Agent execution context containing request information and metadata
 */
export interface AgentContext {
  userId?: string;
  householdId?: string;
  telegramChatId?: string;
  currentTime: string;
  timezone: string;
  messageHistory?: PromptMessage[];
  metadata?: Record<string, unknown>;
}

/**
 * Agent execution result with response and metadata
 */
export interface AgentResult {
  response: string;
  confidence?: number;
  needsConfirmation?: boolean;
  metadata?: Record<string, unknown>;
  errors?: string[];
  warnings?: string[];
}

/**
 * Agent configuration interface
 */
export interface AgentConfig {
  key: string;
  name: string;
  description?: string;
  model: AIModel;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retryAttempts?: number;
  labels?: string[];
  enabled?: boolean;
}

/**
 * Agent capabilities interface
 */
export interface AgentCapabilities {
  canProcessEvents?: boolean;
  canAnalyzeData?: boolean;
  canProvideHelp?: boolean;
  canRoute?: boolean;
  supportedEventTypes?: string[];
  supportedLanguages?: string[];
}

/**
 * Abstract base agent class providing common functionality
 */
export abstract class BaseAgent {
  protected config: AgentConfig;
  protected capabilities: AgentCapabilities;

  constructor(config: AgentConfig, capabilities: AgentCapabilities = {}) {
    this.config = config;
    this.capabilities = capabilities;
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): AgentCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Check if agent is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled !== false;
  }

  /**
   * Check if agent can handle the given context
   */
  abstract canHandle(context: AgentContext, input: string): Promise<boolean>;

  /**
   * Execute the agent with given context and input
   */
  abstract execute(context: AgentContext, input: string): Promise<AgentResult>;

  /**
   * Get the system prompt for this agent
   */
  abstract getSystemPrompt(context: AgentContext): Promise<string>;

  /**
   * Validate input before processing
   */
  protected validateInput(input: string): string[] {
    const errors: string[] = [];

    if (!input || input.trim().length === 0) {
      errors.push("Input cannot be empty");
    }

    if (input.length > 10000) {
      errors.push("Input too long (max 10000 characters)");
    }

    return errors;
  }

  /**
   * Validate context before processing
   */
  protected validateContext(context: AgentContext): string[] {
    const errors: string[] = [];

    if (!context.currentTime) {
      errors.push("Current time is required");
    }

    if (!context.timezone) {
      errors.push("Timezone is required");
    }

    return errors;
  }

  /**
   * Create a standardized error result
   */
  protected createErrorResult(errors: string[]): AgentResult {
    return {
      response: "Произошла ошибка при обработке запроса.",
      confidence: 0,
      needsConfirmation: false,
      errors,
    };
  }

  /**
   * Create a standardized success result
   */
  protected createSuccessResult(
    response: string,
    confidence = 0.8,
    metadata?: Record<string, unknown>,
  ): AgentResult {
    return {
      response,
      confidence,
      needsConfirmation: false,
      metadata,
    };
  }
}

/**
 * Agent middleware interface for cross-cutting concerns
 */
export interface AgentMiddleware {
  name: string;
  priority: number;

  /**
   * Execute before agent processing
   */
  beforeExecute?(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
  ): Promise<{ context: AgentContext; input: string }>;

  /**
   * Execute after agent processing
   */
  afterExecute?(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
    result: AgentResult,
  ): Promise<AgentResult>;

  /**
   * Handle errors during agent processing
   */
  onError?(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
    error: Error,
  ): Promise<AgentResult | null>;
}

/**
 * Agent registry interface
 */
export interface AgentRegistry {
  register(agent: BaseAgent): void;
  unregister(key: string): void;
  get(key: string): BaseAgent | undefined;
  getAll(): BaseAgent[];
  getByCapability(capability: keyof AgentCapabilities): BaseAgent[];
  getCapableAgents(context: AgentContext, input: string): Promise<BaseAgent[]>;
}
