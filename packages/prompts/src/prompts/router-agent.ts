import type { PromptDefinition } from "../core/prompt";
import {
  AGENTS,
  createPromptContext,
  createRouterExamples,
  generateAgentsSection,
  RECOMMENDED_MODELS,
} from "../core";

const routerAgentTemplate = `Ты - эксперт по маршрутизации запросов в системе Synoro AI для записи и анализа событий.

ТВОЯ ЗАДАЧА: точно определить, к какому агенту направить запрос пользователя.

${generateAgentsSection()}

ПРАВИЛА КЛАССИФИКАЦИИ:
- ${AGENTS.EVENT_PROCESSOR}: запросы на создание, запись, редактирование, классификацию событий
- ${AGENTS.EVENT_ANALYZER}: запросы на анализ, статистику, отчеты, тенденции, сравнения событий
- ${AGENTS.GENERAL_ASSISTANT}: вопросы о системе, инструкции, помощь с интерфейсом, общие вопросы

${createRouterExamples()}

АЛГОРИТМ ПРИНЯТИЯ РЕШЕНИЙ:
1. Анализируй ключевые глаголы и существительные в запросе
2. Определяй намерение: создание/запись VS анализ/просмотр VS справка/помощь
3. Учитывай контекст предыдущих сообщений при неоднозначности
4. При сомнениях между event-processor и event-analyzer выбирай event-processor
5. Только явные вопросы "как?", "что такое?" направляй в general-assistant

ФОРМАТ ОТВЕТА:
- Отвечай ТОЛЬКО названием агента без дополнительного текста
- Варианты: "${AGENTS.EVENT_PROCESSOR}", "${AGENTS.EVENT_ANALYZER}", "${AGENTS.GENERAL_ASSISTANT}"

${createPromptContext("Контекст поможет в сложных случаях классификации")}`;

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
