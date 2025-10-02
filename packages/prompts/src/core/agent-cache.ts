/**
 * Система кэширования для ускорения работы агентов
 */

export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
}

export class AgentCache {
  private cache = new Map<string, CacheEntry>();
  private stats = { hits: 0, misses: 0 };

  constructor(
    private maxSize = 1000,
    private defaultTTL = 5 * 60 * 1000, // 5 минут
  ) {}

  set<T>(key: string, value: T, ttl = this.defaultTTL): void {
    // Очищаем место если кэш переполнен
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
      hits: 0,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Проверяем TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hits++;
    this.stats.hits++;
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  private evictOldest(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Создание ключа кэша для промптов
  static createPromptKey(
    agentKey: string,
    input: string,
    context?: any,
  ): string {
    const contextHash = context ? this.hashObject(context) : "";
    const inputHash = this.hashString(input);
    return `prompt:${agentKey}:${inputHash}:${contextHash}`;
  }

  // Создание ключа для результатов роутинга
  static createRoutingKey(input: string, context?: any): string {
    const contextHash = context ? this.hashObject(context) : "";
    const inputHash = this.hashString(input);
    return `routing:${inputHash}:${contextHash}`;
  }

  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private static hashObject(obj: any): string {
    return this.hashString(JSON.stringify(obj));
  }
}

// Глобальный кэш для всех агентов
export const globalCache = new AgentCache(2000, 10 * 60 * 1000); // 10 минут TTL

// Middleware для кэширования
export class CacheMiddleware {
  name = "cache";
  priority = 10; // Высокий приоритет

  constructor(private cache = globalCache) {}

  async beforeExecute(agent: any, context: any, input: string) {
    const cacheKey = AgentCache.createPromptKey(
      agent.getConfig().key,
      input,
      context,
    );

    const cached = this.cache.get(cacheKey);
    if (cached) {
      // Возвращаем кэшированный результат
      return { skipExecution: true, result: cached };
    }

    return { context, input, cacheKey };
  }

  async afterExecute(
    agent: any,
    context: any,
    input: string,
    result: any,
    meta?: any,
  ) {
    if (meta?.cacheKey && result && !result.error) {
      // Кэшируем успешные результаты
      this.cache.set(meta.cacheKey, result, 5 * 60 * 1000); // 5 минут
    }
    return result;
  }
}
