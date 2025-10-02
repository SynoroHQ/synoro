/**
 * Утилита для мониторинга производительности агентов
 */

import { globalCache, globalFastRouter, globalOptimizer } from "../core";

export interface PerformanceReport {
  timestamp: number;
  cache: {
    stats: any;
    hitRate: number;
    size: number;
  };
  routing: {
    totalRules: number;
    distribution: Record<string, number>;
  };
  recommendations: string[];
}

export class PerformanceMonitor {
  private executionTimes: Map<string, number[]> = new Map();
  private errorCounts: Map<string, number> = new Map();

  // Записать время выполнения агента
  recordExecution(agentKey: string, timeMs: number): void {
    const times = this.executionTimes.get(agentKey) || [];
    times.push(timeMs);

    // Храним только последние 100 записей
    if (times.length > 100) {
      times.shift();
    }

    this.executionTimes.set(agentKey, times);
  }

  // Записать ошибку
  recordError(agentKey: string): void {
    const count = this.errorCounts.get(agentKey) || 0;
    this.errorCounts.set(agentKey, count + 1);
  }

  // Получить среднее время выполнения
  getAverageTime(agentKey: string): number {
    const times = this.executionTimes.get(agentKey) || [];
    if (times.length === 0) return 0;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  // Получить статистику по агенту
  getAgentStats(agentKey: string) {
    const times = this.executionTimes.get(agentKey) || [];
    const errors = this.errorCounts.get(agentKey) || 0;

    return {
      executions: times.length,
      averageTime: this.getAverageTime(agentKey),
      minTime: times.length > 0 ? Math.min(...times) : 0,
      maxTime: times.length > 0 ? Math.max(...times) : 0,
      errors,
      errorRate: times.length > 0 ? errors / times.length : 0,
    };
  }

  // Генерация отчета о производительности
  generateReport(): PerformanceReport {
    const cacheStats = globalCache.getStats();
    const routingStats = globalFastRouter.getStats();

    const recommendations: string[] = [];

    // Анализ кэша
    if (cacheStats.hitRate < 0.3) {
      recommendations.push(
        "Низкий hit rate кэша. Рассмотрите увеличение TTL или размера кэша",
      );
    }

    if (cacheStats.size > cacheStats.maxSize * 0.9) {
      recommendations.push(
        "Кэш почти заполнен. Рассмотрите увеличение maxSize",
      );
    }

    // Анализ производительности агентов
    for (const [agentKey] of this.executionTimes) {
      const stats = this.getAgentStats(agentKey);

      if (stats.averageTime > 10000) {
        recommendations.push(
          `Агент ${agentKey} работает медленно (${Math.round(stats.averageTime)}ms)`,
        );
      }

      if (stats.errorRate > 0.1) {
        recommendations.push(
          `Высокий уровень ошибок у агента ${agentKey} (${Math.round(stats.errorRate * 100)}%)`,
        );
      }
    }

    return {
      timestamp: Date.now(),
      cache: {
        stats: cacheStats,
        hitRate: cacheStats.hitRate,
        size: cacheStats.size,
      },
      routing: routingStats,
      recommendations,
    };
  }

  // Очистка старых данных
  cleanup(): void {
    this.executionTimes.clear();
    this.errorCounts.clear();
  }

  // Экспорт данных для анализа
  exportData() {
    const data: any = {
      timestamp: Date.now(),
      agents: {},
    };

    for (const [agentKey] of this.executionTimes) {
      data.agents[agentKey] = this.getAgentStats(agentKey);
    }

    return data;
  }
}

// Глобальный монитор производительности
export const performanceMonitor = new PerformanceMonitor();

// Middleware для автоматического мониторинга
export class PerformanceTrackingMiddleware {
  name = "performance-tracking";
  priority = 1;

  private startTimes = new Map<string, number>();

  async beforeExecute(agent: any, context: any, input: string) {
    const executionId = `${agent.getConfig().key}-${Date.now()}`;
    this.startTimes.set(executionId, Date.now());

    return { context, input, executionId };
  }

  async afterExecute(
    agent: any,
    context: any,
    input: string,
    result: any,
    meta?: any,
  ) {
    if (meta?.executionId) {
      const startTime = this.startTimes.get(meta.executionId);
      if (startTime) {
        const duration = Date.now() - startTime;
        performanceMonitor.recordExecution(agent.getConfig().key, duration);
        this.startTimes.delete(meta.executionId);

        // Записываем ошибки
        if (result.error) {
          performanceMonitor.recordError(agent.getConfig().key);
        }
      }
    }

    return result;
  }
}
