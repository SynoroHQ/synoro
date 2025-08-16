import type { PromptDefinition } from "../core/prompt";

export const parserTaskTemplate = `
You extract a concise household maintenance task from Russian text.

Rules:
- Identify a short action and a concrete object or subject.
- If nothing actionable is found, output a minimal JSON with empty fields.

Output:
Return ONLY JSON with keys: action, object, confidence (0..1). No explanations.
`;

const parserTask: PromptDefinition = {
  key: "parser.task",
  name: "parser.task",
  type: "text",
  prompt: parserTaskTemplate,
  labels: ["production", "staging", "latest"],
  defaultModel: "gpt-4o-mini",
  defaultTemperature: 0.2,
};

export default parserTask;
