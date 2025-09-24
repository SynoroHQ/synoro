/**
 * Enhanced Agent Architecture Core Module
 *
 * This module provides a comprehensive, enterprise-grade agent architecture
 * with proper separation of concerns, error handling, monitoring, and testing.
 */

// Core interfaces and base classes
export type {
  AgentContext,
  AgentResult,
  AgentConfig,
  AgentCapabilities,
  AgentRegistry,
  AgentMiddleware,
} from "./agent";

export { BaseAgent } from "./agent";

// Agent registry
export { DefaultAgentRegistry, agentRegistry } from "./agent-registry";

// Agent factory
export type { AgentFactory, AgentTypeRegistry } from "./agent-factory";
export {
  DefaultAgentFactory,
  DefaultAgentTypeRegistry,
  agentTypeRegistry,
  createAgentFactory,
} from "./agent-factory";

// Middleware system
export {
  AgentMiddlewareManager,
  LoggingMiddleware,
  PerformanceMiddleware,
  ValidationMiddleware,
  RateLimitMiddleware,
  globalMiddlewareManager,
} from "./agent-middleware";

// Orchestration
export {
  AgentOrchestrator,
  RouterBasedStrategy,
  CapabilityBasedStrategy,
  RoundRobinStrategy,
  WeightedRandomStrategy,
} from "./agent-orchestrator";

export type {
  AgentSelectionStrategy,
  OrchestrationResult,
  OrchestratorConfig,
} from "./agent-orchestrator";

// Error handling
export {
  AgentError,
  AgentErrorType,
  AgentErrorHandler,
  CircuitBreaker,
  CircuitBreakerState,
  ExponentialBackoffStrategy,
  LinearBackoffStrategy,
  FixedDelayStrategy,
  globalErrorHandler,
  defaultRetryConfig,
} from "./agent-error-handling";

export type { RetryStrategy, RetryConfig } from "./agent-error-handling";

// Performance monitoring
export {
  AgentPerformanceMonitor,
  HealthStatus,
  globalPerformanceMonitor,
} from "./agent-monitoring";

export type {
  AgentExecutionMetrics,
  AgentPerformanceStats,
  SystemPerformanceMetrics,
  AgentHealthCheck,
  PerformanceAlert,
  AlertConfig,
} from "./agent-monitoring";

// Configuration management
export {
  AgentConfigManager,
  ConfigSource,
  FileConfigLoader,
  EnvironmentConfigLoader,
  globalConfigManager,
} from "./agent-config-manager";

export type {
  ConfigValidationResult,
  ConfigChangeEvent,
  AgentConfigTemplate,
  EnvironmentConfig,
  ConfigBackup,
  ConfigChangeListener,
  ConfigLoader,
} from "./agent-config-manager";

// Testing framework
export {
  AgentTestUtils,
  AgentTestRunnerFactory,
  AgentPerformanceTestRunner,
  AgentIntegrationTestRunner,
} from "./agent-testing";

export type {
  AgentTestResult,
  AgentTestResults,
  PerformanceTestConfig,
  PerformanceTestResults,
  WorkflowTestResults,
  WorkflowStepResult,
} from "./agent-testing";

// Utility functions for common setup patterns
export async function createDefaultAgentSystem() {
  const { registry: promptRegistry } = await import("../registry");
  const { agentRegistry } = await import("./agent-registry");
  const { globalConfigManager } = await import("./agent-config-manager");
  const {
    globalMiddlewareManager,
    ValidationMiddleware,
    LoggingMiddleware,
    PerformanceMiddleware,
    RateLimitMiddleware,
  } = await import("./agent-middleware");
  const { globalErrorHandler } = await import("./agent-error-handling");
  const { globalPerformanceMonitor } = await import("./agent-monitoring");
  const { createAgentFactory } = await import("./agent-factory");

  // Create factory
  const factory = createAgentFactory(promptRegistry);

  // Load configurations
  await globalConfigManager.loadConfigs("env");

  // Create agents from configurations
  const configs = globalConfigManager.getAllConfigs();
  for (const [key, config] of Object.entries(configs)) {
    try {
      const agent = factory.createFromPromptKey(key);
      if (agent) {
        agentRegistry.register(agent);
      }
    } catch (error) {
      console.warn(`Failed to create agent ${key}:`, error);
    }
  }

  // Setup default middleware
  globalMiddlewareManager.use(new ValidationMiddleware());
  globalMiddlewareManager.use(new LoggingMiddleware());
  globalMiddlewareManager.use(new PerformanceMiddleware());
  globalMiddlewareManager.use(new RateLimitMiddleware());

  return {
    registry: agentRegistry,
    factory,
    middleware: globalMiddlewareManager,
    errorHandler: globalErrorHandler,
    monitor: globalPerformanceMonitor,
    configManager: globalConfigManager,
  };
}

/**
 * Quick setup function for getting started with the agent system
 */
export async function quickSetup() {
  const system = await createDefaultAgentSystem();
  const { AgentOrchestrator, CapabilityBasedStrategy } = await import(
    "./agent-orchestrator"
  );

  // Create orchestrator with capability-based strategy
  const orchestrator = new AgentOrchestrator(
    system.registry,
    system.middleware,
    new CapabilityBasedStrategy(),
    {
      enableFallback: true,
      fallbackAgent: "general-assistant-agent",
      maxExecutionTime: 30000,
      enableRetries: true,
      maxRetries: 3,
    },
  );

  return {
    ...system,
    orchestrator,
    execute: (context: any, input: string) =>
      orchestrator.execute(context, input),
  };
}
