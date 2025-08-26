import { AbstractAgent, AgentTask, AgentTelemetry } from "./base-agent";

export class TaskManagerAgent extends AbstractAgent {
  constructor() {
    super("gpt-4o", 0.6);
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    const input = task.input.toLowerCase();
    return (
      input.includes("задача") ||
      input.includes("task") ||
      input.includes("todo") ||
      input.includes("список") ||
      input.includes("планирование") ||
      input.includes("deadline") ||
      input.includes("приоритет")
    );
  }

  async process(task: AgentTask, telemetry?: AgentTelemetry): Promise<string> {
    const systemPrompt = `Ты - специалист по управлению задачами в системе Synoro AI.

Твоя задача - помогать пользователям с:
- Созданием и управлением задачами
- Планированием и приоритизацией
- Отслеживанием прогресса
- Установкой дедлайнов
- Организацией рабочего процесса

Ты можешь:
- Анализировать описание задач
- Предлагать структуру и разбивку
- Давать советы по планированию
- Помогать с приоритизацией
- Объяснять методы управления проектами

Всегда будь организованным и методичным в своих рекомендациях.`;

    try {
      const response = await this.generateResponse(
        task.input,
        systemPrompt,
        task,
        telemetry,
      );

      return response;
    } catch (error) {
      console.error("Error in TaskManagerAgent:", error);
      return "Извините, произошла ошибка при обработке задачи. Попробуйте описать задачу более подробно.";
    }
  }

  async shouldLog(task: AgentTask): Promise<boolean> {
    // Логируем все задачи для отслеживания
    return true;
  }
}
