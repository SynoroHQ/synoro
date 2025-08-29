import { generateObject } from "ai";
import { z } from "zod";
import { AbstractAgent } from "./base-agent";
import type { AgentCapability, AgentResult, AgentTask } from "./types";
import { ReminderService } from "../services/reminder-service";
import type {
  CreateReminderFromTextRequest,
  CreateReminderFromTextResponse,
  ReminderType,
  ReminderPriority,
  AIContext,
  SmartSuggestion,
  NewReminder,
} from "@synoro/db";

// Схема для извлечения информации о напоминании из текста
const reminderExtractionSchema = z.object({
  title: z.string().describe("Краткое название напоминания"),
  description: z.string().optional().describe("Подробное описание"),
  type: z.enum(["task", "event", "deadline", "meeting", "call", "follow_up", "custom"])
    .describe("Тип напоминания"),
  priority: z.enum(["low", "medium", "high", "urgent"])
    .describe("Приоритет напоминания"),
  reminderTime: z.string().describe("Время напоминания в ISO формате"),
  tags: z.array(z.string()).optional().describe("Теги для категоризации"),
  recurrence: z.enum(["none", "daily", "weekly", "monthly", "yearly", "custom"])
    .default("none").describe("Частота повторения"),
  confidence: z.number().min(0).max(1).describe("Уверенность в извлечении"),
  needsConfirmation: z.boolean().describe("Требует ли подтверждения от пользователя"),
  extractedEntities: z.object({
    datetime: z.string().optional().describe("Извлеченная дата/время"),
    location: z.string().optional().describe("Извлеченное место"),
    people: z.array(z.string()).optional().describe("Упомянутые люди"),
    keywords: z.array(z.string()).optional().describe("Ключевые слова"),
  }).optional(),
});

// Схема для умных предложений
const smartSuggestionsSchema = z.object({
  suggestions: z.array(z.object({
    type: z.enum(["reschedule", "priority_change", "related_task", "context_update"]),
    suggestion: z.string(),
    confidence: z.number().min(0).max(1),
    metadata: z.record(z.any()).optional(),
  })),
});

// Схема для анализа контекста напоминания
const contextAnalysisSchema = z.object({
  isReminderRelated: z.boolean().describe("Связан ли текст с напоминаниями"),
  confidence: z.number().min(0).max(1).describe("Уверенность в анализе"),
  reasoning: z.string().describe("Объяснение решения"),
  suggestedAction: z.enum(["create", "update", "delete", "list", "none"])
    .describe("Предлагаемое действие"),
});

export class SmartReminderAgent extends AbstractAgent {
  name = "Smart Reminder Agent";
  description = "ИИ-агент для создания и управления умными напоминаниями на основе естественного языка";
  
  capabilities: AgentCapability[] = [
    {
      name: "create_reminder_from_text",
      description: "Создание напоминания из текста на естественном языке",
      category: "reminder",
      confidence: 0.9,
    },
    {
      name: "analyze_reminder_context",
      description: "Анализ контекста для определения связи с напоминаниями",
      category: "reminder",
      confidence: 0.85,
    },
    {
      name: "generate_smart_suggestions",
      description: "Генерация умных предложений для напоминаний",
      category: "reminder",
      confidence: 0.8,
    },
    {
      name: "extract_temporal_info",
      description: "Извлечение временной информации из текста",
      category: "temporal",
      confidence: 0.9,
    },
  ];

  private reminderService: ReminderService;

  constructor() {
    super("gpt-4o-mini", 0.2);
    this.reminderService = new ReminderService();
  }

  async canHandle(task: AgentTask): Promise<boolean> {
    // Проверяем, связана ли задача с напоминаниями
    if (task.type === "reminder" || task.type === "create_reminder") {
      return true;
    }

    // Анализируем текст на предмет связи с напоминаниями
    try {
      const analysis = await this.analyzeReminderContext(task.input);
      return analysis.isReminderRelated && analysis.confidence > 0.7;
    } catch (error) {
      console.warn("Ошибка анализа контекста напоминания:", error);
      return false;
    }
  }

  async process(task: AgentTask): Promise<AgentResult<CreateReminderFromTextResponse>> {
    try {
      const _telemetry = this.createTelemetry("process-reminder", task);

      // Анализируем контекст
      const contextAnalysis = await this.analyzeReminderContext(task.input);
      
      if (!contextAnalysis.isReminderRelated) {
        return this.createErrorResult(
          "Текст не связан с созданием напоминаний",
          contextAnalysis.confidence
        );
      }

      // Извлекаем информацию о напоминании
      const extractedInfo = await this.extractReminderInfo(task.input, task.context);
      
      if (extractedInfo.confidence < 0.5) {
        return this.createErrorResult(
          "Недостаточно информации для создания напоминания",
          extractedInfo.confidence
        );
      }

      // Создаем напоминание
      const userId = task.context?.userId as string;
      if (!userId) {
        return this.createErrorResult("Не указан пользователь");
      }

      const reminderData: NewReminder = {
        userId,
        title: extractedInfo.title,
        description: extractedInfo.description,
        type: extractedInfo.type,
        priority: extractedInfo.priority,
        reminderTime: new Date(extractedInfo.reminderTime),
        recurrence: extractedInfo.recurrence,
        aiGenerated: true,
        aiContext: JSON.stringify({
          originalMessage: task.input,
          extractedEntities: extractedInfo.extractedEntities,
          confidence: extractedInfo.confidence,
          suggestedType: extractedInfo.type,
          suggestedPriority: extractedInfo.priority,
        } as AIContext),
        tags: extractedInfo.tags ? JSON.stringify(extractedInfo.tags) : null,
        chatId: task.context?.chatId as string | undefined,
      };

      const reminder = await this.reminderService.createReminder(reminderData);

      // Генерируем умные предложения
      const suggestions = await this.generateSmartSuggestions(reminder, task.input);

      const response: CreateReminderFromTextResponse = {
        reminder,
        confidence: extractedInfo.confidence,
        suggestions,
        needsConfirmation: extractedInfo.needsConfirmation,
      };

      return this.createSuccessResult(
        response,
        extractedInfo.confidence,
        `Создано напоминание "${reminder.title}" на ${reminder.reminderTime.toLocaleString("ru-RU")}`
      );

    } catch (error) {
      console.error("Ошибка обработки напоминания:", error);
      return this.createErrorResult(
        `Ошибка создания напоминания: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`
      );
    }
  }

  /**
   * Анализ контекста на предмет связи с напоминаниями
   */
  private async analyzeReminderContext(text: string): Promise<{
    isReminderRelated: boolean;
    confidence: number;
    reasoning: string;
    suggestedAction: "create" | "update" | "delete" | "list" | "none";
  }> {
    const cacheKey = `context-${this.createInputHash(text)}`;
    const cached = this.getCachedResult<{
      isReminderRelated: boolean;
      confidence: number;
      reasoning: string;
      suggestedAction: "create" | "update" | "delete" | "list" | "none";
    }>(cacheKey);
    if (cached) return cached;

    try {
      const { object } = await generateObject({
        model: this.getModel(),
        schema: contextAnalysisSchema,
        system: `Ты - эксперт по анализу текста на предмет создания напоминаний.

Определи, связан ли текст с напоминаниями, задачами, событиями или планами.

Ключевые индикаторы напоминаний:
- Временные выражения (завтра, через час, в 15:00, в понедельник)
- Глаголы действия (напомни, сделать, встретиться, позвонить)
- Планы и задачи (встреча, дедлайн, событие, задача)
- Императивные конструкции (нужно, должен, необходимо)

Примеры:
✅ "Напомни мне завтра позвонить маме"
✅ "Встреча с клиентом в 14:00"  
✅ "Нужно сдать отчет до пятницы"
❌ "Как дела?"
❌ "Какая погода сегодня?"`,
        prompt: `Анализируемый текст: "${text}"`,
        temperature: 0.1,
      });

      this.setCachedResult(cacheKey, object);
      return object;
    } catch (error) {
      console.warn("Ошибка анализа контекста:", error);
      return {
        isReminderRelated: false,
        confidence: 0,
        reasoning: "Ошибка анализа",
        suggestedAction: "none",
      };
    }
  }

  /**
   * Извлечение информации о напоминании из текста
   */
  private async extractReminderInfo(text: string, context?: Record<string, unknown>): Promise<{
    title: string;
    description?: string;
    type: ReminderType;
    priority: ReminderPriority;
    reminderTime: string;
    tags?: string[];
    recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
    confidence: number;
    needsConfirmation: boolean;
    extractedEntities?: {
      datetime?: string;
      location?: string;
      people?: string[];
      keywords?: string[];
    };
  }> {
    const timezone = (context?.timezone as string) ?? "Europe/Moscow";
    const currentTime = new Date().toISOString();

    try {
      const { object } = await generateObject({
        model: this.getModel(),
        schema: reminderExtractionSchema,
        system: `Ты - эксперт по извлечению информации о напоминаниях из текста.

ЗАДАЧА: Извлеки из текста всю информацию для создания напоминания.

ПРАВИЛА ОБРАБОТКИ ВРЕМЕНИ:
- Текущее время: ${currentTime}
- Часовой пояс: ${timezone}
- "завтра" = следующий день в 09:00
- "сегодня" = сегодня в 18:00 (если время не указано)
- "через час" = текущее время + 1 час
- "в понедельник" = ближайший понедельник в 09:00
- Всегда возвращай время в ISO формате с часовым поясом

ТИПЫ НАПОМИНАНИЙ:
- task: обычные задачи и дела
- event: события и мероприятия
- deadline: дедлайны и сроки
- meeting: встречи и собрания
- call: звонки
- follow_up: напоминания о последующих действиях

ПРИОРИТЕТЫ:
- urgent: срочные дела (дедлайны, важные встречи)
- high: важные задачи
- medium: обычные дела (по умолчанию)
- low: несрочные задачи

ПРИМЕРЫ:
"Напомни позвонить маме завтра" → title: "Позвонить маме", type: "call", priority: "medium"
"Встреча с клиентом в 14:00" → title: "Встреча с клиентом", type: "meeting", priority: "high"
"Сдать отчет до пятницы" → title: "Сдать отчет", type: "deadline", priority: "high"`,
        prompt: `Текст: "${text}"
Контекст: ${JSON.stringify(context || {})}`,
        temperature: 0.1,
      });

      return object;
    } catch (error) {
      console.error("Ошибка извлечения информации:", error);
      throw new Error("Не удалось извлечь информацию о напоминании");
    }
  }

  /**
   * Генерация умных предложений для напоминания
   */
  private async generateSmartSuggestions(
    reminder: Record<string, unknown>,
    originalText: string
  ): Promise<SmartSuggestion[]> {
    try {
      const { object } = await generateObject({
        model: this.getModel(),
        schema: smartSuggestionsSchema,
        system: `Ты - эксперт по созданию умных предложений для напоминаний.

Проанализируй созданное напоминание и предложи улучшения:

ТИПЫ ПРЕДЛОЖЕНИЙ:
- reschedule: предложения по изменению времени
- priority_change: предложения по изменению приоритета  
- related_task: связанные задачи
- context_update: дополнительная информация

Учитывай:
- Время дня и рабочие часы
- Тип задачи и её контекст
- Возможные связанные действия
- Оптимальное планирование`,
        prompt: `Напоминание: ${JSON.stringify(reminder)}
Исходный текст: "${originalText}"`,
        temperature: 0.3,
      });

      return object.suggestions;
    } catch (error) {
      console.warn("Ошибка генерации предложений:", error);
      return [];
    }
  }

  /**
   * Создание напоминания из текстового запроса (публичный метод)
   */
  async createReminderFromText(
    request: CreateReminderFromTextRequest
  ): Promise<CreateReminderFromTextResponse> {
    const task: AgentTask = {
      id: `reminder-${Date.now()}`,
      type: "create_reminder",
      input: request.text,
      priority: "medium",
      createdAt: new Date(),
      context: {
        userId: request.userId,
        chatId: request.chatId,
        timezone: request.timezone,
        ...request.context,
      },
    };

    const result = await this.process(task);
    
    if (!result.success || !result.data) {
      throw new Error(result.error || "Не удалось создать напоминание");
    }

    return result.data;
  }
}
