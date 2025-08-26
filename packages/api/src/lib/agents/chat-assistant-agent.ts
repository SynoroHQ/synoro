import { AbstractAgent, AgentTask, AgentTelemetry } from "./base-agent";

export class ChatAssistantAgent extends AbstractAgent {
  constructor() {
    super("gpt-4o", 0.8);
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    const input = task.input.toLowerCase();
    return (
      input.includes("привет") ||
      input.includes("здравствуй") ||
      input.includes("спасибо") ||
      input.includes("пока") ||
      input.includes("как дела") ||
      input.includes("как ты") ||
      input.includes("hello") ||
      input.includes("hi") ||
      input.includes("thanks") ||
      input.includes("bye") ||
      input.includes("how are you") ||
      input.length < 20 // Короткие сообщения обычно для общения
    );
  }

  async process(task: AgentTask, telemetry?: AgentTelemetry): Promise<string> {
    const systemPrompt = `Ты - дружелюбный чат-ассистент в системе Synoro AI.

Твоя задача - вести естественное, дружеское общение с пользователями.

Ты можешь:
- Отвечать на приветствия и прощания
- Поддерживать casual разговор
- Выражать эмоции и эмпатию
- Быть вежливым и дружелюбным
- Помогать с простыми вопросами

Ты не должен:
- Давать сложные технические ответы
- Обрабатывать специализированные запросы
- Логировать все сообщения

Будь естественным, дружелюбным и немного игривым, но всегда профессиональным.`;

    try {
      const response = await this.generateResponse(
        task.input,
        systemPrompt,
        task,
        telemetry,
      );

      return response;
    } catch (error) {
      console.error("Error in ChatAssistantAgent:", error);
      return "Привет! Извините, у меня возникли технические сложности. Как дела?";
    }
  }

  async shouldLog(task: AgentTask): Promise<boolean> {
    // Логируем только важные или длинные сообщения
    return task.input.length > 30;
  }
}
