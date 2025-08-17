import { z } from "zod";

import { EventCategory } from "./events";

// Base schemas
const timestampSchema = z.date().or(z.string().datetime());
const urlSchema = z.string().url("Invalid URL format");

// Telegram Bot Integration
export const telegramBotConfigSchema = z.object({
  botToken: z.string().min(1, "Bot token is required"),
  webhookUrl: urlSchema.optional(),
  allowedUsers: z.array(z.number().int()).optional(), // Telegram user IDs
  commands: z
    .object({
      start: z.boolean().default(true),
      help: z.boolean().default(true),
      add: z.boolean().default(true),
      list: z.boolean().default(true),
      stats: z.boolean().default(true),
      settings: z.boolean().default(true),
    })
    .default({}),
  features: z
    .object({
      voiceRecognition: z.boolean().default(true),
      photoOcr: z.boolean().default(true),
      locationTracking: z.boolean().default(false),
      inlineKeyboards: z.boolean().default(true),
      autoCategories: z.boolean().default(true),
    })
    .default({}),
});

// Telegram message processing
export const telegramMessageSchema = z.object({
  messageId: z.number().int(),
  userId: z.number().int(),
  chatId: z.number().int(),
  text: z.string().optional(),
  voice: z
    .object({
      fileId: z.string(),
      duration: z.number().int(),
      mimeType: z.string().optional(),
    })
    .optional(),
  photo: z
    .array(
      z.object({
        fileId: z.string(),
        width: z.number().int(),
        height: z.number().int(),
        fileSize: z.number().int().optional(),
      }),
    )
    .optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  document: z
    .object({
      fileId: z.string(),
      fileName: z.string().optional(),
      mimeType: z.string().optional(),
      fileSize: z.number().int().optional(),
    })
    .optional(),
  timestamp: timestampSchema.default(new Date()),
});

// Telegram response configuration
export const telegramResponseSchema = z.object({
  type: z.enum(["text", "markdown", "html", "keyboard", "photo", "document"]),
  content: z.string(),
  replyToMessageId: z.number().int().optional(),
  keyboard: z
    .object({
      type: z.enum(["inline", "reply"]),
      buttons: z.array(
        z.array(
          z.object({
            text: z.string(),
            callbackData: z.string().optional(),
            url: urlSchema.optional(),
          }),
        ),
      ),
      oneTime: z.boolean().default(false),
      resize: z.boolean().default(true),
    })
    .optional(),
  parseMode: z.enum(["Markdown", "HTML"]).optional(),
});

// OCR (Optical Character Recognition) Integration
export const ocrConfigSchema = z.object({
  provider: z.enum(["tesseract", "google", "aws", "azure", "yandex"]),
  apiKey: z.string().optional(),
  region: z.string().optional(),
  language: z.array(z.string()).default(["en", "ru"]),
  confidence: z.number().min(0).max(1).default(0.7),
  preprocessing: z
    .object({
      denoise: z.boolean().default(true),
      deskew: z.boolean().default(true),
      contrast: z.boolean().default(true),
      resize: z.boolean().default(false),
    })
    .default({}),
});

export const ocrRequestSchema = z
  .object({
    imageUrl: urlSchema.or(z.string().startsWith("data:image/")),
    imageBase64: z.string().optional(),
    fileBuffer: z.instanceof(Buffer).optional(),
    options: z
      .object({
        language: z.array(z.string()).optional(),
        confidence: z.number().min(0).max(1).optional(),
        detectRotation: z.boolean().default(true),
        extractTables: z.boolean().default(false),
      })
      .optional(),
  })
  .refine((data) => data.imageUrl || data.imageBase64 || data.fileBuffer, {
    message: "At least one image source must be provided",
  });

export const ocrResponseSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1),
  words: z
    .array(
      z.object({
        text: z.string(),
        confidence: z.number().min(0).max(1),
        boundingBox: z
          .object({
            x: z.number(),
            y: z.number(),
            width: z.number(),
            height: z.number(),
          })
          .optional(),
      }),
    )
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Receipt Processing
export const receiptProcessingSchema = z.object({
  ocrResult: ocrResponseSchema,
  parseRules: z.object({
    storeName: z
      .object({
        pattern: z.string(),
        required: z.boolean().default(false),
      })
      .optional(),
    total: z.object({
      pattern: z.string(),
      required: z.boolean().default(true),
    }),
    items: z
      .object({
        pattern: z.string(),
        extractPrices: z.boolean().default(true),
        extractQuantities: z.boolean().default(true),
      })
      .optional(),
    date: z
      .object({
        pattern: z.string(),
        format: z.string().default("DD.MM.YYYY"),
      })
      .optional(),
  }),
  defaultCategory: EventCategory.default("purchase"),
  currency: z.string().length(3).default("RUB"),
});

// Email Integration
export const emailIntegrationSchema = z.object({
  provider: z.enum(["gmail", "outlook", "yahoo", "custom"]),
  settings: z.object({
    host: z.string().optional(),
    port: z.number().int().optional(),
    secure: z.boolean().default(true),
    username: z.string(),
    password: z.string(),
    from: z.string().email(),
  }),
  filters: z
    .array(
      z.object({
        name: z.string(),
        enabled: z.boolean().default(true),
        conditions: z.object({
          from: z.array(z.string().email()).optional(),
          subject: z.array(z.string()).optional(),
          keywords: z.array(z.string()).optional(),
          attachments: z.boolean().optional(),
        }),
        actions: z.object({
          parseReceipt: z.boolean().default(false),
          createEvent: z.boolean().default(false),
          category: EventCategory.optional(),
          tags: z.array(z.string()).optional(),
        }),
      }),
    )
    .default([]),
  notifications: z
    .object({
      sendReports: z.boolean().default(true),
      reportFrequency: z.enum(["daily", "weekly", "monthly"]).default("weekly"),
      sendAlerts: z.boolean().default(true),
    })
    .default({}),
});

// Banking/Financial API Integration
export const bankingIntegrationSchema = z.object({
  provider: z.enum(["sberbank", "tinkoff", "alfa", "vtb", "open_banking"]),
  credentials: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    apiKey: z.string().optional(),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
  }),
  accounts: z
    .array(
      z.object({
        accountId: z.string(),
        accountNumber: z.string().optional(),
        accountType: z.enum(["checking", "savings", "credit", "debit"]),
        currency: z.string().length(3),
        enabled: z.boolean().default(true),
      }),
    )
    .default([]),
  sync: z
    .object({
      enabled: z.boolean().default(true),
      frequency: z.enum(["realtime", "hourly", "daily"]).default("daily"),
      lookbackDays: z.number().int().min(1).max(90).default(7),
      autoCategories: z.boolean().default(true),
      skipDuplicates: z.boolean().default(true),
    })
    .default({}),
});

// Government APIs (Russian FNS for receipt verification)
export const fnsIntegrationSchema = z.object({
  apiUrl: urlSchema.default("https://proverkacheka.com/api/v1/"),
  credentials: z.object({
    login: z.string(),
    password: z.string(),
    token: z.string().optional(),
  }),
  settings: z
    .object({
      autoVerify: z.boolean().default(true),
      saveToDatabase: z.boolean().default(true),
      requireVerification: z.boolean().default(false),
      timeoutMs: z.number().int().min(1000).max(30000).default(10000),
    })
    .default({}),
});

// Webhook Integration
export const webhookConfigSchema = z.object({
  name: z.string().min(1, "Webhook name is required").max(100),
  url: urlSchema,
  method: z.enum(["GET", "POST", "PUT", "PATCH"]).default("POST"),
  headers: z.record(z.string(), z.string()).default({}),
  events: z
    .array(
      z.enum([
        "event.created",
        "event.updated",
        "event.deleted",
        "user.registered",
        "report.generated",
        "budget.exceeded",
        "prediction.triggered",
      ]),
    )
    .min(1, "At least one event type is required"),
  filters: z
    .object({
      categories: z.array(EventCategory).optional(),
      minAmount: z.number().positive().optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),
  authentication: z
    .object({
      type: z.enum(["none", "basic", "bearer", "api_key"]).default("none"),
      username: z.string().optional(),
      password: z.string().optional(),
      token: z.string().optional(),
      apiKey: z.string().optional(),
      apiKeyHeader: z.string().default("X-API-Key"),
    })
    .optional(),
  retries: z
    .object({
      enabled: z.boolean().default(true),
      maxAttempts: z.number().int().min(1).max(10).default(3),
      backoffMs: z.number().int().min(100).max(60000).default(1000),
    })
    .default({}),
  isActive: z.boolean().default(true),
});

// API Rate Limiting
export const rateLimitConfigSchema = z.object({
  provider: z.string(),
  limits: z.object({
    requestsPerMinute: z.number().int().min(1).default(60),
    requestsPerHour: z.number().int().min(1).default(1000),
    requestsPerDay: z.number().int().min(1).default(10000),
    concurrentRequests: z.number().int().min(1).default(5),
  }),
  retryPolicy: z
    .object({
      enabled: z.boolean().default(true),
      maxRetries: z.number().int().min(0).max(10).default(3),
      backoffStrategy: z
        .enum(["fixed", "exponential", "linear"])
        .default("exponential"),
      initialDelayMs: z.number().int().min(100).max(10000).default(1000),
    })
    .default({}),
});

// Third-party Calendar Integration
export const calendarIntegrationSchema = z.object({
  provider: z.enum(["google", "outlook", "apple", "caldav"]),
  credentials: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
  }),
  calendars: z
    .array(
      z.object({
        calendarId: z.string(),
        name: z.string(),
        enabled: z.boolean().default(true),
        syncDirection: z
          .enum(["import", "export", "bidirectional"])
          .default("import"),
      }),
    )
    .default([]),
  sync: z
    .object({
      enabled: z.boolean().default(false),
      frequency: z.enum(["realtime", "hourly", "daily"]).default("daily"),
      eventMapping: z.object({
        titleField: z.string().default("title"),
        descriptionField: z.string().default("description"),
        categoryMapping: z.record(z.string(), EventCategory).default({}),
      }),
    })
    .default({}),
});

// Integration testing schema
export const integrationTestSchema = z.object({
  integrationType: z.enum([
    "telegram",
    "ocr",
    "email",
    "banking",
    "fns",
    "webhook",
    "calendar",
    "voice_recognition",
  ]),
  testType: z.enum(["connection", "authentication", "functionality", "full"]),
  parameters: z.record(z.string(), z.any()).optional(),
  mockData: z.boolean().default(false),
  timeout: z.number().int().min(1000).max(60000).default(30000),
});

// Integration status monitoring
export const integrationStatusSchema = z.object({
  name: z.string(),
  type: z.string(),
  status: z.enum(["active", "inactive", "error", "maintenance"]),
  lastCheck: timestampSchema,
  nextCheck: timestampSchema.optional(),
  errorCount: z.number().int().min(0).default(0),
  lastError: z.string().optional(),
  metrics: z
    .object({
      requestCount: z.number().int().min(0).default(0),
      successRate: z.number().min(0).max(1).default(1),
      averageResponseTime: z.number().min(0).default(0),
      lastResponseTime: z.number().min(0).optional(),
    })
    .optional(),
});

// Type exports
export type TelegramBotConfigInput = z.infer<typeof telegramBotConfigSchema>;
export type TelegramMessageInput = z.infer<typeof telegramMessageSchema>;
export type TelegramResponseInput = z.infer<typeof telegramResponseSchema>;
export type OcrConfigInput = z.infer<typeof ocrConfigSchema>;
export type OcrRequestInput = z.infer<typeof ocrRequestSchema>;
export type OcrResponseData = z.infer<typeof ocrResponseSchema>;
export type ReceiptProcessingInput = z.infer<typeof receiptProcessingSchema>;
export type EmailIntegrationInput = z.infer<typeof emailIntegrationSchema>;
export type BankingIntegrationInput = z.infer<typeof bankingIntegrationSchema>;
export type FnsIntegrationInput = z.infer<typeof fnsIntegrationSchema>;
export type WebhookConfigInput = z.infer<typeof webhookConfigSchema>;
export type RateLimitConfigInput = z.infer<typeof rateLimitConfigSchema>;
export type CalendarIntegrationInput = z.infer<
  typeof calendarIntegrationSchema
>;
export type IntegrationTestInput = z.infer<typeof integrationTestSchema>;
export type IntegrationStatusData = z.infer<typeof integrationStatusSchema>;
