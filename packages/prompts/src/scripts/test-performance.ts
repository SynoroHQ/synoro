#!/usr/bin/env bun

/**
 * Скрипт для тестирования производительности агентов
 */
import { globalCache, globalFastRouter } from "../core";
import { performanceMonitor } from "../tools/performance-monitor";

// Тестовые запросы для разных агентов
const testQueries = [
  // Event Processor
  "Потратил 1500 рублей на продукты",
  "Купил новую куртку за 5000₽",
  "Нужно позвонить врачу завтра",
  "Починил кран в ванной",
  "Записать встречу на понедельник",

  // Event Analyzer
  "Покажи траты за месяц",
  "Сколько потратил на продукты?",
  "Статистика по категориям",
  "Анализ расходов за год",
  "Сравни траты с прошлым месяцем",

  // General Assistant
  "Как создать событие?",
  "Что такое категории событий?",
  "Помоги настроить систему",
  "Объясни как работает анализ",
  "Инструкция по использованию",
];

async function testRoutingPerformance() {
  console.log("🚀 Тестирование производительности роутинга...\n");

  const startTime = Date.now();
  const results: { query: string; agent: string; time: number }[] = [];

  for (const query of testQueries) {
    const queryStart = Date.now();
    const agent = globalFastRouter.route(query);
    const queryTime = Date.now() - queryStart;

    results.push({ query, agent, time: queryTime });
  }

  const totalTime = Date.now() - startTime;
  const avgTime = totalTime / testQueries.length;

  console.log("📊 Результаты роутинга:");
  console.log(`Всего запросов: ${testQueries.length}`);
  console.log(`Общее время: ${totalTime}ms`);
  console.log(`Среднее время: ${avgTime.toFixed(2)}ms`);
  console.log(
    `Скорость: ${(testQueries.length / (totalTime / 1000)).toFixed(0)} запросов/сек\n`,
  );

  // Группировка по агентам
  const agentGroups = results.reduce(
    (acc, result) => {
      if (!acc[result.agent]) acc[result.agent] = [];
      acc[result.agent].push(result);
      return acc;
    },
    {} as Record<string, typeof results>,
  );

  console.log("🎯 Распределение по агентам:");
  for (const [agent, queries] of Object.entries(agentGroups)) {
    console.log(`${agent}: ${queries.length} запросов`);
  }
  console.log();

  return results;
}

async function testCachePerformance() {
  console.log("💾 Тестирование производительности кэша...\n");

  // Заполняем кэш
  for (let i = 0; i < 100; i++) {
    globalCache.set(`test-key-${i}`, `test-value-${i}`, 60000);
  }

  // Тестируем чтение
  const readStart = Date.now();
  let hits = 0;

  for (let i = 0; i < 1000; i++) {
    const key = `test-key-${i % 100}`;
    const value = globalCache.get(key);
    if (value) hits++;
  }

  const readTime = Date.now() - readStart;
  const stats = globalCache.getStats();

  console.log("📊 Результаты кэширования:");
  console.log(`Операций чтения: 1000`);
  console.log(`Время чтения: ${readTime}ms`);
  console.log(
    `Скорость: ${(1000 / (readTime / 1000)).toFixed(0)} операций/сек`,
  );
  console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
  console.log(`Размер кэша: ${stats.size} элементов\n`);

  // Очищаем тестовые данные
  globalCache.clear();
}

async function generatePerformanceReport() {
  console.log("📈 Генерация отчета о производительности...\n");

  const report = performanceMonitor.generateReport();

  console.log("🎯 Отчет о производительности:");
  console.log(
    `Время генерации: ${new Date(report.timestamp).toLocaleString()}`,
  );
  console.log();

  console.log("💾 Кэш:");
  console.log(`Hit rate: ${(report.cache.hitRate * 100).toFixed(1)}%`);
  console.log(`Размер: ${report.cache.size} элементов`);
  console.log();

  console.log("🚦 Роутинг:");
  console.log(`Всего правил: ${report.routing.totalRules}`);
  console.log("Распределение правил:");
  if (report.routing.distribution) {
    for (const [agent, count] of Object.entries(report.routing.distribution)) {
      console.log(`  ${agent}: ${count} правил`);
    }
  }
  console.log();

  if (report.recommendations.length > 0) {
    console.log("💡 Рекомендации:");
    for (const recommendation of report.recommendations) {
      console.log(`  • ${recommendation}`);
    }
  } else {
    console.log("✅ Все показатели в норме!");
  }
  console.log();
}

async function main() {
  console.log("🔥 Тестирование производительности системы агентов\n");
  console.log("=".repeat(60) + "\n");

  try {
    // Тестируем роутинг
    await testRoutingPerformance();

    // Тестируем кэш
    await testCachePerformance();

    // Генерируем отчет
    await generatePerformanceReport();

    console.log("✅ Тестирование завершено успешно!");
  } catch (error) {
    console.error("❌ Ошибка при тестировании:", error);
    process.exit(1);
  }
}

// Запускаем если файл вызван напрямую
if (import.meta.main) {
  main();
}
