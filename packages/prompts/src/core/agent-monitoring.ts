import type { AgentContext, AgentResult, BaseAgent } from "./agent";
import { AgentError } from "./agent-error-handling";

/**
 * Performance metrics for individual agent execution
 */
export interface AgentExecutionMetrics {
  agentKey: string;
  executionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  inputLength: number;
  outputLength?: number;
  confidence?: number;
  retryAttempts?: number;
  errorType?: string;
  memoryUsage?: number;
  cpuUsage?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Aggregated agent performance statistics
 */
export interface AgentPerformanceStats {
  agentKey: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  medianExecutionTime: number;
  p95ExecutionTime: number;
  p99ExecutionTime: number;
  successRate: number;
  averageConfidence: number;
  totalRetries: number;
  lastUpdated: Date;
  errorBreakdown: Record<string, number>;
}

/**
 * System-wide performance metrics
 */
export interface SystemPerformanceMetrics {
  totalAgents: number;
  activeAgents: number;
  totalExecutions: number;
  systemSuccessRate: number;
  averageResponseTime: number;
  peakResponseTime: number;
  throughput: number; // executions per minute
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: Date;
}

/**
 * Health check status
 */
export enum HealthStatus {
  HEALTHY = "healthy",
  WARNING = "warning",
  CRITICAL = "critical",
  UNKNOWN = "unknown",
}

/**
 * Agent health check result
 */
export interface AgentHealthCheck {
  agentKey: string;
  status: HealthStatus;
  responseTime?: number;
  lastSuccessfulExecution?: Date;
  consecutiveFailures: number;
  issues: string[];
  recommendations: string[];
  timestamp: Date;
}

/**
 * Performance alert configuration
 */
export interface AlertConfig {
  metric: string;
  threshold: number;
  comparison: "greater_than" | "less_than" | "equals";
  enabled: boolean;
  cooldownPeriod: number; // milliseconds
}

/**
 * Performance alert
 */
export interface PerformanceAlert {
  id: string;
  agentKey?: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

/**
 * Agent performance monitor class
 */
export class AgentPerformanceMonitor {
  private metrics = new Map<string, AgentExecutionMetrics[]>();
  private alertConfigs = new Map<string, AlertConfig[]>();
  private activeAlerts = new Map<string, PerformanceAlert>();
  private lastAlertTimes = new Map<string, number>();
  private readonly maxMetricsPerAgent = 1000;
  private readonly metricsRetentionPeriod = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Start monitoring an agent execution
   */
  startExecution(
    agent: BaseAgent,
    context: AgentContext,
    input: string,
  ): string {
    const executionId = this.generateExecutionId();
    const agentKey = agent.getConfig().key;

    const metric: AgentExecutionMetrics = {
      agentKey,
      executionId,
      startTime: Date.now(),
      success: false,
      inputLength: input.length,
      metadata: {
        userId: context.userId,
        householdId: context.householdId,
        telegramChatId: context.telegramChatId,
      },
    };

    if (!this.metrics.has(agentKey)) {
      this.metrics.set(agentKey, []);
    }

    const agentMetrics = this.metrics.get(agentKey);
    if (!agentMetrics) {
      this.metrics.set(agentKey, []);
      return executionId;
    }
    agentMetrics.push(metric);

    // Keep only recent metrics to prevent memory issues
    this.cleanupOldMetrics(agentKey);

    return executionId;
  }

  /**
   * Record successful execution completion
   */
  recordSuccess(
    executionId: string,
    result: AgentResult,
    retryAttempts = 0,
  ): void {
    const metric = this.findMetric(executionId);
    if (!metric) return;

    const endTime = Date.now();
    metric.endTime = endTime;
    metric.duration = endTime - metric.startTime;
    metric.success = true;
    metric.outputLength = result.response.length;
    metric.confidence = result.confidence;
    metric.retryAttempts = retryAttempts;

    this.checkAlerts(metric.agentKey);
  }

  /**
   * Record failed execution
   */
  recordFailure(
    executionId: string,
    error: AgentError | Error,
    retryAttempts = 0,
  ): void {
    const metric = this.findMetric(executionId);
    if (!metric) return;

    const endTime = Date.now();
    metric.endTime = endTime;
    metric.duration = endTime - metric.startTime;
    metric.success = false;
    metric.retryAttempts = retryAttempts;

    if (error instanceof AgentError) {
      metric.errorType = error.type;
    } else {
      metric.errorType = error.name || "UnknownError";
    }

    this.checkAlerts(metric.agentKey);
  }

  /**
   * Get performance statistics for a specific agent
   */
  getAgentStats(agentKey: string): AgentPerformanceStats | null {
    const metrics = this.metrics.get(agentKey);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const completedMetrics = metrics.filter((m) => m.endTime !== undefined);
    const successfulMetrics = completedMetrics.filter((m) => m.success);
    const failedMetrics = completedMetrics.filter((m) => !m.success);

    const executionTimes = completedMetrics
      .map((m) => m.duration)
      .filter((d): d is number => d !== undefined)
      .sort((a, b) => a - b);

    const confidences = successfulMetrics
      .map((m) => m.confidence)
      .filter((c): c is number => c !== undefined);

    const errorBreakdown: Record<string, number> = {};
    failedMetrics.forEach((m) => {
      if (m.errorType) {
        errorBreakdown[m.errorType] = (errorBreakdown[m.errorType] || 0) + 1;
      }
    });

    return {
      agentKey,
      totalExecutions: completedMetrics.length,
      successfulExecutions: successfulMetrics.length,
      failedExecutions: failedMetrics.length,
      averageExecutionTime: this.calculateAverage(executionTimes),
      medianExecutionTime: this.calculatePercentile(executionTimes, 50),
      p95ExecutionTime: this.calculatePercentile(executionTimes, 95),
      p99ExecutionTime: this.calculatePercentile(executionTimes, 99),
      successRate:
        completedMetrics.length > 0
          ? successfulMetrics.length / completedMetrics.length
          : 0,
      averageConfidence: this.calculateAverage(confidences),
      totalRetries: completedMetrics.reduce(
        (sum, m) => sum + (m.retryAttempts || 0),
        0,
      ),
      lastUpdated: new Date(),
      errorBreakdown,
    };
  }

  /**
   * Get system-wide performance metrics
   */
  getSystemMetrics(): SystemPerformanceMetrics {
    const allMetrics: AgentExecutionMetrics[] = [];
    let totalAgents = 0;
    let activeAgents = 0;

    for (const [agentKey, metrics] of this.metrics) {
      totalAgents++;
      allMetrics.push(...metrics);

      // Consider agent active if it had executions in the last hour
      const recentMetrics = metrics.filter(
        (m) => Date.now() - m.startTime < 60 * 60 * 1000,
      );
      if (recentMetrics.length > 0) {
        activeAgents++;
      }
    }

    const completedMetrics = allMetrics.filter((m) => m.endTime !== undefined);
    const successfulMetrics = completedMetrics.filter((m) => m.success);
    const executionTimes = completedMetrics
      .map((m) => m.duration)
      .filter((d): d is number => d !== undefined);

    // Calculate throughput (executions per minute in last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentCompletedMetrics = completedMetrics.filter(
      (m) => m.endTime && m.endTime > oneHourAgo,
    );
    const throughput = recentCompletedMetrics.length / 60; // per minute

    return {
      totalAgents,
      activeAgents,
      totalExecutions: completedMetrics.length,
      systemSuccessRate:
        completedMetrics.length > 0
          ? successfulMetrics.length / completedMetrics.length
          : 0,
      averageResponseTime: this.calculateAverage(executionTimes),
      peakResponseTime: Math.max(...executionTimes, 0),
      throughput,
      errorRate:
        completedMetrics.length > 0
          ? (completedMetrics.length - successfulMetrics.length) /
            completedMetrics.length
          : 0,
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCpuUsage(),
      timestamp: new Date(),
    };
  }

  /**
   * Perform health check on a specific agent
   */
  async performHealthCheck(agent: BaseAgent): Promise<AgentHealthCheck> {
    const agentKey = agent.getConfig().key;
    const stats = this.getAgentStats(agentKey);
    const issues: string[] = [];
    const recommendations: string[] = [];

    let status = HealthStatus.HEALTHY;
    let responseTime: number | undefined;
    let lastSuccessfulExecution: Date | undefined;
    let consecutiveFailures = 0;

    if (stats) {
      // Check response time
      if (stats.averageExecutionTime > 10000) {
        // 10 seconds
        status = HealthStatus.WARNING;
        issues.push("High average response time");
        recommendations.push(
          "Consider optimizing agent logic or increasing timeout",
        );
      }

      // Check success rate
      if (stats.successRate < 0.8) {
        status = HealthStatus.CRITICAL;
        issues.push("Low success rate");
        recommendations.push("Review error logs and improve error handling");
      } else if (stats.successRate < 0.9) {
        status = HealthStatus.WARNING;
        issues.push("Moderate success rate");
        recommendations.push("Monitor error patterns");
      }

      // Check recent failures
      const recentMetrics = this.metrics.get(agentKey)?.slice(-10) || [];
      let consecutive = 0;
      for (let i = recentMetrics.length - 1; i >= 0; i--) {
        const metric = recentMetrics[i];
        if (metric && !metric.success && metric.endTime) {
          consecutive++;
        } else {
          break;
        }
      }
      consecutiveFailures = consecutive;

      if (consecutiveFailures >= 5) {
        status = HealthStatus.CRITICAL;
        issues.push("Multiple consecutive failures");
        recommendations.push("Check agent configuration and dependencies");
      }

      responseTime = stats.averageExecutionTime;

      // Find last successful execution
      const successfulMetrics = recentMetrics.filter(
        (m) => m.success && m.endTime,
      );
      if (successfulMetrics.length > 0) {
        const lastMetric = successfulMetrics[successfulMetrics.length - 1];
        if (lastMetric?.endTime) {
          lastSuccessfulExecution = new Date(lastMetric.endTime);
        }
      }
    } else {
      status = HealthStatus.UNKNOWN;
      issues.push("No execution history available");
    }

    // Try a basic health check
    try {
      const healthCheckStart = Date.now();
      const canHandle = await agent.canHandle(
        {
          currentTime: new Date().toISOString(),
          timezone: "UTC",
        },
        "health check",
      );
      responseTime = Date.now() - healthCheckStart;

      if (!canHandle) {
        issues.push("Agent cannot handle basic requests");
        status = HealthStatus.CRITICAL;
      }
    } catch (error) {
      issues.push(`Health check failed: ${(error as Error).message}`);
      status = HealthStatus.CRITICAL;
    }

    return {
      agentKey,
      status,
      responseTime,
      lastSuccessfulExecution,
      consecutiveFailures,
      issues,
      recommendations,
      timestamp: new Date(),
    };
  }

  /**
   * Configure performance alerts
   */
  configureAlert(agentKey: string, config: AlertConfig): void {
    if (!this.alertConfigs.has(agentKey)) {
      this.alertConfigs.set(agentKey, []);
    }

    const configs = this.alertConfigs.get(agentKey);
    if (!configs) return;
    const existingIndex = configs.findIndex((c) => c.metric === config.metric);

    if (existingIndex >= 0) {
      configs[existingIndex] = config;
    } else {
      configs.push(config);
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return Array.from(this.activeAlerts.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Clear old metrics to prevent memory issues
   */
  private cleanupOldMetrics(agentKey: string): void {
    const metrics = this.metrics.get(agentKey);
    if (!metrics) return;
    const cutoffTime = Date.now() - this.metricsRetentionPeriod;

    // Remove old metrics
    const filteredMetrics = metrics.filter((m) => m.startTime > cutoffTime);

    // Keep only the most recent metrics if we still have too many
    if (filteredMetrics.length > this.maxMetricsPerAgent) {
      filteredMetrics.splice(
        0,
        filteredMetrics.length - this.maxMetricsPerAgent,
      );
    }

    this.metrics.set(agentKey, filteredMetrics);
  }

  /**
   * Find metric by execution ID
   */
  private findMetric(executionId: string): AgentExecutionMetrics | undefined {
    for (const metrics of this.metrics.values()) {
      const metric = metrics.find((m) => m.executionId === executionId);
      if (metric) return metric;
    }
    return undefined;
  }

  /**
   * Check and trigger alerts based on current metrics
   */
  private checkAlerts(agentKey: string): void {
    const configs = this.alertConfigs.get(agentKey);
    if (!configs) return;

    const stats = this.getAgentStats(agentKey);
    if (!stats) return;

    for (const config of configs) {
      if (!config.enabled) continue;

      const alertKey = `${agentKey}_${config.metric}`;
      const lastAlertTime = this.lastAlertTimes.get(alertKey) || 0;

      // Check cooldown period
      if (Date.now() - lastAlertTime < config.cooldownPeriod) {
        continue;
      }

      const currentValue = this.getMetricValue(stats, config.metric);
      if (currentValue === undefined) continue;

      let shouldAlert = false;
      switch (config.comparison) {
        case "greater_than":
          shouldAlert = currentValue > config.threshold;
          break;
        case "less_than":
          shouldAlert = currentValue < config.threshold;
          break;
        case "equals":
          shouldAlert = currentValue === config.threshold;
          break;
      }

      if (shouldAlert) {
        const alert: PerformanceAlert = {
          id: this.generateAlertId(),
          agentKey,
          metric: config.metric,
          currentValue,
          threshold: config.threshold,
          severity: this.determineSeverity(
            config.metric,
            currentValue,
            config.threshold,
          ),
          message: `${config.metric} is ${currentValue} (threshold: ${config.threshold})`,
          timestamp: new Date(),
          acknowledged: false,
        };

        this.activeAlerts.set(alert.id, alert);
        this.lastAlertTimes.set(alertKey, Date.now());
      }
    }
  }

  /**
   * Get metric value from stats
   */
  private getMetricValue(
    stats: AgentPerformanceStats,
    metric: string,
  ): number | undefined {
    switch (metric) {
      case "successRate":
        return stats.successRate;
      case "averageExecutionTime":
        return stats.averageExecutionTime;
      case "p95ExecutionTime":
        return stats.p95ExecutionTime;
      case "errorRate":
        return 1 - stats.successRate;
      default:
        return undefined;
    }
  }

  /**
   * Determine alert severity
   */
  private determineSeverity(
    metric: string,
    currentValue: number,
    threshold: number,
  ): "info" | "warning" | "error" | "critical" {
    const ratio = currentValue / threshold;

    if (metric === "successRate" && currentValue < threshold) {
      if (ratio < 0.5) return "critical";
      if (ratio < 0.8) return "error";
      return "warning";
    }

    if (metric === "averageExecutionTime" && currentValue > threshold) {
      if (ratio > 3) return "critical";
      if (ratio > 2) return "error";
      return "warning";
    }

    return "warning";
  }

  /**
   * Calculate average of an array
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(
    sortedValues: number[],
    percentile: number,
  ): number {
    if (sortedValues.length === 0) return 0;

    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    const value = sortedValues[Math.max(0, index)];
    return value !== undefined ? value : 0;
  }

  /**
   * Get memory usage (simplified for demo)
   */
  private getMemoryUsage(): number {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const usage = process.memoryUsage();
      return usage.heapUsed / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * Get CPU usage (simplified for demo)
   */
  private getCpuUsage(): number {
    // This would normally integrate with system monitoring
    return Math.random() * 100;
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Global performance monitor instance
 */
export const globalPerformanceMonitor = new AgentPerformanceMonitor();
