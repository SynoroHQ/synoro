import { AbstractAgent, AgentTask, AgentTelemetry } from "./base-agent";

export class GeneralAssistantAgent extends AbstractAgent {
  constructor() {
    super("gpt-4o", 0.7);
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    // Универсальный агент может обработать любое сообщение
    return true;
  }

  async process(task: AgentTask, telemetry?: AgentTelemetry): Promise<string> {
    const systemPrompt = `Ты - универсальный AI помощник в системе Synoro AI.

Твоя задача - помочь пользователю с любыми вопросами и задачами, которые не требуют специализированной обработки.

Ты можешь:
- Отвечать на общие вопросы
- Помогать с повседневными задачами
- Объяснять сложные концепции простым языком
- Предоставлять полезную информацию
- Вести дружескую беседу

Всегда будь полезным, дружелюбным и профессиональным.`;

    try {
      const response = await this.generateResponse(
        task.input,
        systemPrompt,
        task,
        telemetry,
      );

      return response;
    } catch (error) {
      console.error("Error in GeneralAssistantAgent:", error);
      return "Извините, произошла ошибка при обработке вашего запроса. Попробуйте переформулировать вопрос.";
    }
  }

  async shouldLog(task: AgentTask): Promise<boolean> {
    // Логируем только важные взаимодействия
    return task.input.length > 50 || task.context.channel === "telegram";
  }
}
