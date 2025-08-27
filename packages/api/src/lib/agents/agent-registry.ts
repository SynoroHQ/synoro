import type { BaseAgent } from "./types";

/**
 * Интерфейс для реестра агентов
 */
export interface AgentRegistry {
  /**
   * Регистрирует агента в реестре
   */
  register(agent: BaseAgent): void;
  
  /**
   * Получает агента по ключу
   */
  get(key: string): BaseAgent | undefined;
  
  /**
   * Проверяет, существует ли агент с указанным ключом
   */
  has(key: string): boolean;
  
  /**
   * Возвращает все зарегистрированные агенты
   */
  getAll(): Map<string, BaseAgent>;
  
  /**
   * Удаляет агента из реестра
   */
  unregister(key: string): boolean;
}

/**
 * Реализация реестра агентов
 */
export class AgentRegistryImpl implements AgentRegistry {
  private agents = new Map<string, BaseAgent>();
  
  /**
   * Нормализация ключа агента
   * Удаляет все не-латинские буквы и цифры (кроме пробелов),
   * затем заменяет последовательности пробелов на дефисы и приводит к нижнему регистру
   */
  private getAgentKey(agentName: string): string {
    if (!agentName.trim()) {
      return "";
    }

    return agentName
      .replace(/[^a-zA-Z0-9\s]/g, "") // Удаляем все символы кроме букв, цифр и пробелов
      .replace(/\s+/g, "-") // Заменяем последовательности пробелов на дефисы
      .replace(/^-+|-+$/g, "") // Убираем дефисы в начале и конце
      .toLowerCase(); // Приводим к нижнему регистру
  }
  
  register(agent: BaseAgent): void {
    const key = this.getAgentKey(agent.name);
    this.agents.set(key, agent);
  }
  
  get(key: string): BaseAgent | undefined {
    return this.agents.get(key);
  }
  
  has(key: string): boolean {
    return this.agents.has(key);
  }
  
  getAll(): Map<string, BaseAgent> {
    return new Map(this.agents);
  }
  
  unregister(key: string): boolean {
    return this.agents.delete(key);
  }
}

// Глобальный экземпляр реестра агентов
export const globalAgentRegistry = new AgentRegistryImpl();
