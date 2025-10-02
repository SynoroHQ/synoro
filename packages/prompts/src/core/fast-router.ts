/**
 * Быстрый роутер для мгновенной классификации запросов
 */

import { AGENTS } from "./constants";

export interface RoutingRule {
  keywords: string[];
  agent: string;
  priority: number;
}

export class FastRouter {
  private rules: RoutingRule[] = [
    // Высокоприоритетные правила для event-processor
    {
      keywords: ["потратил", "купил", "заплатил", "оплатил", "трата"],
      agent: AGENTS.EVENT_PROCESSOR,
      priority: 10,
    },
    {
      keywords: ["записать", "создать", "добавить", "сохранить"],
      agent: AGENTS.EVENT_PROCESSOR,
      priority: 9,
    },
    {
      keywords: ["задача", "нужно", "надо", "сделать", "выполнить"],
      agent: AGENTS.EVENT_PROCESSOR,
      priority: 8,
    },
    {
      keywords: ["ремонт", "починил", "сломал", "обслуживание"],
      agent: AGENTS.EVENT_PROCESSOR,
      priority: 8,
    },

    // Правила для event-analyzer
    {
      keywords: ["покажи", "сколько", "статистика", "отчет", "анализ"],
      agent: AGENTS.EVENT_ANALYZER,
      priority: 9,
    },
    {
      keywords: ["тренд", "динамика", "сравни", "график", "данные"],
      agent: AGENTS.EVENT_ANALYZER,
      priority: 8,
    },
    {
      keywords: ["за месяц", "за год", "за период", "итого", "всего"],
      agent: AGENTS.EVENT_ANALYZER,
      priority: 7,
    },

    // Правила для general-assistant
    {
      keywords: ["как", "что такое", "объясни", "помоги", "инструкция"],
      agent: AGENTS.GENERAL_ASSISTANT,
      priority: 9,
    },
    {
      keywords: ["настройка", "конфигурация", "установка", "параметры"],
      agent: AGENTS.GENERAL_ASSISTANT,
      priority: 8,
    },
  ];

  // Быстрая классификация без LLM
  route(input: string): string {
    const normalizedInput = input.toLowerCase().trim();

    // Подсчитываем очки для каждого агента
    const scores = new Map<string, number>();

    for (const rule of this.rules) {
      for (const keyword of rule.keywords) {
        if (normalizedInput.includes(keyword)) {
          const currentScore = scores.get(rule.agent) || 0;
          scores.set(rule.agent, currentScore + rule.priority);
        }
      }
    }

    // Находим агента с максимальным счетом
    let bestAgent = AGENTS.EVENT_PROCESSOR; // По умолчанию
    let maxScore = 0;

    for (const [agent, score] of scores) {
      if (score > maxScore) {
        maxScore = score;
        bestAgent = agent;
      }
    }

    // Если нет четкого победителя, применяем дополнительную логику
    if (maxScore === 0) {
      return this.fallbackRouting(normalizedInput);
    }

    return bestAgent;
  }

  private fallbackRouting(input: string): string {
    // Простые эвристики для неопределенных случаев

    // Вопросительные слова → general-assistant
    if (
      input.includes("?") ||
      input.startsWith("как") ||
      input.startsWith("что")
    ) {
      return AGENTS.GENERAL_ASSISTANT;
    }

    // Числа и суммы → event-processor (скорее всего трата)
    if (/\d+/.test(input) && (input.includes("₽") || input.includes("руб"))) {
      return AGENTS.EVENT_PROCESSOR;
    }

    // Слова анализа → event-analyzer
    if (input.includes("показать") || input.includes("посмотреть")) {
      return AGENTS.EVENT_ANALYZER;
    }

    // По умолчанию → event-processor (самый универсальный)
    return AGENTS.EVENT_PROCESSOR;
  }

  // Добавление нового правила
  addRule(rule: RoutingRule): void {
    this.rules.push(rule);
    // Сортируем по приоритету
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  // Получение статистики роутинга
  getStats(): {
    totalRules: number;
    agentDistribution: Record<string, number>;
  } {
    const distribution: Record<string, number> = {};

    for (const rule of this.rules) {
      distribution[rule.agent] = (distribution[rule.agent] || 0) + 1;
    }

    return {
      totalRules: this.rules.length,
      agentDistribution: distribution,
    };
  }
}

// Глобальный быстрый роутер
export const globalFastRouter = new FastRouter();

// Middleware для быстрого роутинга
export class FastRoutingMiddleware {
  name = "fast-routing";
  priority = 15; // Очень высокий приоритет

  constructor(private router = globalFastRouter) {}

  async beforeExecute(agent: any, context: any, input: string) {
    // Если это роутер-агент, используем быстрый роутинг
    if (agent.getConfig().key === AGENTS.ROUTER) {
      const routedAgent = this.router.route(input);

      return {
        skipExecution: true,
        result: {
          response: routedAgent,
          confidence: 0.95,
          needsConfirmation: false,
          metadata: { fastRouted: true },
        },
      };
    }

    return { context, input };
  }

  async afterExecute(agent: any, context: any, input: string, result: any) {
    return result;
  }
}
