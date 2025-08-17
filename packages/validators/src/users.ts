import { z } from "zod";

// Base schemas
const uuidSchema = z.string().uuid("Invalid UUID format");
const timestampSchema = z.date().or(z.string().datetime());

// User role enum
export const UserRole = z.enum([
  "user", // обычный пользователь
  "premium", // премиум пользователь
  "admin", // администратор
]);

// Language support
export const Language = z.enum(["en", "ru"]);

// Timezone validation
const timezoneSchema = z.string().refine(
  (tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid timezone" },
);

// User profile schema
export const userProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Zа-яА-Я\s\-'\.]+$/, "Name contains invalid characters"),
  avatar: z.string().url("Invalid avatar URL").optional(),
  bio: z.string().max(500, "Bio is too long").optional(),
  timezone: timezoneSchema.optional(),
  language: Language.default("en"),
  dateFormat: z
    .enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"])
    .default("DD/MM/YYYY"),
  timeFormat: z.enum(["12h", "24h"]).default("24h"),
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("RUB"),
});

// User preferences schema
export const userPreferencesSchema = z.object({
  // Notification preferences
  notifications: z
    .object({
      email: z.object({
        dailyReports: z.boolean().default(true),
        weeklyReports: z.boolean().default(true),
        monthlyReports: z.boolean().default(true),
        reminders: z.boolean().default(true),
        marketing: z.boolean().default(false),
      }),
      telegram: z.object({
        enabled: z.boolean().default(true),
        dailyReports: z.boolean().default(false),
        weeklyReports: z.boolean().default(true),
        reminders: z.boolean().default(true),
        instantAlerts: z.boolean().default(true),
      }),
      push: z.object({
        enabled: z.boolean().default(true),
        reminders: z.boolean().default(true),
        reports: z.boolean().default(false),
      }),
    })
    .default({}),

  // Privacy preferences
  privacy: z
    .object({
      profileVisibility: z.enum(["public", "private"]).default("private"),
      dataSharing: z.boolean().default(false),
      analyticsTracking: z.boolean().default(true),
    })
    .default({}),

  // App preferences
  app: z
    .object({
      theme: z.enum(["light", "dark", "auto"]).default("auto"),
      compactMode: z.boolean().default(false),
      showTutorials: z.boolean().default(true),
      autoSync: z.boolean().default(true),
      offlineMode: z.boolean().default(false),
    })
    .default({}),

  // Analytics preferences
  analytics: z
    .object({
      defaultPeriod: z
        .enum(["week", "month", "quarter", "year"])
        .default("month"),
      defaultCurrency: z.string().length(3).default("RUB"),
      showPredictions: z.boolean().default(true),
      showTrends: z.boolean().default(true),
    })
    .default({}),
});

// User settings update schema
export const updateUserProfileSchema = userProfileSchema.partial();
export const updateUserPreferencesSchema = userPreferencesSchema.partial();

// User objects management (cars, apartments, pets, etc.)
export const userObjectSchema = z.object({
  name: z
    .string()
    .min(1, "Object name is required")
    .max(100, "Name is too long"),
  type: z.enum([
    "car", // автомобиль
    "apartment", // квартира
    "house", // дом
    "pet", // питомец
    "device", // устройство
    "other", // прочее
  ]),
  description: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.any()).optional(), // дополнительные свойства
  isActive: z.boolean().default(true),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const createUserObjectSchema = userObjectSchema;
export const updateUserObjectSchema = userObjectSchema.partial().extend({
  id: uuidSchema,
});

// User subscription/billing schema
export const subscriptionSchema = z.object({
  plan: z.enum(["free", "premium", "pro"]),
  status: z.enum(["active", "canceled", "expired", "past_due"]),
  currentPeriodStart: timestampSchema,
  currentPeriodEnd: timestampSchema,
  cancelAtPeriodEnd: z.boolean().default(false),
  trialEnd: timestampSchema.optional(),
});

// User API keys management
export const apiKeySchema = z.object({
  name: z
    .string()
    .min(1, "API key name is required")
    .max(100, "Name is too long"),
  description: z.string().max(500).optional(),
  permissions: z
    .array(z.enum(["read", "write", "delete", "analytics", "export"]))
    .min(1, "At least one permission is required"),
  expiresAt: timestampSchema.optional(),
  ipWhitelist: z.array(z.string().ip()).optional(),
});

export const createApiKeySchema = apiKeySchema;
export const updateApiKeySchema = apiKeySchema.partial().extend({
  id: uuidSchema,
});

// User query/filter schema
export const userQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  role: UserRole.optional(),
  isActive: z.boolean().optional(),
  sortBy: z
    .enum(["createdAt", "name", "email", "lastLoginAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// User invitation schema
export const inviteUserSchema = z.object({
  email: z.string().email("Invalid email format").max(254, "Email is too long"),
  role: UserRole.default("user"),
  message: z.string().max(500).optional(),
  expiresIn: z.number().int().min(1).max(168).default(72), // hours
});

// User activity/audit log schema
export const userActivitySchema = z.object({
  action: z.enum([
    "login",
    "logout",
    "password_change",
    "profile_update",
    "event_create",
    "event_update",
    "event_delete",
    "export_data",
    "api_key_create",
    "api_key_delete",
  ]),
  details: z.record(z.string(), z.any()).optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
});

// User data export schema
export const exportUserDataSchema = z.object({
  format: z.enum(["json", "csv", "excel"]).default("json"),
  includeEvents: z.boolean().default(true),
  includeProfile: z.boolean().default(true),
  includeAnalytics: z.boolean().default(false),
  dateRange: z
    .object({
      startDate: timestampSchema.optional(),
      endDate: timestampSchema.optional(),
    })
    .optional(),
});

// User deletion/deactivation schema
export const deleteUserSchema = z.object({
  reason: z
    .enum([
      "no_longer_needed",
      "privacy_concerns",
      "switching_service",
      "too_expensive",
      "other",
    ])
    .optional(),
  feedback: z.string().max(1000).optional(),
  deleteAllData: z.boolean().default(true),
  downloadDataFirst: z.boolean().default(false),
});

// Type exports
export type UserRoleType = z.infer<typeof UserRole>;
export type LanguageType = z.infer<typeof Language>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UpdateUserPreferencesInput = z.infer<
  typeof updateUserPreferencesSchema
>;
export type UserObjectInput = z.infer<typeof userObjectSchema>;
export type CreateUserObjectInput = z.infer<typeof createUserObjectSchema>;
export type UpdateUserObjectInput = z.infer<typeof updateUserObjectSchema>;
export type SubscriptionData = z.infer<typeof subscriptionSchema>;
export type ApiKeyInput = z.infer<typeof apiKeySchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UserActivityInput = z.infer<typeof userActivitySchema>;
export type ExportUserDataInput = z.infer<typeof exportUserDataSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
