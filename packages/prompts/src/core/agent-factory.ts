import type { AgentCapabilities, AgentConfig, BaseAgent } from "./agent";
import type { PromptDefinition } from "./prompt";

/**
 * Agent factory interface
 */
export interface AgentFactory {
  createAgent(
    config: AgentConfig,
    promptDefinition: PromptDefinition,
    capabilities?: AgentCapabilities,
  ): BaseAgent;

  createFromPromptKey(key: string): BaseAgent | null;

  getSupportedTypes(): string[];
}

/**
 * Agent type registry for factory
 */
export interface AgentTypeRegistry {
  register<T extends BaseAgent>(
    type: string,
    agentConstructor: new (
      config: AgentConfig,
      promptDefinition: PromptDefinition,
      capabilities?: AgentCapabilities,
    ) => T,
  ): void;

  get(type: string): any;

  getAll(): Record<string, any>;
}

/**
 * Default agent type registry implementation
 */
export class DefaultAgentTypeRegistry implements AgentTypeRegistry {
  private types = new Map<string, any>();

  register<T extends BaseAgent>(
    type: string,
    agentConstructor: new (
      config: AgentConfig,
      promptDefinition: PromptDefinition,
      capabilities?: AgentCapabilities,
    ) => T,
  ): void {
    if (this.types.has(type)) {
      throw new Error(`Agent type '${type}' is already registered`);
    }

    this.types.set(type, agentConstructor);
  }

  get(type: string): any {
    return this.types.get(type);
  }

  getAll(): Record<string, any> {
    return Object.fromEntries(this.types);
  }
}

/**
 * Default agent factory implementation
 */
export class DefaultAgentFactory implements AgentFactory {
  private typeRegistry: AgentTypeRegistry;
  private promptRegistry: Record<string, PromptDefinition>;

  constructor(
    typeRegistry: AgentTypeRegistry,
    promptRegistry: Record<string, PromptDefinition>,
  ) {
    this.typeRegistry = typeRegistry;
    this.promptRegistry = promptRegistry;
  }

  /**
   * Create an agent with given configuration and prompt definition
   */
  createAgent(
    config: AgentConfig,
    promptDefinition: PromptDefinition,
    capabilities?: AgentCapabilities,
  ): BaseAgent {
    // Determine agent type from config or prompt definition
    const agentType = this.determineAgentType(config.key, promptDefinition);
    const AgentConstructor = this.typeRegistry.get(agentType);

    if (!AgentConstructor) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    try {
      return new AgentConstructor(config, promptDefinition, capabilities);
    } catch (error) {
      throw new Error(
        `Failed to create agent of type '${agentType}': ${error}`,
      );
    }
  }

  /**
   * Create an agent from prompt registry key
   */
  createFromPromptKey(key: string): BaseAgent | null {
    const promptDefinition = this.promptRegistry[key];
    if (!promptDefinition) {
      console.warn(`Prompt definition not found for key: ${key}`);
      return null;
    }

    // Create config from prompt definition
    const config: AgentConfig = {
      key: promptDefinition.key,
      name: promptDefinition.name,
      model: promptDefinition.defaultModel || "gpt-5-nano",
      temperature: 0.7,
      labels: promptDefinition.labels,
      enabled: true,
    };

    // Determine capabilities from prompt key
    const capabilities = this.determineCapabilities(key);

    try {
      return this.createAgent(config, promptDefinition, capabilities);
    } catch (error) {
      console.error(`Failed to create agent for prompt key '${key}':`, error);
      return null;
    }
  }

  /**
   * Get all supported agent types
   */
  getSupportedTypes(): string[] {
    return Array.from(Object.keys(this.typeRegistry.getAll()));
  }

  /**
   * Determine agent type from configuration and prompt
   */
  private determineAgentType(
    configKey: string,
    promptDefinition: PromptDefinition,
  ): string {
    // Map specific prompt keys to agent types
    const typeMapping: Record<string, string> = {
      "router-agent": "router",
      "event-processor-agent": "event-processor",
      "event-analyzer-agent": "event-analyzer",
      "general-assistant-agent": "general-assistant",
      "event-creation-extraction": "event-extractor",
      "base-agent-context": "context-analyzer",
      "base-agent-quality": "quality-assessor",
    };

    return typeMapping[configKey] || "generic";
  }

  /**
   * Determine capabilities from prompt key
   */
  private determineCapabilities(key: string): AgentCapabilities {
    const capabilityMap: Record<string, AgentCapabilities> = {
      "router-agent": {
        canRoute: true,
        supportedLanguages: ["ru", "en"],
      },
      "event-processor-agent": {
        canProcessEvents: true,
        supportedEventTypes: [
          "purchase",
          "maintenance",
          "health",
          "work",
          "personal",
          "transport",
          "home",
          "finance",
          "education",
          "entertainment",
          "travel",
          "food",
          "other",
        ],
        supportedLanguages: ["ru"],
      },
      "event-analyzer-agent": {
        canAnalyzeData: true,
        supportedEventTypes: [
          "расходы",
          "задачи",
          "ремонт",
          "встречи",
          "прочее",
        ],
        supportedLanguages: ["ru"],
      },
      "general-assistant-agent": {
        canProvideHelp: true,
        canProcessEvents: true,
        supportedLanguages: ["ru"],
      },
      "event-creation-extraction": {
        canProcessEvents: true,
        supportedEventTypes: [
          "purchase",
          "maintenance",
          "health",
          "work",
          "personal",
          "transport",
          "home",
          "finance",
          "education",
          "entertainment",
          "travel",
          "food",
          "other",
        ],
        supportedLanguages: ["ru", "en"],
      },
      "base-agent-context": {
        canAnalyzeData: true,
        supportedLanguages: ["ru", "en"],
      },
      "base-agent-quality": {
        canAnalyzeData: true,
        supportedLanguages: ["ru", "en"],
      },
    };

    return (
      capabilityMap[key] || {
        supportedLanguages: ["ru", "en"],
      }
    );
  }
}

// Global instances
export const agentTypeRegistry = new DefaultAgentTypeRegistry();
export const createAgentFactory = (
  promptRegistry: Record<string, PromptDefinition>,
) => new DefaultAgentFactory(agentTypeRegistry, promptRegistry);
