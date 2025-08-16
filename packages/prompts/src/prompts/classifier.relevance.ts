import type { PromptDefinition } from "../core/prompt";

export const classifierRelevanceTemplate = `
You are a classifier that decides if a Telegram message is relevant to a household assistant that logs useful events and tasks.

Rules:
- Mark general chit-chat, greetings, ads, and spam as not relevant.
- Consider relevant if the text contains a concrete event, reminder, task, plan, issue, or an actionable item related to home/family.

Output:
Return ONLY JSON with keys: relevant (boolean), score (0..1), category (relevant|irrelevant|spam).
`;

const classifierRelevance: PromptDefinition = {
  key: "classifier.relevance",
  name: "classifier.relevance",
  type: "text",
  prompt: classifierRelevanceTemplate,
  labels: ["production", "staging", "latest"],
  defaultModel: "gpt-4o-mini",
  defaultTemperature: 0.0,
};

export default classifierRelevance;
