#!/usr/bin/env bun

/**
 * 🚀 Демонстрация Fast Response System
 *
 * Показывает, как система мгновенно отвечает на простые сообщения
 * и определяет, какие нужно обрабатывать через мультиагентов
 */
import { fastResponseSystem } from "../utils/fast-response-system";

console.log("🚀 Демонстрация Fast Response System\n");

// Тестовые сообщения
const testMessages = [
  "Привет!",
  "Спасибо за помощь!",
  "Который час?",
  "Какая сегодня дата?",
  "Что умеешь?",
  "Как дела?",
  "Пока!",
  "Как мне создать сложную систему для анализа данных с использованием машинного обучения?",
  "Помоги мне с планированием задач на завтра",
  "Ок, понятно",
  "Да, согласен",
];

console.log("📝 Тестируем различные типы сообщений:\n");

testMessages.forEach((message, index) => {
  console.log(`${index + 1}. Сообщение: "${message}"`);

  const response = fastResponseSystem.analyzeMessage(message);

  if (response.shouldSendFast) {
    console.log(`   ⚡ Fast Response: ${response.fastResponse}`);
    console.log(
      `   🔄 Нужна полная обработка: ${response.needsFullProcessing ? "Да" : "Нет"}`,
    );
    console.log(`   📊 Тип обработки: ${response.processingType}`);
  } else {
    console.log(`   🤖 Отправляется в мультиагенты`);
    console.log(
      `   🔄 Нужна полная обработка: ${response.needsFullProcessing ? "Да" : "Нет"}`,
    );
    console.log(`   📊 Тип обработки: ${response.processingType}`);
  }

  console.log();
});

// Показываем статистику правил
console.log("📊 Статистика правил Fast Response System:");
const stats = fastResponseSystem.getStats();
console.log(`   Всего правил: ${stats.totalRules}`);
console.log();

console.log("🔧 Примеры правил:");
stats.rules.slice(0, 5).forEach((rule, index) => {
  console.log(`   ${index + 1}. Паттерн: ${rule.pattern}`);
  console.log(`      Уверенность: ${(rule.confidence * 100).toFixed(0)}%`);
  console.log(
    `      Полная обработка: ${rule.needsFullProcessing ? "Да" : "Нет"}`,
  );
  console.log();
});

// Демонстрируем добавление кастомного правила
console.log("➕ Добавляем кастомное правило:");
const customRule = {
  pattern: /погода/i,
  response:
    "🌤️ К сожалению, я не могу проверить погоду. Попробуйте специализированные сервисы!",
  confidence: 0.8,
  needsFullProcessing: false,
};

fastResponseSystem.addRule(customRule);
console.log(`   Добавлено правило для "погода"`);

// Тестируем новое правило
const weatherResponse = fastResponseSystem.analyzeMessage(
  "Какая погода сегодня?",
);
console.log(
  `   Тест: "Какая погода сегодня?" → ${weatherResponse.fastResponse}`,
);
console.log();

console.log("🎯 Преимущества Fast Response System:");
const benefits = [
  "⚡ Мгновенная реакция на простые сообщения",
  "🚀 Улучшенный пользовательский опыт",
  "💡 Разгрузка мультиагентной системы",
  "🔄 Гибкая настройка правил",
  "📊 Статистика и мониторинг",
  "🎨 Легкая кастомизация ответов",
];

benefits.forEach((benefit) => {
  console.log(`   ${benefit}`);
});

console.log();
console.log("✅ Демонстрация завершена! Fast Response System готов к работе!");
