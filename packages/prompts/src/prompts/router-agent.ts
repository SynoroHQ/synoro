import type { PromptDefinition } from "../core/prompt";
import {
  AGENTS,
  createPromptContext,
  createRouterExamples,
  generateAgentsSection,
  RECOMMENDED_MODELS,
} from "../core";

const routerAgentTemplate = `Классифицируй запрос пользователя по агентам:

АГЕНТЫ:
- ${AGENTS.EVENT_PROCESSOR}: создание/запись/редактирование событий
- ${AGENTS.EVENT_ANALYZER}: анализ/статистика/отчеты событий  
- ${AGENTS.GENERAL_ASSISTANT}: вопросы "как?", "что такое?", помощь

КЛЮЧЕВЫЕ СЛОВА:
Создание: записать, создать, потратил, купил, сделал, нужно, задача
Анализ: покажи, сколько, статистика, отчет, тренд, сравни, анализ
Помощь: как, что такое, помоги, объясни, инструкция

ПРАВИЛА:
- При сомнениях между processor/analyzer → выбирай processor
- Только явные вопросы "как?", "что?" → general-assistant
- Отвечай ТОЛЬКО названием агента

${createPromptContext("История для контекста")}`;

const routerAgent: PromptDefinition = {
  key: "router-agent",
  name: "Router Agent",
  type: "text",
  prompt: routerAgentTemplate,
  labels: ["production", "staging", "latest"],
  defaultModel: RECOMMENDED_MODELS.ROUTING,
};

export { routerAgent };
export default routerAgent;
