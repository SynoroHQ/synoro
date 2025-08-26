import { generateText, tool } from "ai";
import { z } from "zod";

import { getPromptSafe, PROMPT_KEYS } from "@synoro/prompts";

import type {
  AgentCapability,
  AgentResult,
  AgentTask,
  AgentTelemetry,
} from "./types";
import { parseContextSafely } from "../ai/advisor";
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
    super("gpt-5-mini", 0.4);
  }

  canHandle(task: AgentTask): Promise<boolean> {
    // Проверяем, что это вопрос
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

    // Дополнительная проверка на тип задачи
    const isQuestionType =
      task.type === "question" ||
      task.type === "chat" ||
      task.type === "general";

    return Promise.resolve(hasQuestionPattern && isQuestionType);
  }

  /**
   * Определяет подтип вопроса для более точного ответа
   */
  private classifyQuestionSubtype(question: string): string {
    const botKeywords = [
      "бот",
      "synoro",
      "умеешь",
      "можешь",
      "функции",
      "возможности",
    ];
    const helpKeywords = ["помоги", "help", "как", "покажи", "научи"];
    const dataKeywords = [
      "статистика",
      "данные",
      "потратил",
      "сколько",
      "анализ",
    ];

    const text = question.toLowerCase();

    if (botKeywords.some((keyword) => text.includes(keyword))) {
      return "about_bot";
    }
    if (dataKeywords.some((keyword) => text.includes(keyword))) {
      return "about_data";
    }
    if (helpKeywords.some((keyword) => text.includes(keyword))) {
      return "help_request";
    }

    return "general";
  }

  /**
   * Создает инструмент для поиска информации о системе
   */
  private getSystemInfoTool() {
    return tool({
      description: "Получение информации о возможностях системы Synoro",
      inputSchema: z.object({
        query: z.string().describe("Запрос информации о системе"),
      }),
      execute: ({ query }) => {
        // Базовая информация о системе
        const systemInfo = {
          функции:
            "Логирование событий, анализ данных, финансовая аналитика, управление задачами, ответы на вопросы",
          возможности:
            "Записываю покупки, встречи, задачи; анализирую расходы; выявляю паттерны; даю советы",
          "типы событий": "покупки, задачи, встречи, заметки, расходы, доходы",
          аналитика:
            "статистика расходов, анализ паттернов поведения, финансовые советы",
          платформы: "Telegram бот, веб-приложение, мобильное приложение",
        };

        // Простой поиск по ключевым словам
        const queryLower = query.toLowerCase();
        const results = Object.entries(systemInfo).filter(
          ([key, value]) =>
            queryLower.includes(key) ||
            value.toLowerCase().includes(queryLower),
        );

        return results.length > 0
          ? results.map(([k, v]) => `${k}: ${v}`).join("; ")
          : "Общая информация: Synoro AI - умный помощник для управления жизненными событиями";
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
      const subtype = this.classifyQuestionSubtype(task.input);

      // Извлекаем контекст из метаданных телеметрии
      const context = parseContextSafely(telemetry);

      // Формируем историю беседы
      let conversationHistory = "";
      if (context.length > 0) {
        conversationHistory = "\n\nИстория беседы:\n";
        context.forEach((msg, index) => {
          const role = msg.role === "user" ? "Пользователь" : "Ассистент";
          conversationHistory += `${index + 1}. ${role}: ${msg.content.text}\n`;
        });
        conversationHistory += "\n";
      }

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
          getSystemInfo: this.getSystemInfoTool(),
        },
        experimental_telemetry: {
          isEnabled: true,
          ...this.createTelemetry("answer-question", task, telemetry),
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
