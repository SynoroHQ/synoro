import { generateObject } from "ai";
import { z } from "zod";

import { getPromptSafe, PROMPT_KEYS } from "@synoro/prompts";

import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { AbstractAgent } from "./base-agent";

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
    super("gpt-5-mini", 0.6);
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    try {
      // Используем AI для определения типа запроса по управлению задачами
      const { object: taskAnalysis } = await generateObject({
        model: this.getModel(),
        schema: z.object({
          isTaskManagementRequest: z
            .boolean()
            .describe("Требует ли запрос управления задачами"),
          taskType: z
            .enum([
              "task_planning",
              "todo_management",
              "deadline_setting",
              "priority_management",
              "task_organization",
              "other",
            ])
            .describe("Тип запроса по управлению задачами"),
          confidence: z
            .number()
            .min(0)
            .max(1)
            .describe("Уверенность в классификации"),
          reasoning: z.string().describe("Обоснование классификации"),
        }),
        system: getPromptSafe(PROMPT_KEYS.TASK_MANAGER),
        prompt: `Проанализируй запрос: "${task.input}"

Определи, связан ли он с управлением задачами.`,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("task-management-detection", task),
          metadata: { inputLength: task.input.length },
        },
      });

      return taskAnalysis.isTaskManagementRequest;
    } catch (error) {
      console.error("Error in AI task management detection:", error);
      throw new Error("Ошибка определения типа запроса по управлению задачами");
    }
  }

  async process(task: AgentTask): Promise<AgentResult<string>> {
    const systemPrompt = getPromptSafe(PROMPT_KEYS.ASSISTANT);

    try {
      const response = await this.generateResponse(
        task.input,
        systemPrompt,
        task,
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
