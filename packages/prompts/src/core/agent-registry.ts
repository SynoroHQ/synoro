import type { AgentCapabilities, AgentRegistry, BaseAgent } from "./agent";

/**
 * Default implementation of agent registry
 */
export class DefaultAgentRegistry implements AgentRegistry {
  private agents = new Map<string, BaseAgent>();

  /**
   * Register an agent in the registry
   */
  register(agent: BaseAgent): void {
    const config = agent.getConfig();

    if (this.agents.has(config.key)) {
      throw new Error(`Agent with key '${config.key}' is already registered`);
    }

    this.agents.set(config.key, agent);
  }

  /**
   * Unregister an agent from the registry
   */
  unregister(key: string): void {
    this.agents.delete(key);
  }

  /**
   * Get an agent by key
   */
  get(key: string): BaseAgent | undefined {
    return this.agents.get(key);
  }

  /**
   * Get all registered agents
   */
  getAll(): BaseAgent[] {
    return Array.from(this.agents.values()).filter((agent) =>
      agent.isEnabled(),
    );
  }

  /**
   * Get agents by capability
   */
  getByCapability(capability: keyof AgentCapabilities): BaseAgent[] {
    return this.getAll().filter((agent) => {
      const capabilities = agent.getCapabilities();
      return capabilities[capability] === true;
    });
  }

  /**
   * Get agents that can handle the given context and input
   */
  async getCapableAgents(context: any, input: string): Promise<BaseAgent[]> {
    const agents = this.getAll();
    const capableAgents: BaseAgent[] = [];

    for (const agent of agents) {
      try {
        if (await agent.canHandle(context, input)) {
          capableAgents.push(agent);
        }
      } catch (error) {
        console.warn(
          `Error checking if agent ${agent.getConfig().key} can handle input:`,
          error,
        );
      }
    }

    return capableAgents;
  }

  /**
   * Clear all registered agents
   */
  clear(): void {
    this.agents.clear();
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    total: number;
    enabled: number;
    disabled: number;
    byCapability: Record<string, number>;
  } {
    const allAgents = Array.from(this.agents.values());
    const enabledAgents = allAgents.filter((agent) => agent.isEnabled());

    const byCapability: Record<string, number> = {};
    const capabilities: (keyof AgentCapabilities)[] = [
      "canProcessEvents",
      "canAnalyzeData",
      "canProvideHelp",
      "canRoute",
    ];

    for (const capability of capabilities) {
      byCapability[capability] = enabledAgents.filter(
        (agent) => agent.getCapabilities()[capability] === true,
      ).length;
    }

    return {
      total: allAgents.length,
      enabled: enabledAgents.length,
      disabled: allAgents.length - enabledAgents.length,
      byCapability,
    };
  }
}

// Global registry instance
export const agentRegistry = new DefaultAgentRegistry();
