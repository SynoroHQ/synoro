import { AbstractAgent } from "./base-agent";
import type {
  AgentTask,
  AgentTelemetry,
  AgentResult,
  AgentCapability,
} from "./types";
import { getPromptSafe, PROMPT_KEYS } from "@synoro/prompts";

export class TaskManagerAgent extends AbstractAgent {
  name = "Task Manager";
  description =
    "Помощник по управлению задачами: постановка, приоритизация и дедлайны";
  capabilities: AgentCapability[] = [
    {
      name: "Task Planning",
      description: "Разбиение задач, планирование и приоритизация",
      category: "complex_task",
      confidence: 0.85,
    },
    {
      name: "Todo Management",
      description: "Списки дел, статусы и дедлайны",
      category: "task",
      confidence: 0.8,
    },
  ];
  constructor() {
    super("gpt-4o", 0.6);
  }

  canHandle(task: AgentTask): Promise<boolean> {
    const input = task.input.toLowerCase();
    return Promise.resolve(
      input.includes("задача") ||
        input.includes("task") ||
        input.includes("todo") ||
        input.includes("список") ||
        input.includes("планирование") ||
        input.includes("deadline") ||
        input.includes("приоритет"),
    );
  }

  async process(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<AgentResult<string>> {
    const systemPrompt = getPromptSafe(PROMPT_KEYS.ASSISTANT);

    try {
      const response = await this.generateResponse(
        task.input,
        systemPrompt,
        task,
        telemetry,
      );

      return this.createSuccessResult(response, 0.85);
    } catch (error) {
      console.error("Error in TaskManagerAgent:", error);
      return this.createErrorResult(
        "Извините, произошла ошибка при обработке задачи. Попробуйте описать задачу более подробно.",
      );
    }
  }

  shouldLog(_task: AgentTask): Promise<boolean> {
    // Логируем все задачи для отслеживания
    return Promise.resolve(true);
  }
}
