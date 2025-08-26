# Универсальный API для обработки сообщений

Этот документ описывает новую архитектуру API, которая поддерживает все типы клиентов: Telegram, Web и Mobile.

## Новая архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram Bot  │    │   Web Client    │    │  Mobile Client  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Universal API                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Messages API  │  │   AI Services   │  │   Events API    │ │
│  │                 │  │                 │  │                 │ │
│  │ • processText   │  │ • classify      │  │ • logEvent      │ │
│  │ • processAudio  │  │ • transcribe    │  │ • getEvents     │ │
│  │ • getResponse   │  │ • advise        │  │ • analytics     │ │
│  └─────────────────┘  │ • parseTask     │  └─────────────────┘ │
│                       └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

## Основные принципы

1. **Разделение ответственности**: API отвечает только за общую логику, клиенты - за специфичную
2. **Универсальность**: Один API для всех типов клиентов
3. **AI-первый подход**: Релевантность и классификация определяются OpenAI
4. **Модульность**: Каждый сервис независим и переиспользуем

## Компоненты API

### 1. AI Services (`/lib/ai/`)

- **classifier.ts** - Классификация сообщений и релевантности
- **transcriber.ts** - Транскрипция аудио
- **advisor.ts** - Советы и ответы на вопросы
- **parser.ts** - Парсинг задач из текста
- **types.ts** - Общие типы для AI сервисов

### 2. Message Processor (`/lib/message-processor/`)

- **processor.ts** - Универсальная логика обработки сообщений
- **types.ts** - Типы для процессора сообщений

### 3. API Routes (`/router/messages/`)

- **process-message.ts** - Обработка текстовых сообщений
- **transcribe.ts** - Транскрипция аудио

## API Endpoints

### POST `/api/trpc/messages.processMessage`

Обрабатывает текстовые сообщения от любого клиента.

**Input:**

```typescript
{
  text: string;                    // Текст сообщения
  channel: "telegram" | "web" | "mobile";  // Канал
  userId: string;                  // ID пользователя
  chatId?: string;                 // ID чата (опционально)
  messageId?: string;              // ID сообщения (опционально)
  metadata?: Record<string, unknown>; // Дополнительные данные
}
```

**Output:**

```typescript
{
  success: boolean;
  response: string;                // Ответ бота
  messageType: {                   // Тип сообщения
    type: string;
    subtype: string | null;
    confidence: number;
    need_logging: boolean;
  };
  relevance: {                     // Релевантность
    relevant: boolean;
    score?: number;
    category?: string;
  };
  parsed: {                        // Парсинг задачи
    action: string;
    object: string;
    confidence?: number;
  } | null;
}
```

### POST `/api/trpc/messages.transcribe`

Транскрибирует аудио файлы.

**Input:**

```typescript
{
  audio: Buffer;                   // Аудио файл
  filename: string;                // Имя файла
  channel: "telegram" | "web" | "mobile";
  userId: string;
  chatId?: string;
  messageId?: string;
  metadata?: Record<string, unknown>;
}
```

**Output:**

```typescript
{
  success: boolean;
  text: string; // Транскрибированный текст
  filename: string;
}
```

## Переменные окружения

```bash
# AI Providers
AI_PROVIDER=openai  # или "moonshot"
OPENAI_API_KEY=your_openai_key
MOONSHOT_API_KEY=your_moonshot_key

# AI Models
OPENAI_TRANSCRIBE_MODEL=whisper-1
OPENAI_ADVICE_MODEL=gpt-5-nano
MOONSHOT_TRANSCRIBE_MODEL=moonshot-v1
MOONSHOT_ADVICE_MODEL=kimi-k2-0711-preview

# Langfuse (опционально)
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_BASEURL=https://cloud.langfuse.com
```

## Использование в клиентах

### Telegram Bot

```typescript
// Обработка текстового сообщения
const result = await fetch(
  `${API_BASE_URL}/api/trpc/messages.processMessageFromTelegram`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TELEGRAM_BOT_TOKEN}`,
    },
    body: JSON.stringify({
      json: {
        text: "Купил хлеб за 50 рублей",
        channel: "telegram",
        userId: "12345",
        chatId: "67890",
        messageId: "111",
        metadata: {
          user: "username",
          chatType: "private",
        },
      },
    }),
  },
);

const response = await result.json();
await ctx.reply(response.result.data.response);
```

### Web Client

```typescript
// Обработка сообщения от веб-интерфейса
const result = await api.messages.processMessage.mutate({
  text: "Запланировал встречу на завтра",
  channel: "web",
  userId: "user123",
  chatId: "chat456",
  metadata: {
    browser: "Chrome",
    platform: "Windows",
  },
});

console.log(result.response); // Ответ бота
```

### Mobile Client

```typescript
// Обработка голосового сообщения
const audioBuffer = await recordAudio();
const result = await api.messages.transcribe.mutate({
  audio: audioBuffer,
  filename: "voice_message.m4a",
  channel: "mobile",
  userId: "user123",
  metadata: {
    device: "iPhone",
    os: "iOS 17",
  },
});

// Теперь обрабатываем транскрибированный текст
const processResult = await api.messages.processMessage.mutate({
  text: result.text,
  channel: "mobile",
  userId: "user123",
  metadata: {
    device: "iPhone",
    os: "iOS 17",
    transcribedFrom: "audio",
  },
});

console.log(processResult.response); // Ответ бота
```

## Преимущества новой архитектуры

1. **Единый источник истины**: Вся логика обработки сообщений в одном месте
2. **Переиспользование**: Один API для всех клиентов
3. **Масштабируемость**: Легко добавлять новые клиенты
4. **Консистентность**: Одинаковое поведение во всех каналах
5. **AI-первый**: Релевантность определяется OpenAI, а не простыми правилами
6. **Модульность**: Каждый сервис можно развивать независимо

## Миграция

### С TG бота

1. Обновите TG бот для использования нового API
2. Удалите дублирующуюся логику из TG бота
3. Настройте переменные окружения
4. Протестируйте работу через API

### С веб-клиента

1. Замените прямые вызовы AI сервисов на API вызовы
2. Обновите типы данных
3. Добавьте обработку ошибок API

## Мониторинг и аналитика

API предоставляет детальную информацию о каждом сообщении:

- Тип сообщения и уверенность классификации
- Релевантность и категория
- Парсинг задач
- Метаданные канала и пользователя

Это позволяет анализировать качество работы AI моделей и поведение пользователей в разных каналах.
