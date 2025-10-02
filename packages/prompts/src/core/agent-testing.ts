import type {
  AgentCapabilities,
  AgentConfig,
  AgentContext,
  AgentResult,
} from "./agent";
import type { AgentMiddlewareManager } from "./agent-middleware";
import type { AgentPerformanceMonitor } from "./agent-monitoring";
import type {
  AgentOrchestrator,
  OrchestrationResult,
} from "./agent-orchestrator";
import { BaseAgent } from "./agent";

/**
 * Test agent that implements BaseAgent for testing purposes
 */
export class TestAgent extends BaseAgent {
  private mockResponses: AgentResult[] = [];
  private callHistory: Array<{ context: AgentContext; input: string }> = [];
  private shouldThrow = false;
  private throwError?: Error;

  constructor(config: AgentConfig, capabilities: AgentCapabilities = {}) {
    super(config, capabilities);
  }

  /**
   * Configure mock response
   */
  mockResponse(response: AgentResult): void {
    this.mockResponses.push(response);
  }

  /**
   * Configure multiple mock responses
   */
  setMockResponses(responses: AgentResult[]): void {
    this.mockResponses = [...responses];
  }

  /**
   * Configure agent to throw error
   */
  mockError(error: Error): void {
    this.shouldThrow = true;
    this.throwError = error;
  }

  /**
   * Get call history
   */
  getCallHistory(): Array<{ context: AgentContext; input: string }> {
    return [...this.callHistory];
  }

  /**
   * Reset agent state
   */
  reset(): void {
    this.mockResponses = [];
    this.callHistory = [];
    this.shouldThrow = false;
    this.throwError = undefined;
  }

  async canHandle(context: AgentContext, input: string): Promise<boolean> {
    return true; // Test agent can handle everything by default
  }

  async execute(context: AgentContext, input: string): Promise<AgentResult> {
    this.callHistory.push({ context, input });

    if (this.shouldThrow && this.throwError) {
      throw this.throwError;
    }

    if (this.mockResponses.length > 0) {
      const response = this.mockResponses.shift();
      if (response) {
        return response;
      }
    }

    // Default response
    return {
      response: `Test response for: ${input}`,
      confidence: 0.8,
      needsConfirmation: false,
    };
  }

  async getSystemPrompt(context: AgentContext): Promise<string> {
    return "Test system prompt";
  }
}

/**
 * Mock agent context builder
 */
export class MockAgentContextBuilder {
  private context: Partial<AgentContext> = {};

  static create(): MockAgentContextBuilder {
    return new MockAgentContextBuilder();
  }

  withUserId(userId: string): MockAgentContextBuilder {
    this.context.userId = userId;
    return this;
  }

  withHouseholdId(householdId: string): MockAgentContextBuilder {
    this.context.householdId = householdId;
    return this;
  }

  withTelegramChatId(telegramChatId: string): MockAgentContextBuilder {
    this.context.telegramChatId = telegramChatId;
    return this;
  }

  withCurrentTime(currentTime: string): MockAgentContextBuilder {
    this.context.currentTime = currentTime;
    return this;
  }

  withTimezone(timezone: string): MockAgentContextBuilder {
    this.context.timezone = timezone;
    return this;
  }

  withMessageHistory(history: any[]): MockAgentContextBuilder {
    this.context.messageHistory = history;
    return this;
  }

  withMetadata(metadata: Record<string, unknown>): MockAgentContextBuilder {
    this.context.metadata = metadata;
    return this;
  }

  build(): AgentContext {
    return {
      currentTime: new Date().toISOString(),
      timezone: "UTC",
      ...this.context,
    } as AgentContext;
  }
}

/**
 * Agent test result assertion helpers
 */
export class AgentTestAssertions {
  static assertValidResult(result: AgentResult): void {
    if (!result.response) {
      throw new Error("Agent result must have a response");
    }

    if (typeof result.response !== "string") {
      throw new Error("Agent result response must be a string");
    }

    if (
      result.confidence !== undefined &&
      (result.confidence < 0 || result.confidence > 1)
    ) {
      throw new Error("Agent result confidence must be between 0 and 1");
    }

    if (
      result.needsConfirmation !== undefined &&
      typeof result.needsConfirmation !== "boolean"
    ) {
      throw new Error("Agent result needsConfirmation must be a boolean");
    }
  }

  static assertResponseContains(result: AgentResult, text: string): void {
    if (!result.response.includes(text)) {
      throw new Error(
        `Expected response to contain "${text}", but got: "${result.response}"`,
      );
    }
  }

  static assertResponseEquals(result: AgentResult, expected: string): void {
    if (result.response !== expected) {
      throw new Error(
        `Expected response "${expected}", but got: "${result.response}"`,
      );
    }
  }

  static assertConfidenceAbove(result: AgentResult, threshold: number): void {
    if (result.confidence === undefined || result.confidence < threshold) {
      throw new Error(
        `Expected confidence above ${threshold}, but got: ${result.confidence}`,
      );
    }
  }

  static assertNoErrors(result: AgentResult): void {
    if (result.errors && result.errors.length > 0) {
      throw new Error(
        `Expected no errors, but got: ${result.errors.join(", ")}`,
      );
    }
  }

  static assertHasErrors(result: AgentResult): void {
    if (!result.errors || result.errors.length === 0) {
      throw new Error("Expected errors in result, but got none");
    }
  }

  static assertExecutionTime(
    result: OrchestrationResult,
    maxTime: number,
  ): void {
    if (result.executionTime > maxTime) {
      throw new Error(
        `Expected execution time below ${maxTime}ms, but got: ${result.executionTime}ms`,
      );
    }
  }
}

/**
 * Test data generator for agent testing
 */
export class AgentTestDataGenerator {
  /**
   * Generate random agent context
   */
  static generateContext(overrides: Partial<AgentContext> = {}): AgentContext {
    return {
      userId: `user_${Math.random().toString(36).substr(2, 9)}`,
      householdId: `household_${Math.random().toString(36).substr(2, 9)}`,
      telegramChatId: `chat_${Math.random().toString(36).substr(2, 9)}`,
      currentTime: new Date().toISOString(),
      timezone: "UTC",
      messageHistory: [],
      metadata: {},
      ...overrides,
    };
  }

  /**
   * Generate test input strings
   */
  static generateInputs(count = 10): string[] {
    const templates = [
      "Потратил {amount} рублей на {category}",
      "Нужно {action} в {time}",
      "Показать статистику по {period}",
      "Как {question}?",
      "Помоги с {task}",
    ];

    const amounts = ["500", "1200", "3500", "750", "2000"];
    const categories = [
      "продукты",
      "транспорт",
      "развлечения",
      "одежда",
      "здоровье",
    ];
    const actions = [
      "купить молоко",
      "позвонить маме",
      "починить кран",
      "записаться к врачу",
    ];
    const periods = ["месяц", "неделю", "год", "день"];
    const questions = [
      "создать событие",
      "удалить запись",
      "изменить настройки",
    ];
    const tasks = ["настройкой", "анализом", "планированием", "организацией"];

    const inputs: string[] = [];

    for (let i = 0; i < count; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      if (!template) continue;

      const input = template
        .replace(
          "{amount}",
          amounts[Math.floor(Math.random() * amounts.length)] || "500",
        )
        .replace(
          "{category}",
          categories[Math.floor(Math.random() * categories.length)] ||
            "продукты",
        )
        .replace(
          "{action}",
          actions[Math.floor(Math.random() * actions.length)] ||
            "купить молоко",
        )
        .replace("{time}", "завтра")
        .replace(
          "{period}",
          periods[Math.floor(Math.random() * periods.length)] || "месяц",
        )
        .replace(
          "{question}",
          questions[Math.floor(Math.random() * questions.length)] ||
            "создать событие",
        )
        .replace(
          "{task}",
          tasks[Math.floor(Math.random() * tasks.length)] || "настройкой",
        );

      inputs.push(input);
    }

    return inputs;
  }

  /**
   * Generate test agent configuration
   */
  static generateAgentConfig(
    overrides: Partial<AgentConfig> = {},
  ): AgentConfig {
    return {
      key: `test-agent-${Math.random().toString(36).substr(2, 9)}`,
      name: `Test Agent ${Math.random().toString(36).substr(2, 5)}`,
      model: "gpt-5-nano",
      temperature: 0.7,
      maxTokens: 2000,
      timeout: 10000,
      retryAttempts: 3,
      labels: ["test"],
      enabled: true,
      ...overrides,
    };
  }
}

/**
 * Agent test suite runner
 */
export class AgentTestSuite {
  private tests: Array<{
    name: string;
    fn: () => Promise<void> | void;
  }> = [];

  private beforeEachHooks: Array<() => Promise<void> | void> = [];
  private afterEachHooks: Array<() => Promise<void> | void> = [];
  private beforeAllHooks: Array<() => Promise<void> | void> = [];
  private afterAllHooks: Array<() => Promise<void> | void> = [];

  constructor(private suiteName: string) {}

  /**
   * Add test case
   */
  test(name: string, fn: () => Promise<void> | void): void {
    this.tests.push({ name, fn });
  }

  /**
   * Add before each hook
   */
  beforeEach(fn: () => Promise<void> | void): void {
    this.beforeEachHooks.push(fn);
  }

  /**
   * Add after each hook
   */
  afterEach(fn: () => Promise<void> | void): void {
    this.afterEachHooks.push(fn);
  }

  /**
   * Add before all hook
   */
  beforeAll(fn: () => Promise<void> | void): void {
    this.beforeAllHooks.push(fn);
  }

  /**
   * Add after all hook
   */
  afterAll(fn: () => Promise<void> | void): void {
    this.afterAllHooks.push(fn);
  }

  /**
   * Run all tests in the suite
   */
  async run(): Promise<AgentTestResults> {
    const results: AgentTestResults = {
      suiteName: this.suiteName,
      totalTests: this.tests.length,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      testResults: [],
      duration: 0,
      startTime: new Date(),
    };

    const startTime = Date.now();

    try {
      // Run before all hooks
      for (const hook of this.beforeAllHooks) {
        await hook();
      }

      // Run tests
      for (const test of this.tests) {
        const testResult: AgentTestResult = {
          name: test.name,
          passed: false,
          duration: 0,
          error: null,
          startTime: new Date(),
        };

        const testStartTime = Date.now();

        try {
          // Run before each hooks
          for (const hook of this.beforeEachHooks) {
            await hook();
          }

          // Run test
          await test.fn();

          // Run after each hooks
          for (const hook of this.afterEachHooks) {
            await hook();
          }

          testResult.passed = true;
          results.passedTests++;
        } catch (error) {
          testResult.passed = false;
          testResult.error = error as Error;
          results.failedTests++;
        } finally {
          testResult.duration = Date.now() - testStartTime;
          results.testResults.push(testResult);
        }
      }

      // Run after all hooks
      for (const hook of this.afterAllHooks) {
        await hook();
      }
    } catch (error) {
      console.error(`Error in test suite ${this.suiteName}:`, error);
    } finally {
      results.duration = Date.now() - startTime;
      results.endTime = new Date();
    }

    return results;
  }
}

/**
 * Individual test result
 */
export interface AgentTestResult {
  name: string;
  passed: boolean;
  duration: number;
  error: Error | null;
  startTime: Date;
  endTime?: Date;
}

/**
 * Test suite results
 */
export interface AgentTestResults {
  suiteName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  testResults: AgentTestResult[];
  duration: number;
  startTime: Date;
  endTime?: Date;
}

/**
 * Performance test configuration
 */
export interface PerformanceTestConfig {
  name: string;
  concurrent: number;
  iterations: number;
  maxExecutionTime: number;
  maxMemoryUsage?: number;
  warmupIterations?: number;
}

/**
 * Performance test runner
 */
export class AgentPerformanceTestRunner {
  /**
   * Run performance test on an agent
   */
  static async runPerformanceTest(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
    config: PerformanceTestConfig,
  ): Promise<PerformanceTestResults> {
    const results: PerformanceTestResults = {
      name: config.name,
      totalIterations: config.iterations,
      successfulIterations: 0,
      failedIterations: 0,
      averageExecutionTime: 0,
      minExecutionTime: Number.MAX_VALUE,
      maxExecutionTime: 0,
      p95ExecutionTime: 0,
      p99ExecutionTime: 0,
      throughput: 0,
      memoryUsage: [],
      errors: [],
      startTime: new Date(),
    };

    const executionTimes: number[] = [];
    const promises: Promise<void>[] = [];

    // Warmup
    if (config.warmupIterations && config.warmupIterations > 0) {
      for (let i = 0; i < config.warmupIterations; i++) {
        try {
          await agent.execute(context, input);
        } catch {
          // Ignore warmup errors
        }
      }
    }

    const startTime = Date.now();

    // Create concurrent executions
    for (
      let batch = 0;
      batch < Math.ceil(config.iterations / config.concurrent);
      batch++
    ) {
      const batchPromises: Promise<void>[] = [];
      const batchSize = Math.min(
        config.concurrent,
        config.iterations - batch * config.concurrent,
      );

      for (let i = 0; i < batchSize; i++) {
        const promise = this.runSingleIteration(
          agent,
          context,
          input,
          config.maxExecutionTime,
        ).then((result) => {
          if (result.success) {
            results.successfulIterations++;
            executionTimes.push(result.executionTime);
            results.minExecutionTime = Math.min(
              results.minExecutionTime,
              result.executionTime,
            );
            results.maxExecutionTime = Math.max(
              results.maxExecutionTime,
              result.executionTime,
            );
          } else {
            results.failedIterations++;
            if (result.error) {
              results.errors.push(result.error.message);
            }
          }

          if (result.memoryUsage !== undefined) {
            results.memoryUsage.push(result.memoryUsage);
          }
        });

        batchPromises.push(promise);
      }

      await Promise.all(batchPromises);
    }

    const totalTime = Date.now() - startTime;

    // Calculate metrics
    if (executionTimes.length > 0) {
      executionTimes.sort((a, b) => a - b);
      results.averageExecutionTime =
        executionTimes.reduce((sum, time) => sum + time, 0) /
        executionTimes.length;
      results.p95ExecutionTime =
        executionTimes[Math.floor(executionTimes.length * 0.95)] || 0;
      results.p99ExecutionTime =
        executionTimes[Math.floor(executionTimes.length * 0.99)] || 0;
    }

    results.throughput = (results.successfulIterations / totalTime) * 1000; // per second
    results.endTime = new Date();

    return results;
  }

  private static async runSingleIteration(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
    maxExecutionTime: number,
  ): Promise<{
    success: boolean;
    executionTime: number;
    memoryUsage?: number;
    error?: Error;
  }> {
    const startTime = Date.now();
    const startMemory = this.getMemoryUsage();

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Execution timeout")),
          maxExecutionTime,
        );
      });

      await Promise.race([agent.execute(context, input), timeoutPromise]);

      const executionTime = Date.now() - startTime;
      const endMemory = this.getMemoryUsage();
      const memoryUsage = endMemory
        ? endMemory - (startMemory || 0)
        : undefined;

      return {
        success: true,
        executionTime,
        memoryUsage,
      };
    } catch (error) {
      return {
        success: false,
        executionTime: Date.now() - startTime,
        error: error as Error,
      };
    }
  }

  private static getMemoryUsage(): number | undefined {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return undefined;
  }
}

/**
 * Performance test results
 */
export interface PerformanceTestResults {
  name: string;
  totalIterations: number;
  successfulIterations: number;
  failedIterations: number;
  averageExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  p95ExecutionTime: number;
  p99ExecutionTime: number;
  throughput: number; // iterations per second
  memoryUsage: number[];
  errors: string[];
  startTime: Date;
  endTime?: Date;
}

/**
 * Integration test runner for agent workflows
 */
export class AgentIntegrationTestRunner {
  /**
   * Test complete agent workflow
   */
  static async testWorkflow(
    orchestrator: AgentOrchestrator,
    context: AgentContext,
    inputs: string[],
  ): Promise<WorkflowTestResults> {
    const results: WorkflowTestResults = {
      totalSteps: inputs.length,
      successfulSteps: 0,
      failedSteps: 0,
      stepResults: [],
      totalExecutionTime: 0,
      startTime: new Date(),
    };

    let previousResult: OrchestrationResult | undefined;

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (!input) continue;

      const stepStartTime = Date.now();

      try {
        // Add previous result to context if available
        const stepContext = previousResult
          ? {
              ...context,
              metadata: {
                ...context.metadata,
                previousResult: previousResult.result,
              },
            }
          : context;

        const result = await orchestrator.execute(stepContext, input);

        const stepResult: WorkflowStepResult = {
          step: i + 1,
          input,
          result,
          success: true,
          executionTime: Date.now() - stepStartTime,
          agentUsed: result.selectedAgent,
        };

        results.stepResults.push(stepResult);
        results.successfulSteps++;
        previousResult = result;
      } catch (error) {
        const stepResult: WorkflowStepResult = {
          step: i + 1,
          input,
          success: false,
          executionTime: Date.now() - stepStartTime,
          error: error as Error,
        };

        results.stepResults.push(stepResult);
        results.failedSteps++;
      }
    }

    results.totalExecutionTime = results.stepResults.reduce(
      (sum, step) => sum + step.executionTime,
      0,
    );
    results.endTime = new Date();

    return results;
  }
}

/**
 * Workflow test results
 */
export interface WorkflowTestResults {
  totalSteps: number;
  successfulSteps: number;
  failedSteps: number;
  stepResults: WorkflowStepResult[];
  totalExecutionTime: number;
  startTime: Date;
  endTime?: Date;
}

/**
 * Individual workflow step result
 */
export interface WorkflowStepResult {
  step: number;
  input: string;
  result?: OrchestrationResult;
  success: boolean;
  executionTime: number;
  agentUsed?: string;
  error?: Error;
}

/**
 * Test runner factory
 */
export class AgentTestRunnerFactory {
  /**
   * Create unit test runner
   */
  static createUnitTestRunner(): AgentTestSuite {
    return new AgentTestSuite("Unit Tests");
  }

  /**
   * Create integration test runner
   */
  static createIntegrationTestRunner(): AgentTestSuite {
    return new AgentTestSuite("Integration Tests");
  }

  /**
   * Create performance test runner
   */
  static createPerformanceTestRunner(): AgentTestSuite {
    return new AgentTestSuite("Performance Tests");
  }

  /**
   * Create end-to-end test runner
   */
  static createE2ETestRunner(): AgentTestSuite {
    return new AgentTestSuite("End-to-End Tests");
  }
}

/**
 * Export test utilities
 */
export const AgentTestUtils = {
  TestAgent,
  MockAgentContextBuilder,
  AgentTestAssertions,
  AgentTestDataGenerator,
  AgentTestSuite,
  AgentPerformanceTestRunner,
  AgentIntegrationTestRunner,
  AgentTestRunnerFactory,
};
