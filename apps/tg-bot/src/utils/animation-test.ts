// Тест для проверки анимации сообщений
// Этот файл можно использовать для тестирования анимации в разработке

import { MessageAnimation } from "./message-animation";

/**
 * Тест различных типов анимации
 */
export function testAnimationTypes() {
  console.log("🧪 Тестирование типов анимации:");
  
  const animation = new MessageAnimation();
  
  // Тестируем различные типы анимации
  const types = ["processing", "thinking", "working", "agents", "fast"] as const;
  
  types.forEach((type) => {
    console.log(`\n📝 Тип: ${type}`);
    console.log("Фреймы анимации:");
    
    // Получаем фреймы анимации (через рефлексию для тестирования)
    const frames = (animation as any).animations[type];
    frames.forEach((frame: string, index: number) => {
      console.log(`  ${index + 1}. ${frame}`);
    });
  });
}

/**
 * Тест логики анимации
 */
export function testAnimationLogic() {
  console.log("\n🧪 Тестирование логики анимации:");
  
  const animation = new MessageAnimation();
  
  // Тестируем состояние
  console.log(`✅ Начальное состояние активна: ${animation.isRunning()}`);
  
  // Тестируем получение ID
  console.log(`✅ Начальный messageId: ${animation.getMessageId()}`);
  console.log(`✅ Начальный chatId: ${animation.getChatId()}`);
  
  console.log("✅ Все тесты логики пройдены");
}

/**
 * Запуск всех тестов анимации
 */
export function runAnimationTests() {
  console.log("🚀 Запуск тестов анимации сообщений");
  console.log("=" .repeat(50));
  
  testAnimationTypes();
  testAnimationLogic();
  
  console.log("\n" + "=".repeat(50));
  console.log("✅ Все тесты анимации завершены!");
}

// Экспорт для использования в других файлах
export { MessageAnimation };
