import { z } from "zod";

/**
 * Схема для основного события
 */
export const eventSchema = z.object({
  type: z.enum([
    "purchase",
    "task",
    "meeting",
    "note",
    "expense",
    "income",
    "maintenance",
    "other",
  ]),
  description: z.string(),
  amount: z.number().nullable().optional(),
  currency: z.enum(["RUB", "USD", "EUR"]).nullable().optional(),
  date: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Уверенность в парсинге события"),
  needsAdvice: z.boolean(),
  reasoning: z.string(),
});

/**
 * Схема для анализа типа события
 */
export const eventAnalysisSchema = z.object({
  isEvent: z.boolean(),
  eventType: z.enum([
    "purchase",
    "task",
    "meeting",
    "note",
    "expense",
    "income",
    "maintenance",
    "other",
    "none",
  ]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

/**
 * Схема для категоризации события
 */
export const categorizationSchema = z.object({
  category: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

/**
 * Схема для извлечения финансовой информации
 */
export const financialSchema = z
  .object({
    amount: z.coerce.number().nullable(),
    currency: z
      .string()
      .transform((s) => s.trim().toUpperCase())
      .pipe(z.enum(["RUB", "USD", "EUR"]))
      .nullable(),
    confidence: z.number().min(0).max(1),
  })
  .strict()
  .refine(
    (data) =>
      (data.amount === null && data.currency === null) ||
      (data.amount !== null && data.currency !== null),
    {
      message:
        "amount and currency must either both be null or both be provided",
      path: ["currency"],
    },
  );

/**
 * Типы на основе схем
 */
export type EventData = z.infer<typeof eventSchema>;
export type EventAnalysis = z.infer<typeof eventAnalysisSchema>;
export type EventCategorization = z.infer<typeof categorizationSchema>;
export type FinancialData = z.infer<typeof financialSchema>;
