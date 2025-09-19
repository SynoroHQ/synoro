import { describe, expect, it } from "bun:test";

import {
  getRussianPrioritiesForCanonical,
  isRussianPriority,
  mapRussianPriorityToCanonical,
} from "./priority-mapper";

describe("Priority Mapper", () => {
  describe("mapRussianPriorityToCanonical", () => {
    it("should map urgent priorities correctly", () => {
      expect(mapRussianPriorityToCanonical("срочно")).toBe("urgent");
      expect(mapRussianPriorityToCanonical("немедленно")).toBe("urgent");
      expect(mapRussianPriorityToCanonical("критично")).toBe("urgent");
    });

    it("should map high priorities correctly", () => {
      expect(mapRussianPriorityToCanonical("важно")).toBe("high");
      expect(mapRussianPriorityToCanonical("приоритетно")).toBe("high");
      expect(mapRussianPriorityToCanonical("нужно сделать")).toBe("high");
    });

    it("should map medium priorities correctly", () => {
      expect(mapRussianPriorityToCanonical("обычно")).toBe("medium");
      expect(mapRussianPriorityToCanonical("стандартно")).toBe("medium");
    });

    it("should map low priorities correctly", () => {
      expect(mapRussianPriorityToCanonical("неспешно")).toBe("low");
      expect(mapRussianPriorityToCanonical("когда будет время")).toBe("low");
    });

    it("should handle case insensitive input", () => {
      expect(mapRussianPriorityToCanonical("СРОЧНО")).toBe("urgent");
      expect(mapRussianPriorityToCanonical("Важно")).toBe("high");
      expect(mapRussianPriorityToCanonical("  обычно  ")).toBe("medium");
    });

    it("should handle partial matches", () => {
      expect(mapRussianPriorityToCanonical("очень срочно")).toBe("urgent");
      expect(mapRussianPriorityToCanonical("не очень важно")).toBe("high");
    });

    it("should default to medium for unknown priorities", () => {
      expect(mapRussianPriorityToCanonical("неизвестный")).toBe("medium");
      expect(mapRussianPriorityToCanonical("")).toBe("medium");
    });

    it("should handle English priorities (backward compatibility)", () => {
      expect(mapRussianPriorityToCanonical("urgent")).toBe("urgent");
      expect(mapRussianPriorityToCanonical("high")).toBe("high");
      expect(mapRussianPriorityToCanonical("medium")).toBe("medium");
      expect(mapRussianPriorityToCanonical("low")).toBe("low");
    });
  });

  describe("isRussianPriority", () => {
    it("should identify Russian priorities correctly", () => {
      expect(isRussianPriority("срочно")).toBe(true);
      expect(isRussianPriority("важно")).toBe(true);
      expect(isRussianPriority("обычно")).toBe(true);
      expect(isRussianPriority("неспешно")).toBe(true);
    });

    it("should reject non-Russian priorities", () => {
      expect(isRussianPriority("urgent")).toBe(false);
      expect(isRussianPriority("unknown")).toBe(false);
      expect(isRussianPriority("")).toBe(false);
    });
  });

  describe("getRussianPrioritiesForCanonical", () => {
    it("should return correct Russian priorities for urgent", () => {
      const urgentPriorities = getRussianPrioritiesForCanonical("urgent");
      expect(urgentPriorities).toContain("срочно");
      expect(urgentPriorities).toContain("немедленно");
      expect(urgentPriorities).toContain("критично");
    });

    it("should return correct Russian priorities for high", () => {
      const highPriorities = getRussianPrioritiesForCanonical("high");
      expect(highPriorities).toContain("важно");
      expect(highPriorities).toContain("приоритетно");
      expect(highPriorities).toContain("нужно сделать");
    });

    it("should return correct Russian priorities for medium", () => {
      const mediumPriorities = getRussianPrioritiesForCanonical("medium");
      expect(mediumPriorities).toContain("обычно");
      expect(mediumPriorities).toContain("стандартно");
    });

    it("should return correct Russian priorities for low", () => {
      const lowPriorities = getRussianPrioritiesForCanonical("low");
      expect(lowPriorities).toContain("неспешно");
      expect(lowPriorities).toContain("когда будет время");
    });
  });
});
