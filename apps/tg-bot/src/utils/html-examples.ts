/**
 * Примеры использования HTML утилит для Telegram
 * Этот файл демонстрирует возможности HTML форматирования
 */

import { HTMLMessageBuilder } from "./html-message-builder";

/**
 * Примеры различных типов сообщений
 */
export const htmlExamples = {
  /**
   * Простое информационное сообщение
   */
  simpleInfo: () => {
    return HTMLMessageBuilder.createMessage({
      title: "Информация",
      content: "Это простое информационное сообщение с заголовком.",
      useEmojis: true,
    });
  },

  /**
   * Сообщение с результатом анализа
   */
  analysisResult: () => {
    return HTMLMessageBuilder.createAnalysisResult(
      "Анализ финансовых показателей",
      "Общий тренд положительный, рост на 15% по сравнению с прошлым месяцем",
      [
        "Выручка: 1,250,000 ₽ (+12%)",
        "Расходы: 890,000 ₽ (+8%)",
        "Прибыль: 360,000 ₽ (+25%)",
      ],
      [
        "Продолжить оптимизацию расходов",
        "Рассмотреть возможность расширения",
        "Мониторить ключевые метрики",
      ],
    );
  },

  /**
   * Финансовая информация
   */
  financialInfo: () => {
    return HTMLMessageBuilder.createFinancialInfo(
      "Отчёт по доходам",
      "125,000",
      "₽",
      {
        Зарплата: "85,000 ₽",
        Подработка: "25,000 ₽",
        Инвестиции: "15,000 ₽",
      },
      "up",
    );
  },

  /**
   * Информация о задаче
   */
  taskInfo: () => {
    return HTMLMessageBuilder.createTaskInfo(
      "Разработка нового функционала",
      "Создать систему уведомлений для пользователей с возможностью настройки предпочтений",
      "high",
      "2024-02-15",
      "Иван Петров",
    );
  },

  /**
   * Таблица с данными
   */
  dataTable: () => {
    return HTMLMessageBuilder.createTable({
      title: "Статистика по проектам",
      headers: ["Проект", "Статус", "Прогресс", "Срок"],
      rows: [
        ["Веб-сайт", "В работе", "75%", "2024-03-01"],
        ["Мобильное приложение", "Планирование", "10%", "2024-04-15"],
        ["API интеграция", "Завершён", "100%", "2024-01-20"],
      ],
    });
  },

  /**
   * Список с элементами
   */
  itemList: () => {
    return HTMLMessageBuilder.createList({
      title: "План на неделю",
      items: [
        "Завершить разработку основного функционала",
        "Провести тестирование",
        "Подготовить документацию",
        "Запланировать релиз",
      ],
      type: "numbered",
    });
  },

  /**
   * Блок кода
   */
  codeBlock: () => {
    return HTMLMessageBuilder.createCodeBlock(
      `function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

const total = calculateTotal(cartItems);
console.log(\`Общая сумма: \${total} ₽\`);`,
      "JavaScript",
      "Пример функции расчёта",
    );
  },

  /**
   * Комплексное сообщение
   */
  complexMessage: () => {
    const table = HTMLMessageBuilder.createTable({
      title: "Текущие задачи",
      headers: ["Задача", "Приоритет", "Статус"],
      rows: [
        ["Разработка API", "Высокий", "В работе"],
        ["Тестирование", "Средний", "Ожидает"],
        ["Документация", "Низкий", "Завершено"],
      ],
    });

    const list = HTMLMessageBuilder.createList({
      title: "Следующие шаги:",
      items: [
        "Завершить API разработку",
        "Начать тестирование",
        "Обновить документацию",
      ],
    });

    return HTMLMessageBuilder.createMessage({
      title: "Отчёт по проекту",
      subtitle: "Еженедельный обзор",
      content: `${table}\n\n${list}`,
      footer: "Отчёт сгенерирован автоматически",
      useEmojis: true,
    });
  },
};

/**
 * Функция для получения случайного примера
 */
export function getRandomExample() {
  const examples = Object.values(htmlExamples);
  const randomIndex = Math.floor(Math.random() * examples.length);
  return examples[randomIndex]();
}

/**
 * Функция для получения всех примеров
 */
export function getAllExamples() {
  return Object.entries(htmlExamples).map(([name, fn]) => ({
    name,
    message: fn(),
  }));
}
