import { generateObject, generateText, tool } from "ai";
import { z } from "zod";

import { getPromptSafe, PROMPT_KEYS } from "@synoro/prompts";

import type {
  AgentCapability,
  AgentResult,
  AgentTask,
  AgentTelemetry,
} from "./types";
import { AbstractAgent } from "./base-agent";

/**
 * Специализированный агент для ответов на вопросы
 * Использует знания о системе и контекст беседы
 */
export class QASpecialistAgent extends AbstractAgent {
  name = "Q&A Specialist";
  description =
    "Специализированный агент для ответов на вопросы о системе Synoro и предоставления информации";

  capabilities: AgentCapability[] = [
    {
      name: "Bot Information",
      description: "Ответы на вопросы о возможностях и функциях бота",
      category: "question",
      confidence: 0.95,
    },
    {
      name: "System Help",
      description: "Помощь в использовании системы Synoro",
      category: "question",
      confidence: 0.9,
    },
    {
      name: "General Knowledge",
      description: "Ответы на общие вопросы с учетом контекста Synoro",
      category: "question",
      confidence: 0.8,
    },
    {
      name: "Context Awareness",
      description: "Учет контекста беседы при ответах",
      category: "question",
      confidence: 0.85,
    },
  ];

  constructor() {
    super("gpt-5-nano", 0.4);
  }

  async canHandle(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<boolean> {
    try {
      // Используем AI для определения типа сообщения
      const { object: messageAnalysis } = await generateObject({
        model: this.getModel(),
        schema: z.object({
          isQuestion: z
            .boolean()
            .describe("Является ли сообщение вопросом или просьбой о помощи"),
          questionType: z
            .enum([
              "question",
              "help_request",
              "information_request",
              "general_chat",
              "other",
            ])
            .describe("Тип сообщения"),
          confidence: z
            .number()
            .min(0)
            .max(1)
            .describe("Уверенность в классификации"),
          reasoning: z.string().describe("Обоснование классификации"),
        }),
        system: `Ты - эксперт по определению типов сообщений пользователей в системе Synoro AI.

ТВОЯ ЗАДАЧА:
Определи, является ли сообщение пользователя вопросом или просьбой о помощи, которую может обработать QA-специалист.

ТИПЫ СООБЩЕНИЙ:
- question: прямые вопросы (что, как, где, когда, зачем, почему, какой, кто)
- help_request: просьбы о помощи, поддержке, инструкциях
- information_request: запросы информации, объяснений, деталей
- general_chat: обычное общение, не требующее специальной помощи
- other: прочие типы сообщений

ПРИЗНАКИ ВОПРОСОВ И ПРОСЬБ:
- Содержит вопросительные слова или знаки вопроса
- Выражает потребность в информации или помощи
- Просит что-то объяснить, показать, рассказать
- Ищет решение проблемы или задачи

ПРАВИЛА:
1. Если сообщение содержит вопрос или просьбу - это вопрос
2. Если это обычное общение без запроса - не вопрос
3. Учитывай контекст и намерение пользователя`,
        prompt: `Проанализируй сообщение: "${task.input}"

Определи, является ли это вопросом или просьбой о помощи.`,
        temperature: 0.1,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("question-detection", task),
          metadata: { inputLength: task.input.length },
        },
      });

      // Проверяем тип задачи
      const isQuestionType =
        task.type === "question" ||
        task.type === "chat" ||
        task.type === "general";

      return messageAnalysis.isQuestion && isQuestionType;
    } catch (error) {
      console.error("Error in AI question detection:", error);
      // Fallback к простой проверке
      const questionKeywords = [
        "что",
        "как",
        "где",
        "когда",
        "зачем",
        "почему",
        "какой",
        "кто",
        "можешь",
        "умеешь",
        "помоги",
        "расскажи",
        "объясни",
        "покажи",
        "?",
        "помощь",
        "help",
      ];

      const text = task.input.toLowerCase();
      const hasQuestionPattern = questionKeywords.some((keyword) =>
        text.includes(keyword),
      );

      const isQuestionType =
        task.type === "question" ||
        task.type === "chat" ||
        task.type === "general";
      return hasQuestionPattern && isQuestionType;
    }
  }

  /**
   * Определяет подтип вопроса с помощью AI
   */
  private async classifyQuestionSubtype(
    question: string,
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<string> {
    try {
      const { object: classification } = await generateObject({
        model: this.getModel(),
        schema: z.object({
          subtype: z
            .enum(["about_bot", "about_data", "help_request", "general"])
            .describe("Подтип вопроса"),
          confidence: z
            .number()
            .min(0)
            .max(1)
            .describe("Уверенность в классификации"),
        }),
        system: `Ты - специалист по классификации вопросов пользователей в системе Synoro AI.

КЛАССИФИКАЦИЯ ВОПРОСОВ:
- about_bot: вопросы о возможностях бота, функциях системы, что умеет Synoro
- about_data: вопросы о данных, статистике, анализе, сколько потратил, тренды
- help_request: просьбы о помощи, как что-то сделать, обучение, инструкции
- general: общие вопросы, не подходящие под другие категории

ПРИМЕРЫ:
- "Что умеет бот?" → about_bot
- "Сколько я потратил в этом месяце?" → about_data  
- "Помоги настроить задачу" → help_request
- "Привет, как дела?" → general`,
        prompt: `Классифицируй этот вопрос: "${question}"

Выбери наиболее подходящий подтип.`,
        temperature: 0.1,
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("question-classification", task),
          metadata: { questionLength: question.length },
        },
      });

      return classification.subtype;
    } catch (error) {
      console.error("Error in AI question classification:", error);
      return "general"; // Fallback
    }
  }

  /**
   * Создает инструмент для поиска информации о системе
   */
  private getSystemInfoTool(task: AgentTask, telemetry?: AgentTelemetry) {
    return tool({
      description: "Получение информации о возможностях системы Synoro",
      inputSchema: z.object({
        query: z.string().describe("Запрос информации о системе"),
      }),
      execute: async ({ query }) => {
        try {
          // Используем AI для поиска системной информации
          const { text: systemInfo } = await generateText({
            model: this.getModel(),
            system: getPromptSafe(PROMPT_KEYS.QA_SPECIALIST),
            prompt: `Пользователь спрашивает: "${query}"

Дай подробный и полезный ответ о возможностях Synoro AI.`,
            temperature: 0.3,
            experimental_telemetry: {
              isEnabled: true,
              ...this.createTelemetry("system-info-search", task),
              metadata: { queryLength: query.length },
            },
          });

          return systemInfo;
        } catch (error) {
          console.error("Error in AI system info search:", error);
          return "Общая информация: Synoro AI - умный помощник для управления жизненными событиями";
        }
      },
    });
  }

  async process(
    task: AgentTask,
    telemetry?: AgentTelemetry,
  ): Promise<AgentResult<string>> {
    try {
      // Получаем системный промпт
      const assistantPrompt = getPromptSafe(PROMPT_KEYS.ASSISTANT);

      // Определяем подтип вопроса
      const subtype = await this.classifyQuestionSubtype(
        task.input,
        task,
        telemetry,
      );

      // Формируем историю беседы (пока без контекста)
      const conversationHistory = "";

      // Создаем контекстный промпт в зависимости от подтипа вопроса
      let contextPrompt = task.input;

      if (subtype === "about_bot") {
        contextPrompt = `${conversationHistory}Пользователь спрашивает о возможностях бота: "${task.input}"
        
Дай подробный и дружелюбный ответ о функциях Synoro AI.`;
      } else if (subtype === "about_data") {
        contextPrompt = `${conversationHistory}Пользователь спрашивает о данных/статистике: "${task.input}"
        
Если данных пока нет, объясни как начать их собирать. Если есть вопрос о конкретных данных, предложи записать события для анализа.`;
      } else if (subtype === "help_request") {
        contextPrompt = `${conversationHistory}Пользователь просит помощи: "${task.input}"
        
Дай практический совет и предложи использовать функции Synoro для решения задачи.`;
      } else {
        contextPrompt = `${conversationHistory}Вопрос пользователя: "${task.input}"
        
Дай полезный ответ, связав его с возможностями Synoro где это уместно.`;
      }

      // Генерируем ответ с возможностью использования инструментов
      const result = await generateText({
        model: this.getModel(),
        system: assistantPrompt,
        prompt: contextPrompt,
        temperature: this.defaultTemperature,
        tools: {
          getSystemInfo: this.getSystemInfoTool(task, telemetry),
        },
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("answer-question", task),
        },
      });

      const response = result.text.trim();

      return this.createSuccessResult(
        response,
        0.9,
        `Answered ${subtype} question`,
      );
    } catch (error) {
      console.error("Error in QA specialist agent:", error);
      return this.createErrorResult("Failed to generate answer");
    }
  }
}
