# Agent Architecture Migration Guide

This guide will help you migrate from the old agent architecture to the new improved system with better separation of concerns, error handling, monitoring, and testing capabilities.

## Overview of Changes

The new architecture introduces several improvements:

1. **Abstract Base Classes**: All agents now extend `BaseAgent`
2. **Factory Pattern**: Agent creation through factories
3. **Registry System**: Centralized agent management
4. **Middleware System**: Cross-cutting concerns handling
5. **Orchestration**: Intelligent agent routing and execution
6. **Error Handling**: Comprehensive error handling with retries and circuit breakers
7. **Monitoring**: Performance metrics and health checks
8. **Configuration Management**: Template-based configuration with environments
9. **Testing Framework**: Comprehensive testing utilities

## Migration Steps

### Step 1: Update Agent Definitions

**Old Architecture:**

```typescript
// packages/prompts/src/prompts/router-agent.ts
const routerAgentTemplate = `Ты - эксперт по маршрутизации запросов...`;

const routerAgent: PromptDefinition = {
  key: "router-agent",
  name: "Router Agent",
  type: "text",
  prompt: routerAgentTemplate,
  labels: ["production", "staging", "latest"],
  defaultModel: "gpt-5",
};

export { routerAgent };
```

**New Architecture:**

```typescript
// packages/prompts/src/agents/router-agent.ts
import type {
  AgentCapabilities,
  AgentConfig,
  AgentContext,
  AgentResult,
} from "../core/agent";
import { BaseAgent } from "../core/agent";

export class RouterAgent extends BaseAgent {
  constructor(config: AgentConfig, capabilities: AgentCapabilities) {
    super(config, {
      canRoute: true,
      supportedLanguages: ["ru", "en"],
      ...capabilities,
    });
  }

  async canHandle(context: AgentContext, input: string): Promise<boolean> {
    // Router can handle all requests for routing decisions
    return true;
  }

  async execute(context: AgentContext, input: string): Promise<AgentResult> {
    // Validate input
    const errors = this.validateInput(input);
    if (errors.length > 0) {
      return this.createErrorResult(errors);
    }

    // Determine which agent should handle this request
    const selectedAgent = this.determineAgent(input);

    return this.createSuccessResult(selectedAgent, 0.9);
  }

  async getSystemPrompt(context: AgentContext): Promise<string> {
    return `Ты - эксперт по маршрутизации запросов в системе Synoro AI для записи и анализа событий.

ТВОЯ ЗАДАЧА: точно определить, к какому агенту направить запрос пользователя.

ДОСТУПНЫЕ АГЕНТЫ:
1. event-processor - для записи событий (создание, редактирование, классификация событий)
2. event-analyzer - для анализа событий (статистика, отчеты, тенденции, выводы)
3. general-assistant - для помощи с системой событий (объяснения, инструкции, общие вопросы)

ПРАВИЛА КЛАССИФИКАЦИИ:
- event-processor: запросы на создание, запись, редактирование, классификацию событий
- event-analyzer: запросы на анализ, статистику, отчеты, тенденции, сравнения событий
- general-assistant: вопросы о системе, инструкции, помощь с интерфейсом, общие вопросы

ФОРМАТ ОТВЕТА:
- Отвечай кратко: только название агента
- Примеры: "event-processor", "event-analyzer", "general-assistant"

Контекст: ${JSON.stringify(context)}`;
  }

  private determineAgent(input: string): string {
    const lowerInput = input.toLowerCase();

    // Check for event processing keywords
    if (
      lowerInput.includes("потратил") ||
      lowerInput.includes("купил") ||
      lowerInput.includes("задача") ||
      lowerInput.includes("запись")
    ) {
      return "event-processor";
    }

    // Check for analysis keywords
    if (
      lowerInput.includes("статистика") ||
      lowerInput.includes("анализ") ||
      lowerInput.includes("отчет") ||
      lowerInput.includes("показать")
    ) {
      return "event-analyzer";
    }

    // Default to general assistant
    return "general-assistant";
  }
}
```

### Step 2: Register Agent Types

Create agent type registrations:

```typescript
// packages/prompts/src/agents/index.ts
import { agentTypeRegistry } from "../core/agent-factory";
import { EventAnalyzerAgent } from "./event-analyzer-agent";
import { EventProcessorAgent } from "./event-processor-agent";
import { GeneralAssistantAgent } from "./general-assistant-agent";
import { RouterAgent } from "./router-agent";

// Register all agent types
agentTypeRegistry.register("router", RouterAgent);
agentTypeRegistry.register("event-processor", EventProcessorAgent);
agentTypeRegistry.register("event-analyzer", EventAnalyzerAgent);
agentTypeRegistry.register("general-assistant", GeneralAssistantAgent);

export {
  RouterAgent,
  EventProcessorAgent,
  EventAnalyzerAgent,
  GeneralAssistantAgent,
};
```

### Step 3: Update Configuration System

**Old Configuration:**

```typescript
// Direct prompt definition usage
import routerAgent from "./prompts/router-agent";

const prompt = await getPrompt(routerAgent.key);
```

**New Configuration:**

```typescript
// packages/prompts/src/config/agent-configs.ts
import { globalConfigManager } from "../core/agent-config-manager";

// Initialize configurations
export async function initializeAgentConfigurations() {
  // Create router agent configuration
  const routerConfig = globalConfigManager.createFromTemplate(
    "router",
    "router-agent",
    {
      model: "gpt-5",
      temperature: 0.3,
      maxTokens: 1000,
      timeout: 10000,
    },
  );

  await globalConfigManager.setConfig("router-agent", routerConfig);

  // Create event processor configuration
  const eventProcessorConfig = globalConfigManager.createFromTemplate(
    "event-processor",
    "event-processor-agent",
    {
      model: "gpt-5-nano",
      temperature: 0.7,
      maxTokens: 2000,
    },
  );

  await globalConfigManager.setConfig(
    "event-processor-agent",
    eventProcessorConfig,
  );

  // Load additional configurations from environment or files
  await globalConfigManager.loadConfigs("env");
}
```

### Step 4: Set Up Agent Factory and Registry

```typescript
// packages/prompts/src/core/index.ts
import { registry as promptRegistry } from "../registry";
import { createAgentFactory } from "./agent-factory";
import { agentRegistry } from "./agent-registry";

// Create factory
export const agentFactory = createAgentFactory(promptRegistry);

// Initialize agents
export async function initializeAgents() {
  const configs = globalConfigManager.getAllConfigs();

  for (const [key, config] of Object.entries(configs)) {
    try {
      const agent = agentFactory.createFromPromptKey(key);
      if (agent) {
        agentRegistry.register(agent);
        console.log(`Registered agent: ${key}`);
      }
    } catch (error) {
      console.error(`Failed to create agent ${key}:`, error);
    }
  }
}
```

### Step 5: Set Up Orchestration

**Old System:**

```typescript
// Direct agent execution
const routerResult = await executeAgent("router-agent", context, input);
const selectedAgent = routerResult.response;
const finalResult = await executeAgent(selectedAgent, context, input);
```

**New System:**

```typescript
// packages/prompts/src/core/orchestration.ts
import { globalMiddlewareManager } from "./agent-middleware";
import {
  AgentOrchestrator,
  CapabilityBasedStrategy,
  RouterBasedStrategy,
} from "./agent-orchestrator";

export const orchestrator = new AgentOrchestrator(
  agentRegistry,
  globalMiddlewareManager,
  new RouterBasedStrategy(), // or new CapabilityBasedStrategy()
  {
    enableFallback: true,
    fallbackAgent: "general-assistant-agent",
    maxExecutionTime: 30000,
    enableRetries: true,
    maxRetries: 3,
  },
);

// Usage
export async function processRequest(input: string, context: AgentContext) {
  try {
    const result = await orchestrator.execute(context, input);
    return result.result.response;
  } catch (error) {
    console.error("Request processing failed:", error);
    return "Произошла ошибка при обработке запроса.";
  }
}
```

### Step 6: Add Middleware

```typescript
// packages/prompts/src/middleware/setup.ts
import {
  globalMiddlewareManager,
  LoggingMiddleware,
  PerformanceMiddleware,
  RateLimitMiddleware,
  ValidationMiddleware,
} from "../core/agent-middleware";

export function setupMiddleware() {
  // Add validation middleware (highest priority)
  globalMiddlewareManager.use(new ValidationMiddleware());

  // Add logging middleware
  globalMiddlewareManager.use(new LoggingMiddleware());

  // Add performance monitoring
  globalMiddlewareManager.use(new PerformanceMiddleware());

  // Add rate limiting
  globalMiddlewareManager.use(new RateLimitMiddleware(100, 60000)); // 100 requests per minute
}
```

### Step 7: Update Error Handling

**Old System:**

```typescript
// Basic try-catch
try {
  const result = await agent.execute(context, input);
  return result;
} catch (error) {
  console.error("Agent execution failed:", error);
  throw error;
}
```

**New System:**

```typescript
// packages/prompts/src/core/error-setup.ts
import {
  AgentError,
  AgentErrorType,
  ExponentialBackoffStrategy,
  globalErrorHandler,
} from "./agent-error-handling";

export function setupErrorHandling() {
  // Configure retry strategy
  globalErrorHandler.updateRetryConfig({
    maxRetries: 3,
    baseDelay: 1000,
    strategy: new ExponentialBackoffStrategy(2, 30000, true),
    enableCircuitBreaker: true,
    circuitBreakerThreshold: 5,
    circuitBreakerResetTime: 60000,
  });
}

// Usage
export async function executeWithErrorHandling(
  agent: BaseAgent,
  context: AgentContext,
  input: string,
) {
  try {
    return await globalErrorHandler.executeWithErrorHandling(
      agent,
      context,
      input,
      (agent, context, input) => agent.execute(context, input),
    );
  } catch (error) {
    if (error instanceof AgentError) {
      // Handle specific agent errors
      switch (error.type) {
        case AgentErrorType.TIMEOUT:
          return {
            response: "Запрос превысил время ожидания. Попробуйте еще раз.",
            confidence: 0,
          };
        case AgentErrorType.RATE_LIMIT:
          return {
            response: "Слишком много запросов. Попробуйте позже.",
            confidence: 0,
          };
        default:
          return {
            response: "Произошла ошибка при обработке запроса.",
            confidence: 0,
          };
      }
    }
    throw error;
  }
}
```

### Step 8: Add Monitoring

```typescript
// packages/prompts/src/monitoring/setup.ts
import { globalPerformanceMonitor } from "../core/agent-monitoring";

export function setupMonitoring() {
  // Configure alerts
  globalPerformanceMonitor.configureAlert("router-agent", {
    metric: "averageExecutionTime",
    threshold: 5000, // 5 seconds
    comparison: "greater_than",
    enabled: true,
    cooldownPeriod: 300000, // 5 minutes
  });

  globalPerformanceMonitor.configureAlert("event-processor-agent", {
    metric: "successRate",
    threshold: 0.9, // 90%
    comparison: "less_than",
    enabled: true,
    cooldownPeriod: 600000, // 10 minutes
  });
}

// Usage in your application
export async function monitoredExecution(
  agent: BaseAgent,
  context: AgentContext,
  input: string,
) {
  const executionId = globalPerformanceMonitor.startExecution(
    agent,
    context,
    input,
  );

  try {
    const result = await agent.execute(context, input);
    globalPerformanceMonitor.recordSuccess(executionId, result);
    return result;
  } catch (error) {
    globalPerformanceMonitor.recordFailure(executionId, error);
    throw error;
  }
}
```

### Step 9: Update Application Entry Point

```typescript
// packages/prompts/src/index.ts
import { initializeAgentConfigurations } from "./config/agent-configs";
import { initializeAgents } from "./core";
import { setupErrorHandling } from "./core/error-setup";
import { orchestrator } from "./core/orchestration";
import { setupMiddleware } from "./middleware/setup";
import { setupMonitoring } from "./monitoring/setup";

// Initialize the new agent system
export async function initializeAgentSystem() {
  try {
    // 1. Initialize configurations
    await initializeAgentConfigurations();

    // 2. Initialize agents
    await initializeAgents();

    // 3. Setup middleware
    setupMiddleware();

    // 4. Setup error handling
    setupErrorHandling();

    // 5. Setup monitoring
    setupMonitoring();

    console.log("Agent system initialized successfully");
  } catch (error) {
    console.error("Failed to initialize agent system:", error);
    throw error;
  }
}

// Main execution function
export async function executeAgent(input: string, context: AgentContext) {
  return await orchestrator.execute(context, input);
}

// Export key components
export {
  agentRegistry,
  agentFactory,
  orchestrator,
  globalPerformanceMonitor,
  globalConfigManager,
  globalErrorHandler,
} from "./core";
```

## Testing Migration

### Update Tests

**Old Testing:**

```typescript
// Basic prompt testing
describe("Router Agent", () => {
  it("should return correct agent", async () => {
    const result = await executePrompt("router-agent", "Потратил 500 рублей");
    expect(result).toContain("event-processor");
  });
});
```

**New Testing:**

```typescript
// packages/prompts/src/tests/router-agent.test.ts
import { RouterAgent } from "../agents/router-agent";
import {
  AgentPerformanceTestRunner,
  AgentTestRunnerFactory,
  AgentTestUtils,
} from "../core/agent-testing";

describe("Router Agent", () => {
  let agent: RouterAgent;
  let testSuite = AgentTestRunnerFactory.createUnitTestRunner();

  beforeEach(() => {
    const config = AgentTestUtils.AgentTestDataGenerator.generateAgentConfig({
      key: "router-agent",
      name: "Router Agent",
    });
    agent = new RouterAgent(config, {});
  });

  testSuite.test(
    "should route expense requests to event-processor",
    async () => {
      const context = AgentTestUtils.MockAgentContextBuilder.create()
        .withUserId("test-user")
        .build();

      const result = await agent.execute(
        context,
        "Потратил 500 рублей на продукты",
      );

      AgentTestUtils.AgentTestAssertions.assertResponseEquals(
        result,
        "event-processor",
      );
      AgentTestUtils.AgentTestAssertions.assertConfidenceAbove(result, 0.8);
    },
  );

  testSuite.test(
    "should route analysis requests to event-analyzer",
    async () => {
      const context = AgentTestUtils.MockAgentContextBuilder.create()
        .withUserId("test-user")
        .build();

      const result = await agent.execute(
        context,
        "Показать статистику расходов",
      );

      AgentTestUtils.AgentTestAssertions.assertResponseEquals(
        result,
        "event-analyzer",
      );
    },
  );

  // Performance test
  it("should handle load efficiently", async () => {
    const context = AgentTestUtils.MockAgentContextBuilder.create().build();

    const perfResults = await AgentPerformanceTestRunner.runPerformanceTest(
      agent,
      context,
      "Test input",
      {
        name: "Router Agent Load Test",
        concurrent: 10,
        iterations: 100,
        maxExecutionTime: 5000,
      },
    );

    expect(perfResults.successfulIterations).toBe(100);
    expect(perfResults.averageExecutionTime).toBeLessThan(1000);
  });
});
```

## Deployment Considerations

### Environment Configuration

Create environment-specific configurations:

```typescript
// config/production.json
{
  "router-agent": {
    "key": "router-agent",
    "name": "Router Agent",
    "model": "gpt-5",
    "temperature": 0.3,
    "maxTokens": 1000,
    "timeout": 10000,
    "enabled": true,
    "labels": ["production"]
  },
  "event-processor-agent": {
    "key": "event-processor-agent",
    "name": "Event Processor Agent",
    "model": "gpt-5-nano",
    "temperature": 0.7,
    "maxTokens": 2000,
    "timeout": 15000,
    "enabled": true,
    "labels": ["production"]
  }
}
```

### Monitoring Dashboard

```typescript
// monitoring/dashboard.ts
import {
  agentRegistry,
  globalErrorHandler,
  globalPerformanceMonitor,
} from "../core";

export async function getDashboardData() {
  const systemMetrics = globalPerformanceMonitor.getSystemMetrics();
  const alerts = globalPerformanceMonitor.getActiveAlerts();
  const circuitBreakers = globalErrorHandler.getCircuitBreakerStates();

  const agentStats = await Promise.all(
    agentRegistry.getAll().map(async (agent) => {
      const config = agent.getConfig();
      const stats = globalPerformanceMonitor.getAgentStats(config.key);
      const health = await globalPerformanceMonitor.performHealthCheck(agent);

      return {
        key: config.key,
        name: config.name,
        enabled: config.enabled,
        stats,
        health,
      };
    }),
  );

  return {
    system: systemMetrics,
    agents: agentStats,
    alerts,
    circuitBreakers,
    timestamp: new Date().toISOString(),
  };
}
```

## Rollback Plan

If issues occur during migration, you can implement a gradual rollback:

1. **Feature Flag**: Use feature flags to toggle between old and new systems
2. **Parallel Running**: Run both systems in parallel for validation
3. **Graceful Degradation**: Fall back to old system if new system fails

```typescript
// rollback/feature-flags.ts
export class AgentSystemFeatureFlags {
  private static useNewSystem = process.env.USE_NEW_AGENT_SYSTEM === "true";

  static shouldUseNewSystem(): boolean {
    return this.useNewSystem;
  }

  static async executeWithFallback(input: string, context: AgentContext) {
    if (this.shouldUseNewSystem()) {
      try {
        return await orchestrator.execute(context, input);
      } catch (error) {
        console.warn("New system failed, falling back to old system:", error);
        return await executeOldSystem(input, context);
      }
    }

    return await executeOldSystem(input, context);
  }
}
```

## Conclusion

This migration brings significant improvements in:

- **Maintainability**: Better code organization and separation of concerns
- **Scalability**: Improved performance monitoring and resource management
- **Reliability**: Comprehensive error handling and circuit breakers
- **Testability**: Extensive testing utilities and frameworks
- **Observability**: Detailed monitoring and alerting systems

The migration should be done incrementally, testing each component thoroughly before moving to the next step. Monitor the system closely after deployment and be prepared to rollback if necessary.
