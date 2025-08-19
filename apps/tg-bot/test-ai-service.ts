import { answerQuestion, classifyMessageType } from "./src/services/ai-service";

async function testClassifyMessageType() {
  console.log("🔍 Тестируем классификацию типов сообщений...\n");

  const testMessages = [
    "Как тебя зовут?",
    "Что ты умеешь?",
    "Купил хлеб за 45 рублей",
    "Привет!",
    "Сколько я потратил на продукты?",
    "Нужно записаться к врачу",
    "тест",
  ];

  for (const message of testMessages) {
    console.log(`Сообщение: "${message}"`);
    try {
      const result = await classifyMessageType(message);
      console.log(`  Тип: ${result.type}`);
      console.log(`  Подтип: ${result.subtype || "нет"}`);
      console.log(`  Уверенность: ${result.confidence}`);
      console.log(`  Записывать: ${result.need_logging ? "да" : "нет"}`);
    } catch (error) {
      console.log(`  Ошибка: ${error}`);
    }
    console.log();
  }
}

async function testAnswerQuestion() {
  console.log("💬 Тестируем ответы на вопросы...\n");

  const testQuestions = [
    { text: "Как тебя зовут?", type: "question", subtype: "about_bot" },
    { text: "Что ты умеешь?", type: "question", subtype: "about_bot" },
    { text: "Как дела?", type: "question", subtype: "general" },
    { text: "Сколько я потратил?", type: "question", subtype: "data_query" },
  ];

  for (const question of testQuestions) {
    console.log(`Вопрос: "${question.text}"`);
    try {
      const messageType = {
        type: question.type as "question",
        subtype: question.subtype,
        confidence: 0.9,
        need_logging: false,
      };

      const answer = await answerQuestion(question.text, messageType);
      console.log(`Ответ: ${answer}`);
    } catch (error) {
      console.log(`Ошибка: ${error}`);
    }
    console.log();
  }
}

async function main() {
  console.log("🤖 Тестирование улучшенного AI сервиса\n");

  try {
    await testClassifyMessageType();
    await testAnswerQuestion();
    console.log("✅ Все тесты завершены!");
  } catch (error) {
    console.error("❌ Ошибка во время тестирования:", error);
  }
}

main();
