# Synoro API

Универсальный API для обработки сообщений, поддерживающий все типы клиентов: Telegram, Web и Mobile.

## 🏗️ Архитектура

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

## 🚀 Основные возможности

- **Универсальность**: Один API для всех типов клиентов
- **AI-первый подход**: Релевантность и классификация определяются OpenAI
- **Модульность**: Каждый сервис независим и переиспользуем
- **Масштабируемость**: Легко добавлять новые клиенты

## 📁 Структура проекта

```
src/
├── lib/
│   ├── ai/                    # AI сервисы
│   │   ├── classifier.ts      # Классификация сообщений
│   │   ├── transcriber.ts     # Транскрипция аудио
│   │   ├── advisor.ts         # Советы и ответы
│   │   ├── parser.ts          # Парсинг задач
│   │   └── types.ts           # Общие типы
│   ├── message-processor/     # Обработка сообщений
│   │   ├── processor.ts       # Универсальный процессор
│   │   └── types.ts           # Типы процессора
│   └── ...                    # Другие утилиты
├── router/
│   ├── messages/              # API для сообщений
│   │   ├── process-message.ts # Обработка текста
│   │   └── transcribe.ts      # Транскрипция
│   └── ...                    # Другие роутеры
└── root.ts                    # Главный роутер
```

## 🔧 Установка и настройка

### 1. Установка зависимостей

```bash
bun install
```

### 2. Переменные окружения

Создайте `.env` файл:

```bash
# AI Providers
AI_PROVIDER=openai  # или "moonshot"
OPENAI_API_KEY=your_openai_key
MOONSHOT_API_KEY=your_moonshot_key

# AI Models
OPENAI_TRANSCRIBE_MODEL=whisper-1
OPENAI_ADVICE_MODEL=gpt-4o-mini
MOONSHOT_TRANSCRIBE_MODEL=moonshot-v1
MOONSHOT_ADVICE_MODEL=kimi-k2-0711-preview

# Langfuse (опционально)
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_BASEURL=https://cloud.langfuse.com
```

### 3. Проверка типов

```bash
bun run typecheck
```

## 📡 API Endpoints

### Обработка сообщений

**POST** `/api/trpc/messages.processMessage`

Обрабатывает текстовые сообщения от любого клиента.

```typescript
// Input
{
  text: string;                    // Текст сообщения
  channel: "telegram" | "web" | "mobile";
  userId: string;                  // ID пользователя
  chatId?: string;                 // ID чата (опционально)
  messageId?: string;              // ID сообщения (опционально)
  metadata?: Record<string, unknown>; // Дополнительные данные
}

// Output
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

### Транскрипция аудио

**POST** `/api/trpc/messages.transcribe`

Транскрибирует аудио файлы.

```typescript
// Input
{
  audio: Buffer;                   // Аудио файл
  filename: string;                // Имя файла
  channel: "telegram" | "web" | "mobile";
  userId: string;
  chatId?: string;
  messageId?: string;
  metadata?: Record<string, unknown>;
}

// Output
{
  success: boolean;
  text: string;                    // Транскрибированный текст
  filename: string;
}
```

## 💡 Примеры использования

### Telegram Bot

```typescript
const result = await fetch(`${API_BASE_URL}/api/trpc/messages.processMessage`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_TOKEN}`,
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
});

const response = await result.json();
await ctx.reply(response.result.data.response);
```

### Web Client

```typescript
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

## 🔄 Миграция с TG бота

1. **Обновите TG бот** для использования нового API
2. **Удалите дублирующуюся логику** из TG бота
3. **Настройте переменные окружения**
4. **Протестируйте работу** через API

Подробности в [UNIVERSAL_API_SETUP.md](./UNIVERSAL_API_SETUP.md)

## 🧪 Тестирование

```bash
# Проверка типов
bun run typecheck

# Запуск тестов (если настроены)
bun run test
```

## 📊 Мониторинг

API предоставляет детальную информацию о каждом сообщении:

- Тип сообщения и уверенность классификации
- Релевантность и категория
- Парсинг задач
- Метаданные канала и пользователя

## 🤝 Разработка

### Добавление нового AI сервиса

1. Создайте файл в `src/lib/ai/`
2. Экспортируйте функцию из `src/lib/ai/index.ts`
3. Добавьте типы в `src/lib/ai/types.ts`

### Добавление нового клиента

1. Создайте роутер в `src/router/`
2. Добавьте в главный роутер `src/root.ts`
3. Обновите документацию

## 📚 Документация

- [UNIVERSAL_API_SETUP.md](./UNIVERSAL_API_SETUP.md) - Подробная настройка
- [API Reference](./docs/) - Справочник API
- [Examples](./examples/) - Примеры использования

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте логи API
2. Убедитесь, что все переменные окружения настроены
3. Проверьте типы через `bun run typecheck`
4. Обратитесь к документации
