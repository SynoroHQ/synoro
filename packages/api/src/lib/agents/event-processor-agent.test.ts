import { describe, it, expect } from "vitest";
import { EventProcessorAgent } from "./event-processor-agent";

describe("EventProcessorAgent", () => {
  describe("Financial Extraction", () => {
    const agent = new EventProcessorAgent();

    // Вспомогательная функция для тестирования приватного метода
    const testFinancialExtraction = async (text: string) => {
      const tool = (agent as any).getFinancialExtractionTool();
      return await tool.execute({ text });
    };

    describe("Ruble amounts", () => {
      it("should extract amount with space as thousands separator", async () => {
        const result = await testFinancialExtraction("Купил продукты за 1 299,90 ₽");
        expect(result).toEqual({ amount: 1299.90, currency: "RUB" });
      });

      it("should extract amount with non-breaking space as thousands separator", async () => {
        const result = await testFinancialExtraction("Потратил 1\u00A0299,90 ₽ на такси");
        expect(result).toEqual({ amount: 1299.90, currency: "RUB" });
      });

      it("should extract amount with thin space as thousands separator", async () => {
        const result = await testFinancialExtraction("Заплатил 1\u2009299,90 ₽ за билет");
        expect(result).toEqual({ amount: 1299.90, currency: "RUB" });
      });

      it("should extract amount with multiple spaces", async () => {
        const result = await testFinancialExtraction("Стоимость: 1 000 000,50 ₽");
        expect(result).toEqual({ amount: 1000000.50, currency: "RUB" });
      });

      it("should extract amount with dot as decimal separator", async () => {
        const result = await testFinancialExtraction("Цена: 1 299.90 ₽");
        expect(result).toEqual({ amount: 1299.90, currency: "RUB" });
      });

      it("should extract amount with 'р' suffix", async () => {
        const result = await testFinancialExtraction("Потратил 1 299,90 р");
        expect(result).toEqual({ amount: 1299.90, currency: "RUB" });
      });

      it("should extract amount with 'руб' suffix", async () => {
        const result = await testFinancialExtraction("Стоимость 1 299,90 руб");
        expect(result).toEqual({ amount: 1299.90, currency: "RUB" });
      });

      it("should extract amount with currency symbol before number", async () => {
        const result = await testFinancialExtraction("₽ 1 299,90");
        expect(result).toEqual({ amount: 1299.90, currency: "RUB" });
      });
    });

    describe("Dollar amounts", () => {
      it("should extract amount with space as thousands separator", async () => {
        const result = await testFinancialExtraction("Paid $1 299.90 for the item");
        expect(result).toEqual({ amount: 1299.90, currency: "USD" });
      });

      it("should extract amount with comma as thousands separator", async () => {
        const result = await testFinancialExtraction("Cost: $1,299.90");
        expect(result).toEqual({ amount: 1299.90, currency: "USD" });
      });

      it("should extract amount with 'доллар' suffix", async () => {
        const result = await testFinancialExtraction("Цена 1 299,90 доллар");
        expect(result).toEqual({ amount: 1299.90, currency: "USD" });
      });

      it("should extract amount with 'USD' suffix", async () => {
        const result = await testFinancialExtraction("Стоимость 1 299,90 USD");
        expect(result).toEqual({ amount: 1299.90, currency: "USD" });
      });
    });

    describe("Euro amounts", () => {
      it("should extract amount with space as thousands separator", async () => {
        const result = await testFinancialExtraction("Paid €1 299,90 for the service");
        expect(result).toEqual({ amount: 1299.90, currency: "EUR" });
      });

      it("should extract amount with comma as decimal separator", async () => {
        const result = await testFinancialExtraction("Cost: €1.299,90");
        expect(result).toEqual({ amount: 1299.90, currency: "EUR" });
      });

      it("should extract amount with 'евро' suffix", async () => {
        const result = await testFinancialExtraction("Цена 1 299,90 евро");
        expect(result).toEqual({ amount: 1299.90, currency: "EUR" });
      });

      it("should extract amount with 'EUR' suffix", async () => {
        const result = await testFinancialExtraction("Стоимость 1 299,90 EUR");
        expect(result).toEqual({ amount: 1299.90, currency: "EUR" });
      });
    });

    describe("Edge cases", () => {
      it("should handle mixed separators", async () => {
        const result = await testFinancialExtraction("Цена: 1 000,50 ₽ и $2,500.75");
        // Должен вернуть первое найденное значение
        expect(result).toEqual({ amount: 1000.50, currency: "RUB" });
      });

      it("should handle very large numbers", async () => {
        const result = await testFinancialExtraction("Стоимость проекта: 1 000 000 000,99 ₽");
        expect(result).toEqual({ amount: 1000000000.99, currency: "RUB" });
      });

      it("should handle numbers without decimal part", async () => {
        const result = await testFinancialExtraction("Потратил 1 500 ₽");
        expect(result).toEqual({ amount: 1500, currency: "RUB" });
      });

      it("should handle numbers with only decimal part", async () => {
        const result = await testFinancialExtraction("Стоимость: ,50 ₽");
        expect(result).toEqual({ amount: 0.50, currency: "RUB" });
      });

      it("should handle text without numbers", async () => {
        const result = await testFinancialExtraction("Просто текст без чисел");
        expect(result).toBeNull();
      });

      it("should handle empty string", async () => {
        const result = await testFinancialExtraction("");
        expect(result).toBeNull();
      });
    });

    describe("Fallback number extraction", () => {
      it("should extract number without currency as RUB by default", async () => {
        const result = await testFinancialExtraction("Потратил 1 299,90");
        expect(result).toEqual({ amount: 1299.90, currency: "RUB" });
      });

      it("should extract number with spaces without currency", async () => {
        const result = await testFinancialExtraction("Стоимость 1 000 000");
        expect(result).toEqual({ amount: 1000000, currency: "RUB" });
      });
    });
  });
});
