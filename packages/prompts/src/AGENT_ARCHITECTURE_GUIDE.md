# Agent Architecture Guide

## Overview

The new agent architecture provides a comprehensive, scalable, and maintainable framework for AI agent management. It includes abstract base classes, factory patterns, middleware systems, orchestration, error handling, performance monitoring, configuration management, and comprehensive testing utilities.

## Architecture Components

### Core Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Agent Ecosystem                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐│
│  │  Agent Factory  │────│  Agent Registry  │────│ Orchestrator││
│  └─────────────────┘    └──────────────────┘    └─────────────┘│
│           │                       │                     │      │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐│
│  │  Base Agent     │    │   Middleware     │    │ Monitoring  ││
│  │  (Abstract)     │    │   Manager        │    │ System      ││
│  └─────────────────┘    └──────────────────┘    └─────────────┘│
│           │                       │                     │      │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐│
│  │ Concrete Agents │    │ Error Handling   │    │ Config      ││
│  │ Implementation  │    │ & Retry Logic    │    │ Manager     ││
│  └─────────────────┘    └──────────────────┘    └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Key Classes and Interfaces

1. **BaseAgent** - Abstract base class for all agents
2. **AgentRegistry** - Central registry for agent management
3. **AgentFactory** - Factory pattern for agent creation
4. **AgentOrchestrator** - Coordinates agent execution
5. **AgentMiddleware** - Cross-cutting concerns handling
6. **AgentErrorHandler** - Comprehensive error handling
7. **AgentPerformanceMonitor** - Performance monitoring and metrics
8. **AgentConfigManager** - Configuration management
9. **AgentTestUtils** - Comprehensive testing framework

## Core Concepts

### 1. Base Agent Architecture

```typescript
import {
  AgentCapabilities,
  AgentConfig,
  AgentContext,
  AgentResult,
  BaseAgent,
} from "./agent";

class MyCustomAgent extends BaseAgent {
  constructor(config: AgentConfig, capabilities: AgentCapabilities) {
    super(config, capabilities);
  }

  async canHandle(context: AgentContext, input: string): Promise<boolean> {
    // Implement logic to determine if this agent can handle the input
    return input.includes("specific-keyword");
  }

  async execute(context: AgentContext, input: string): Promise<AgentResult> {
    // Implement the agent's core functionality
    return {
      response: "Generated response",
      confidence: 0.9,
      needsConfirmation: false,
    };
  }

  async getSystemPrompt(context: AgentContext): Promise<string> {
    return "System prompt for this agent";
  }
}
```

### 2. Agent Registration and Factory

```typescript
import { agentRegistry, agentTypeRegistry, createAgentFactory } from "./core";
import { registry as promptRegistry } from "./registry";

// Register agent type
agentTypeRegistry.register("my-custom", MyCustomAgent);

// Create factory
const factory = createAgentFactory(promptRegistry);

// Create agent from template
const agent = factory.createFromPromptKey("my-agent-key");

// Register agent
agentRegistry.register(agent);
```

### 3. Agent Orchestration

```typescript
import { globalMiddlewareManager } from "./core/agent-middleware";
import {
  AgentOrchestrator,
  RouterBasedStrategy,
} from "./core/agent-orchestrator";

const orchestrator = new AgentOrchestrator(
  agentRegistry,
  globalMiddlewareManager,
  new RouterBasedStrategy(),
  {
    enableFallback: true,
    fallbackAgent: "general-assistant-agent",
    maxExecutionTime: 30000,
    enableRetries: true,
    maxRetries: 3,
  },
);

// Execute with orchestration
const result = await orchestrator.execute(context, "User input");
```

### 4. Middleware System

```typescript
import { AgentMiddleware } from "./core/agent-middleware";

class CustomMiddleware implements AgentMiddleware {
  name = "custom";
  priority = 80;

  async beforeExecute(agent, context, input) {
    console.log(`Executing agent: ${agent.getConfig().key}`);
    return { context, input };
  }

  async afterExecute(agent, context, input, result) {
    console.log(`Agent completed with confidence: ${result.confidence}`);
    return result;
  }
}

// Register middleware
globalMiddlewareManager.use(new CustomMiddleware());
```

### 5. Error Handling

```typescript
import {
  AgentError,
  AgentErrorType,
  ExponentialBackoffStrategy,
  globalErrorHandler,
} from "./core/agent-error-handling";

// Configure retry strategy
globalErrorHandler.updateRetryConfig({
  maxRetries: 3,
  baseDelay: 1000,
  strategy: new ExponentialBackoffStrategy(2, 30000, true),
});

// Execute with error handling
try {
  const result = await globalErrorHandler.executeWithErrorHandling(
    agent,
    context,
    input,
    (agent, context, input) => agent.execute(context, input),
  );
} catch (error) {
  if (error instanceof AgentError) {
    console.log(`Agent error: ${error.type} - ${error.message}`);
  }
}
```

### 6. Performance Monitoring

```typescript
import { globalPerformanceMonitor } from "./core/agent-monitoring";

// Start monitoring
const executionId = globalPerformanceMonitor.startExecution(
  agent,
  context,
  input,
);

try {
  const result = await agent.execute(context, input);
  globalPerformanceMonitor.recordSuccess(executionId, result);
} catch (error) {
  globalPerformanceMonitor.recordFailure(executionId, error);
}

// Get performance statistics
const stats = globalPerformanceMonitor.getAgentStats("agent-key");
console.log(`Success rate: ${stats?.successRate}`);
```

### 7. Configuration Management

```typescript
import { globalConfigManager } from "./core/agent-config-manager";

// Create configuration from template
const config = globalConfigManager.createFromTemplate(
  "event-processor",
  "my-event-processor",
  {
    temperature: 0.8,
    maxTokens: 3000,
  },
);

// Set agent configuration
await globalConfigManager.setConfig("my-agent", config);

// Load configurations from environment
await globalConfigManager.loadConfigs("env");
```

### 8. Testing Framework

```typescript
import {
  AgentPerformanceTestRunner,
  AgentTestRunnerFactory,
  AgentTestUtils,
} from "./core/agent-testing";

// Create test agent
const testAgent = new AgentTestUtils.TestAgent(config);
testAgent.mockResponse({
  response: "Test response",
  confidence: 0.9,
});

// Create test suite
const testSuite = AgentTestRunnerFactory.createUnitTestRunner();

testSuite.test("should handle input correctly", async () => {
  const context = AgentTestUtils.MockAgentContextBuilder.create()
    .withUserId("test-user")
    .build();

  const result = await testAgent.execute(context, "test input");

  AgentTestUtils.AgentTestAssertions.assertResponseContains(result, "Test");
  AgentTestUtils.AgentTestAssertions.assertConfidenceAbove(result, 0.8);
});

// Run tests
const results = await testSuite.run();
console.log(`Passed: ${results.passedTests}/${results.totalTests}`);
```

## Best Practices

### 1. Agent Design

- **Single Responsibility**: Each agent should have a clear, single purpose
- **Stateless**: Agents should be stateless and rely on context for state
- **Error Handling**: Always implement proper error handling in `execute()` method
- **Validation**: Validate inputs in `canHandle()` method
- **Performance**: Keep agents lightweight and efficient

### 2. Configuration Management

- Use templates for common agent configurations
- Environment-specific configurations for different deployment stages
- Version control for configuration changes
- Regular backups of configuration state

### 3. Testing

- Unit tests for individual agent behavior
- Integration tests for agent workflows
- Performance tests for scalability requirements
- Mock external dependencies in tests

### 4. Monitoring

- Monitor agent performance metrics regularly
- Set up alerts for performance degradation
- Track error rates and patterns
- Use health checks for system monitoring

### 5. Security

- Validate all inputs to prevent injection attacks
- Sanitize outputs before returning to users
- Implement rate limiting to prevent abuse
- Log security-relevant events

## Integration Examples

### Basic Agent Implementation

```typescript
// 1. Define agent configuration
const config: AgentConfig = {
  key: "task-manager",
  name: "Task Manager Agent",
  model: "gpt-5-nano",
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 15000,
  enabled: true,
};

// 2. Implement agent
class TaskManagerAgent extends BaseAgent {
  async canHandle(context: AgentContext, input: string): Promise<boolean> {
    return (
      input.toLowerCase().includes("задача") ||
      input.toLowerCase().includes("task")
    );
  }

  async execute(context: AgentContext, input: string): Promise<AgentResult> {
    // Validate input
    const validationErrors = this.validateInput(input);
    if (validationErrors.length > 0) {
      return this.createErrorResult(validationErrors);
    }

    // Process task-related request
    const response = await this.processTaskRequest(input, context);

    return this.createSuccessResult(response, 0.9, {
      processingTime: Date.now(),
    });
  }

  private async processTaskRequest(
    input: string,
    context: AgentContext,
  ): Promise<string> {
    // Implementation details
    return "Task processed successfully";
  }

  async getSystemPrompt(context: AgentContext): Promise<string> {
    return `You are a task management assistant. Help users create, update, and manage their tasks.
Current time: ${context.currentTime}
User ID: ${context.userId}`;
  }
}

// 3. Register and configure
agentTypeRegistry.register("task-manager", TaskManagerAgent);
const agent = new TaskManagerAgent(config, {
  canProcessEvents: true,
  supportedEventTypes: ["task"],
});
agentRegistry.register(agent);
```

### Full Orchestration Setup

```typescript
import {
  AgentOrchestrator,
  CapabilityBasedStrategy,
  globalConfigManager,
  globalErrorHandler,
  globalMiddlewareManager,
  globalPerformanceMonitor,
} from "./core";

// 1. Load configurations
await globalConfigManager.loadConfigs("./config/agents.json");

// 2. Create agents from configurations
const agentKeys = Object.keys(globalConfigManager.getAllConfigs());
for (const key of agentKeys) {
  const agent = factory.createFromPromptKey(key);
  if (agent) {
    agentRegistry.register(agent);
  }
}

// 3. Configure middleware
globalMiddlewareManager.use(new LoggingMiddleware());
globalMiddlewareManager.use(new PerformanceMiddleware());
globalMiddlewareManager.use(new ValidationMiddleware());

// 4. Setup orchestrator
const orchestrator = new AgentOrchestrator(
  agentRegistry,
  globalMiddlewareManager,
  new CapabilityBasedStrategy(),
  {
    enableFallback: true,
    fallbackAgent: "general-assistant-agent",
    maxExecutionTime: 30000,
    enableRetries: true,
    maxRetries: 3,
  },
);

// 5. Process requests
async function processUserRequest(
  input: string,
  userId?: string,
): Promise<string> {
  const context = {
    userId,
    currentTime: new Date().toISOString(),
    timezone: "UTC",
  };

  try {
    const result = await orchestrator.execute(context, input);
    return result.result.response;
  } catch (error) {
    console.error("Request processing failed:", error);
    return "Извините, произошла ошибка при обработке запроса.";
  }
}
```

## Performance Considerations

### Scalability

- Use connection pooling for database connections
- Implement caching for frequently accessed data
- Use async/await for non-blocking operations
- Consider clustering for high-load scenarios

### Memory Management

- Clean up resources after agent execution
- Use weak references where appropriate
- Monitor memory usage and implement limits
- Regular garbage collection monitoring

### Network Optimization

- Implement request/response compression
- Use CDN for static resources
- Batch network requests when possible
- Implement circuit breakers for external services

## Troubleshooting

### Common Issues

1. **Agent Not Found**: Check agent registration and key spelling
2. **Configuration Errors**: Validate configuration schema
3. **Performance Issues**: Monitor execution times and memory usage
4. **Error Handling**: Check error logs and retry configurations

### Debugging

- Use comprehensive logging middleware
- Monitor performance metrics
- Check agent health status
- Review error patterns and trends

### Monitoring Dashboard

```typescript
// Example monitoring dashboard data
async function getDashboardData() {
  return {
    system: globalPerformanceMonitor.getSystemMetrics(),
    agents: agentRegistry.getAll().map((agent) => ({
      key: agent.getConfig().key,
      stats: globalPerformanceMonitor.getAgentStats(agent.getConfig().key),
      health: await globalPerformanceMonitor.performHealthCheck(agent),
    })),
    alerts: globalPerformanceMonitor.getActiveAlerts(),
    errorStates: globalErrorHandler.getCircuitBreakerStates(),
  };
}
```

This improved architecture provides a robust, scalable, and maintainable foundation for AI agent management with comprehensive monitoring, testing, and configuration capabilities.
