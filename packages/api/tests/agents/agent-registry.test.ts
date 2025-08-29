import { describe, expect, it } from "vitest";

import { AgentRegistryImpl } from "../../src/lib/agents/agent-registry";
import { AbstractAgent } from "../../src/lib/agents/base-agent";
import { AgentCapability } from "../../src/lib/agents/types";

class TestAgent extends AbstractAgent {
  name = "Test Agent";
  description = "A test agent for registry testing";
  capabilities: AgentCapability[] = ["text-generation"];

  async process(): Promise<any> {
    return { success: true, data: "Test result" };
  }
}

describe("AgentRegistry", () => {
  it("should register and retrieve agents", () => {
    const registry = new AgentRegistryImpl();
    const agent = new TestAgent();
    
    // Регистрируем агента
    registry.register(agent);
    
    // Проверяем, что агент зарегистрирован
    expect(registry.has("test-agent")).toBe(true);
    
    // Получаем агента
    const retrievedAgent = registry.get("test-agent");
    expect(retrievedAgent).toBeDefined();
    expect(retrievedAgent?.name).toBe("Test Agent");
  });
  
  it("should return all registered agents", () => {
    const registry = new AgentRegistryImpl();
    const agent1 = new TestAgent();
    const agent2 = new TestAgent();
    (agent2 as any).name = "Test Agent 2";
    
    registry.register(agent1);
    registry.register(agent2);
    
    const allAgents = registry.getAll();
    expect(allAgents.size).toBe(2);
    expect(allAgents.has("test-agent")).toBe(true);
    expect(allAgents.has("test-agent-2")).toBe(true);
  });
  
  it("should unregister agents", () => {
    const registry = new AgentRegistryImpl();
    const agent = new TestAgent();
    
    registry.register(agent);
    expect(registry.has("test-agent")).toBe(true);
    
    const result = registry.unregister("test-agent");
    expect(result).toBe(true);
    expect(registry.has("test-agent")).toBe(false);
    
    // Попытка удалить несуществующего агента
    const result2 = registry.unregister("non-existent");
    expect(result2).toBe(false);
  });
});
