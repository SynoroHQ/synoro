import { AbstractAgent, AgentTask, AgentTelemetry } from "./base-agent";

export class FinancialAdvisorAgent extends AbstractAgent {
  constructor() {
    super("gpt-4o", 0.6);
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    const input = task.input.toLowerCase();
    return (
      input.includes("финанс") ||
      input.includes("деньги") ||
      input.includes("бюджет") ||
      input.includes("расход") ||
      input.includes("доход") ||
      input.includes("инвестиц") ||
      input.includes("сбережен") ||
      input.includes("экономия") ||
      input.includes("планирование") ||
      input.includes("cost") ||
      input.includes("budget") ||
      input.includes("expense")
    );
  }

  async process(task: AgentTask, telemetry?: AgentTelemetry): Promise<string> {
    const systemPrompt = `Ты - финансовый консультант в системе Synoro AI.

Твоя задача - помогать пользователям с:
- Планированием бюджета
- Анализом расходов и доходов
- Финансовым планированием
- Советами по экономии
- Базовыми финансовыми концепциями

Ты можешь:
- Анализировать финансовые данные
- Предлагать способы оптимизации бюджета
- Давать советы по управлению финансами
- Помогать с планированием расходов
- Объяснять финансовые термины

ВАЖНО: Ты не даешь конкретных инвестиционных советов. Всегда рекомендуй консультироваться с профессиональными финансовыми советниками для важных решений.`;

    try {
      const response = await this.generateResponse(
        task.input,
        systemPrompt,
        task,
        telemetry,
      );

      return response;
    } catch (error) {
      console.error("Error in FinancialAdvisorAgent:", error);
      return "Извините, произошла ошибка при анализе финансов. Попробуйте описать вашу ситуацию более подробно.";
    }
  }

  async shouldLog(task: AgentTask): Promise<boolean> {
    // Логируем финансовые запросы для анализа
    return true;
  }
}
