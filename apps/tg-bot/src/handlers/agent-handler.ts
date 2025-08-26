import type { Context } from "grammy";

import { apiClient } from "../api/client";
import {
  createMessageContext,
  getUserIdentifier,
} from "../utils/telegram-utils";

/**
 * Обработчик команды /agents - переключение в агентный режим
 */
export async function handleAgentsCommand(ctx: Context): Promise<void> {
  try {
    await ctx.replyWithChatAction("typing");

    const messageContext = createMessageContext(ctx);
    console.log(`🤖 Команда /agents от ${getUserIdentifier(ctx.from)} в чате ${messageContext.chatId}`);

    // Получаем статистику агентов
    const agentStats = await apiClient.messages.processMessageAgents.getAgentStatsForBot.query();

    const response = `🤖 *Агентная система Synoro AI активна*

📊 *Статистика системы:*
• Всего агентов: ${agentStats.totalAgents}
• Доступные агенты: ${agentStats.agentList.join(", ")}

🔍 *Как это работает:*
Система автоматически выбирает лучших агентов для обработки ваших сообщений:

• *Router Agent* - классифицирует сообщения и выбирает подходящего агента
• *Q&A Specialist* - отвечает на вопросы о системе и функциях
• *Event Processor* - обрабатывает события (покупки, задачи, встречи)
• *Task Orchestrator* - координирует сложные многоэтапные задачи
• *Quality Evaluator* - проверяет и улучшает качество ответов

✨ *Преимущества:*
• Более точная обработка сложных запросов
• Автоматическое улучшение качества ответов
• Специализированные агенты для разных типов задач
• Контроль качества на каждом этапе

📝 *Попробуйте прямо сейчас:*
Отправьте любое сообщение, и система автоматически выберет лучший способ его обработки!`;

    await ctx.reply(response, { parse_mode: "Markdown" });

  } catch (error) {
    console.error("Error in agents command:", error);
    await ctx.reply("Произошла ошибка при получении информации об агентах.");
  }
}

/**
 * Обработчик команды /agent_test - тестирование агентной обработки
 */
export async function handleAgentTestCommand(ctx: Context): Promise<void> {
  try {
    await ctx.replyWithChatAction("typing");
    
    const messageContext = createMessageContext(ctx);
    console.log(`🧪 Команда /agent_test от ${getUserIdentifier(ctx.from)} в чате ${messageContext.chatId}`);

    // Отправляем тестовое сообщение через агентную систему
    const testMessage = "Проанализируй мои возможности экономии и дай советы по управлению финансами";
    
    await ctx.reply("🧪 *Тестирование агентной системы...*\n\nОтправляю тестовый запрос: \"" + testMessage + "\"", 
      { parse_mode: "Markdown" });

    const result = await apiClient.messages.processMessageAgents.processMessageFromTelegramWithAgents.mutate({
      text: testMessage,
      channel: "telegram",
      chatId: messageContext.chatId,
      messageId: messageContext.messageId,
      telegramUserId: messageContext.userId,
      agentOptions: {
        forceAgentMode: true,
        useQualityControl: true,
        maxQualityIterations: 2,
        targetQuality: 0.8,
      },
      metadata: {
        testMode: true,
        timestamp: new Date().toISOString(),
      },
    });

    let response = `🎯 *Результат тестирования агентной системы:*\n\n`;
    response += `📝 *Ответ:*\n${result.response}\n\n`;
    
    if (result.agentMetadata) {
      response += `🤖 *Информация о процессе:*\n`;
      response += `• Режим обработки: ${result.agentMetadata.processingMode}\n`;
      response += `• Использованы агенты: ${result.agentMetadata.agentsUsed.join(" → ")}\n`;
      response += `• Количество шагов: ${result.agentMetadata.totalSteps}\n`;
      response += `• Качество ответа: ${(result.agentMetadata.qualityScore * 100).toFixed(1)}%\n`;
      response += `• Время обработки: ${result.agentMetadata.processingTime}мс\n\n`;
    }
    
    response += `📊 *Классификация:*\n`;
    response += `• Тип: ${result.messageType.type}\n`;
    response += `• Уверенность: ${(result.messageType.confidence * 100).toFixed(1)}%\n`;
    response += `• Релевантность: ${result.relevance.relevant ? "Да" : "Нет"}\n`;

    // Разбиваем длинный ответ если нужно
    const MAX_TG_MESSAGE = 4096;
    if (response.length > MAX_TG_MESSAGE) {
      const parts = [];
      let currentPart = "";
      const lines = response.split("\n");
      
      for (const line of lines) {
        if (currentPart.length + line.length + 1 > MAX_TG_MESSAGE) {
          parts.push(currentPart);
          currentPart = line;
        } else {
          currentPart += (currentPart ? "\n" : "") + line;
        }
      }
      if (currentPart) parts.push(currentPart);
      
      for (const part of parts) {
        await ctx.reply(part, { parse_mode: "Markdown" });
      }
    } else {
      await ctx.reply(response, { parse_mode: "Markdown" });
    }

  } catch (error) {
    console.error("Error in agent test command:", error);
    await ctx.reply("Произошла ошибка при тестировании агентной системы: " + 
      (error instanceof Error ? error.message : "Unknown error"));
  }
}
