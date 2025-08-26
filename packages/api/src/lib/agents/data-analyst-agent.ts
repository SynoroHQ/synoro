import { AbstractAgent, AgentTask, AgentTelemetry } from "./base-agent";

export class DataAnalystAgent extends AbstractAgent {
  constructor() {
    super("gpt-4o", 0.5);
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    const input = task.input.toLowerCase();
    return (
      input.includes("анализ") ||
      input.includes("статистика") ||
      input.includes("данные") ||
      input.includes("отчет") ||
      input.includes("метрики") ||
      input.includes("trend") ||
      input.includes("график") ||
      input.includes("числа") ||
      input.includes("расчет")
    );
  }

  async process(task: AgentTask, telemetry?: AgentTelemetry): Promise<string> {
    const systemPrompt = `Ты - специалист по анализу данных в системе Synoro AI.

Твоя задача - помогать пользователям с:
- Анализом данных и статистики
- Интерпретацией числовой информации
- Созданием отчетов и дашбордов
- Выявлением трендов и паттернов
- Объяснением сложных метрик

Ты можешь:
- Анализировать числовые данные
- Предлагать способы визуализации
- Давать рекомендации по сбору данных
- Помогать с интерпретацией результатов
- Объяснять статистические концепции

Всегда будь точным и объективным в своих анализах.`;

    try {
      const response = await this.generateResponse(
        task.input,
        systemPrompt,
        task,
        telemetry,
      );

      return response;
    } catch (error) {
      console.error("Error in DataAnalystAgent:", error);
      return "Извините, произошла ошибка при анализе данных. Убедитесь, что данные корректно представлены.";
    }
  }

  async shouldLog(task: AgentTask): Promise<boolean> {
    // Логируем все аналитические запросы
    return true;
  }
}
