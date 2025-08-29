#!/usr/bin/env bun

/**
 * 🧪 Демонстрация передачи контекста разговора в трейсинг
 * 
 * Этот скрипт показывает, как теперь контекст разговора
 * передается в телеметрию для трейсинга
 */

console.log("🚀 Демонстрация передачи контекста разговора в трейсинг\n");

// 1. Контекст беседы из базы данных
console.log("1️⃣ Контекст беседы из базы данных:");
const conversationContext = {
  conversationId: "conv_" + Date.now(),
  totalMessages: 25,
  messages: [
    {
      id: "msg-1",
      role: "user" as const,
      content: { text: "Привет! Как дела?" },
      createdAt: new Date(Date.now() - 120000),
    },
    {
      id: "msg-2",
      role: "assistant" as const,
      content: { text: "Привет! У меня все отлично, спасибо! 😊 Как дела у тебя?" },
      createdAt: new Date(Date.now() - 90000),
    },
    {
      id: "msg-3",
      role: "user" as const,
      content: { text: "Хорошо! Можешь помочь с планированием задач?" },
      createdAt: new Date(Date.now() - 60000),
    },
    {
      id: "msg-4",
      role: "assistant" as const,
      content: { text: "Конечно! Я помогу вам спланировать задачи. Что именно нужно сделать?" },
      createdAt: new Date(Date.now() - 30000),
    },
    {
      id: "msg-5",
      role: "user" as const,
      content: { text: "Нужно подготовить презентацию к завтрашней встрече" },
      createdAt: new Date(),
    },
  ],
  hasMoreMessages: true,
};

console.log("   💬 Conversation Context:");
console.log("   ", JSON.stringify(conversationContext, null, 2));
console.log();

// 2. Умная обрезка контекста
console.log("2️⃣ Умная обрезка контекста:");
const maxTokens = 2000; // Для вопроса
const trimmedContext = conversationContext.messages.slice(-3); // Последние 3 сообщения

console.log("   ✂️  Trimmed Context:");
console.log("   ", JSON.stringify(trimmedContext, null, 2));
console.log();

// 3. Создание AgentContext с контекстом разговора
console.log("3️⃣ Создание AgentContext с контекстом разговора:");
const agentContext = {
  userId: "user-123",
  chatId: "chat-456",
  messageId: "msg-789",
  channel: "telegram",
  metadata: {
    channel: "telegram",
    userId: "user-123",
    conversationId: conversationContext.conversationId,
    chatId: "chat-456",
    messageId: "msg-789",
    contextMessageCount: trimmedContext.length,
    agentMode: true,
    
    // 🆕 КОНТЕКСТ РАЗГОВОРА ДЛЯ ТРЕЙСИНГА
    conversationContext: {
      conversationId: conversationContext.conversationId,
      totalMessages: conversationContext.totalMessages,
      contextMessages: trimmedContext.length,
      hasMoreMessages: conversationContext.hasMoreMessages,
    },
    
    // 🆕 ИСТОРИЯ СООБЩЕНИЙ ДЛЯ ТРЕЙСИНГА
    conversationHistory: trimmedContext.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content.text,
      createdAt: msg.createdAt,
    })),
  },
};

console.log("   🤖 Agent Context:");
console.log("   ", JSON.stringify(agentContext, null, 2));
console.log();

// 4. Создание телеметрии с контекстом разговора
console.log("4️⃣ Создание телеметрии с контекстом разговора:");
const telemetry = {
  functionId: "agent-router-routing",
  metadata: {
    agentName: "Router Agent",
    taskType: "routing",
    taskId: "task-" + Date.now(),
    userId: agentContext.userId,
    channel: agentContext.channel,
    chatId: agentContext.chatId,
    messageId: agentContext.messageId,
    
    // 🆕 КОНТЕКСТ РАЗГОВОРА В ТЕЛЕМЕТРИИ
    conversationContext: agentContext.metadata.conversationContext,
    conversationHistory: agentContext.metadata.conversationHistory,
    conversationId: agentContext.metadata.conversationId,
    contextMessageCount: agentContext.metadata.contextMessageCount,
  },
};

console.log("   📊 Telemetry with Context:");
console.log("   ", JSON.stringify(telemetry, null, 2));
console.log();

// 5. Анализ контекста в трейсинге
console.log("5️⃣ Анализ контекста в трейсинге:");
const tracingAnalysis = {
  hasConversationContext: !!telemetry.metadata.conversationContext,
  hasConversationHistory: !!telemetry.metadata.conversationHistory,
  conversationId: telemetry.metadata.conversationId,
  totalMessages: telemetry.metadata.conversationContext?.totalMessages,
  contextMessages: telemetry.metadata.conversationContext?.contextMessages,
  hasMoreMessages: telemetry.metadata.conversationContext?.hasMoreMessages,
  historyLength: telemetry.metadata.conversationHistory?.length,
  lastMessage: telemetry.metadata.conversationHistory?.[telemetry.metadata.conversationHistory.length - 1],
};

console.log("   🔍 Tracing Analysis:");
Object.entries(tracingAnalysis).forEach(([key, value]) => {
  if (key === "lastMessage" && value) {
    console.log(`   ${key}: ${value.role} - "${value.content}"`);
  } else {
    console.log(`   ${key}: ${value}`);
  }
});
console.log();

// 6. Преимущества контекста в трейсинге
console.log("6️⃣ Преимущества контекста в трейсинге:");
const benefits = [
  "✅ Полная видимость истории беседы в логах",
  "✅ Возможность отслеживания контекста между сообщениями",
  "✅ Улучшенная диагностика проблем с агентами",
  "✅ Анализ качества ответов с учетом контекста",
  "✅ Мониторинг эффективности использования контекста",
  "✅ Отладка проблем с потерей контекста",
];

benefits.forEach(benefit => {
  console.log(`   ${benefit}`);
});
console.log();

// 7. Пример использования в мониторинге
console.log("7️⃣ Пример использования в мониторинге:");
const monitoringExample = {
  alert: "High context loss detected",
  conversationId: telemetry.metadata.conversationId,
  issue: "Context reduced from 25 to 3 messages",
  impact: "May affect response quality",
  recommendation: "Check context trimming logic",
  context: {
    original: telemetry.metadata.conversationContext?.totalMessages,
    current: telemetry.metadata.conversationContext?.contextMessages,
    loss: (telemetry.metadata.conversationContext?.totalMessages || 0) - (telemetry.metadata.conversationContext?.contextMessages || 0),
  },
};

console.log("   🚨 Monitoring Alert Example:");
console.log("   ", JSON.stringify(monitoringExample, null, 2));
console.log();

console.log("🎯 Заключение:");
console.log("   ✅ Контекст разговора теперь полностью передается в трейсинг");
console.log("   ✅ Телеметрия содержит историю беседы и метаданные контекста");
console.log("   ✅ Система мониторинга может отслеживать качество контекста");
console.log("   ✅ Улучшена диагностика и отладка агентной системы");
console.log();
console.log("🚀 Система трейсинга с контекстом готова к работе!");
