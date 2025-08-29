import type { AttributeValue } from "@opentelemetry/api";
import type { LanguageModel } from "ai";

// Базовые типы для агентов
export interface AgentContext {
  userId?: string;
  chatId?: string;
  messageId?: string;
  channel: string;
  metadata?: Record<string, unknown>; // Упрощенная метаданная
}

export interface AgentTelemetry {
  functionId?: string;
  metadata?: Record<string, AttributeValue | undefined>;
}

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
  reasoning?: string;
}

export interface AgentTask {
  id: string;
  type: string;
  input: string;
  context: AgentContext;
  priority: number;
  createdAt: Date;
}

export interface AgentCapability {
  name: string;
  description: string;
  category: string;
  confidence: number;
}

// Базовый интерфейс агента
export interface BaseAgent {
  name: string;
  description: string;
  capabilities: AgentCapability[];
  canHandle(task: AgentTask): Promise<boolean>;
  process(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<AgentResult<unknown>>;
  getModel(): LanguageModel;
}

// Типы специализированных агентов
export interface RoutingDecision {
  targetAgent: string;
  confidence: number;
  reasoning: string;
  shouldParallel?: boolean;
  followUpAgents?: string[];
}

export interface ClassificationResult {
  messageType: "question" | "event" | "chat" | "complex_task" | "irrelevant";
  subtype?: string;
  confidence: number;
  needsLogging: boolean;
  complexity: "simple" | "medium" | "complex";
  suggestedAgents: string[];
}

export interface QualityMetrics {
  accuracy: number;
  relevance: number;
  completeness: number;
  clarity: number;
  helpfulness: number;
  overallScore: number;
}

export interface TaskResult {
  response: string;
  data?: unknown;
  quality: QualityMetrics;
  metadata?: Record<string, unknown>;
}

// Результат оркестрации
export interface OrchestrationResult {
  finalResponse: string;
  agentsUsed: string[];
  totalSteps: number;
  qualityScore: number;
  metadata: {
    processingTime: number;
    agentData?: {
      parsedEvent?: unknown;
      structuredData?: unknown;
      [key: string]: unknown;
    };
    shouldLogEvent?: boolean; // Флаг для автоматического логирования событий
    [key: string]: unknown;
  };
}
