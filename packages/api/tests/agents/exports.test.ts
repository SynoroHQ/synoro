import { describe, expect, it } from "bun:test";

import {
  AbstractAgent,
  AgentManager,
  ChatAssistantAgent,
  DataAnalystAgent,
  EventProcessorAgent,
  FinancialAdvisorAgent,
  GeneralAssistantAgent,
  QASpecialistAgent,
  QualityEvaluatorAgent,
  RouterAgent,
  TaskManagerAgent,
  TaskOrchestratorAgent,
} from "../../src/lib/agents/index";

describe("Agent Exports", () => {
  it("should export AbstractAgent", () => {
    expect(AbstractAgent).toBeDefined();
    expect(typeof AbstractAgent).toBe("function");
  });

  it("should export RouterAgent", () => {
    expect(RouterAgent).toBeDefined();
    expect(typeof RouterAgent).toBe("function");
  });

  it("should export QASpecialistAgent", () => {
    expect(QASpecialistAgent).toBeDefined();
    expect(typeof QASpecialistAgent).toBe("function");
  });

  it("should export EventProcessorAgent", () => {
    expect(EventProcessorAgent).toBeDefined();
    expect(typeof EventProcessorAgent).toBe("function");
  });

  it("should export TaskOrchestratorAgent", () => {
    expect(TaskOrchestratorAgent).toBeDefined();
    expect(typeof TaskOrchestratorAgent).toBe("function");
  });

  it("should export QualityEvaluatorAgent", () => {
    expect(QualityEvaluatorAgent).toBeDefined();
    expect(typeof QualityEvaluatorAgent).toBe("function");
  });

  it("should export GeneralAssistantAgent", () => {
    expect(GeneralAssistantAgent).toBeDefined();
    expect(typeof GeneralAssistantAgent).toBe("function");
  });

  it("should export TaskManagerAgent", () => {
    expect(TaskManagerAgent).toBeDefined();
    expect(typeof TaskManagerAgent).toBe("function");
  });

  it("should export DataAnalystAgent", () => {
    expect(DataAnalystAgent).toBeDefined();
    expect(typeof DataAnalystAgent).toBe("function");
  });

  it("should export FinancialAdvisorAgent", () => {
    expect(FinancialAdvisorAgent).toBeDefined();
    expect(typeof FinancialAdvisorAgent).toBe("function");
  });

  it("should export ChatAssistantAgent", () => {
    expect(ChatAssistantAgent).toBeDefined();
    expect(typeof ChatAssistantAgent).toBe("function");
  });

  it("should export AgentManager", () => {
    expect(AgentManager).toBeDefined();
    expect(typeof AgentManager).toBe("function");
  });

  it("should export all required agents", () => {
    expect(AbstractAgent).toBeDefined();
    expect(RouterAgent).toBeDefined();
    expect(QASpecialistAgent).toBeDefined();
    expect(EventProcessorAgent).toBeDefined();
    expect(TaskOrchestratorAgent).toBeDefined();
    expect(QualityEvaluatorAgent).toBeDefined();
    expect(GeneralAssistantAgent).toBeDefined();
    expect(TaskManagerAgent).toBeDefined();
    expect(DataAnalystAgent).toBeDefined();
    expect(FinancialAdvisorAgent).toBeDefined();
    expect(ChatAssistantAgent).toBeDefined();
    expect(AgentManager).toBeDefined();
  });
});
