import { describe, expect, it } from "vitest";
import {
  getAllLevels,
  getIslands,
  getLevelByCode,
  getNextLevel,
  levelDefinitionSchema,
} from "@/game/levels";

describe("Level Catalog & Validation", () => {
  it("contains exactly 12 levels across 2 islands", () => {
    const levels = getAllLevels();
    expect(levels.length).toBe(12);

    const islands = getIslands();
    expect(islands.length).toBe(2);
    expect(islands[0].slug).toBe("desa-boti");
    expect(islands[1].slug).toBe("hutan-pola");
  });

  it("contains 12 unique level codes", () => {
    const levels = getAllLevels();
    const codes = levels.map((l) => l.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(12);

    // Verify all 12 expected codes exist
    const expectedCodes = [
      "1.1", "1.2", "1.3", "1.4", "1.5", "1.6",
      "2.1", "2.2", "2.3", "2.4", "2.5", "2.6",
    ];
    expect(codes).toEqual(expectedCodes);
  });

  it("validates that all 12 levels satisfy levelDefinitionSchema", () => {
    const levels = getAllLevels();
    for (const level of levels) {
      const parsed = levelDefinitionSchema.safeParse(level);
      expect(parsed.success, `Level ${level.code} validation failed: ${JSON.stringify(parsed)}`).toBe(true);
    }
  });

  it("ensures available blocks match curriculum expectations", () => {
    const l1_1 = getLevelByCode("1.1");
    expect(l1_1?.availableBlocks).toEqual(["MOVE"]);

    const l1_2 = getLevelByCode("1.2");
    expect(l1_2?.availableBlocks).toEqual(["MOVE"]);

    const l1_4 = getLevelByCode("1.4");
    expect(l1_4?.availableBlocks).toContain("MOVE");
    expect(l1_4?.availableBlocks).toContain("TURN_LEFT");
    expect(l1_4?.availableBlocks).toContain("TURN_RIGHT");
  });

  it("retrieves level by code correctly and returns undefined for unknown codes", () => {
    expect(getLevelByCode("1.1")?.title).toBe("Cipi Mau Maju");
    expect(getLevelByCode("2.6")?.title).toBe("Master Challenge");
    expect(getLevelByCode("9.9")).toBeUndefined();
  });

  it("advances to next level correctly in order, including island transition", () => {
    expect(getNextLevel("1.1")?.code).toBe("1.2");
    expect(getNextLevel("1.6")?.code).toBe("2.1"); // Pulau 1 -> Pulau 2
    expect(getNextLevel("2.5")?.code).toBe("2.6");
    expect(getNextLevel("2.6")).toBeNull(); // Last level
  });

  describe("Schema Validation Rejections", () => {
    const baseValidLevel = getAllLevels()[0];

    it("rejects starting position outside grid", () => {
      const invalid = {
        ...baseValidLevel,
        start: { x: 5, y: 1, direction: "EAST" }, // width is 5, max x is 4
      };
      const result = levelDefinitionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects goal position outside grid", () => {
      const invalid = {
        ...baseValidLevel,
        goal: { x: 4, y: 3 }, // height is 3, max y is 2
      };
      const result = levelDefinitionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects obstacle outside grid", () => {
      const invalid = {
        ...baseValidLevel,
        obstacles: [{ x: 5, y: 0 }],
      };
      const result = levelDefinitionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects start position colliding with an obstacle", () => {
      const invalid = {
        ...baseValidLevel,
        start: { x: 0, y: 1, direction: "EAST" },
        obstacles: [{ x: 0, y: 1 }],
      };
      const result = levelDefinitionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects goal position colliding with an obstacle", () => {
      const invalid = {
        ...baseValidLevel,
        goal: { x: 4, y: 1 },
        obstacles: [{ x: 4, y: 1 }],
      };
      const result = levelDefinitionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects start position identical to goal", () => {
      const invalid = {
        ...baseValidLevel,
        start: { x: 4, y: 1, direction: "EAST" },
        goal: { x: 4, y: 1 },
      };
      const result = levelDefinitionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
