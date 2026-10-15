import { describe, expect, it } from "vitest";
import {
  getIslandBySlug,
  getIslands,
  getLevelByCode,
} from "@/game/levels/catalog";
import {
  computeLevelSummary,
  getCompletedCodes,
  getIslandSummary,
  getLatestPlayableLevel,
  isIslandUnlocked,
  isLevelUnlocked,
  type LevelProgress,
} from "@/game/levels/progression";

describe("Task 012.6 — Adventure World Map & Island Progression Tests", () => {
  describe("1. Island Unlocking & Progression Rules", () => {
    it("Island 1 (Desa Boti) is always unlocked by default", () => {
      const progressMap: Record<string, LevelProgress> = {};
      expect(isIslandUnlocked("desa-boti", progressMap)).toBe(true);

      const summary = getIslandSummary("desa-boti", progressMap);
      expect(summary).not.toBeNull();
      expect(summary?.isLocked).toBe(false);
      expect(summary?.status).toBe("AVAILABLE");
      expect(summary?.completedLevels).toBe(0);
      expect(summary?.totalLevels).toBe(6);
    });

    it("Island 2 (Hutan Pola) is locked when Level 1.6 is not completed", () => {
      // Even if levels 1.1 - 1.5 are completed, island 2 remains locked until 1.6 is done
      const progressMap: Record<string, LevelProgress> = {
        "1.1": { status: "COMPLETED", stars: 3 },
        "1.2": { status: "COMPLETED", stars: 3 },
        "1.3": { status: "COMPLETED", stars: 2 },
        "1.4": { status: "COMPLETED", stars: 3 },
        "1.5": { status: "COMPLETED", stars: 1 },
      };

      expect(isIslandUnlocked("hutan-pola", progressMap)).toBe(false);

      const summary = getIslandSummary("hutan-pola", progressMap);
      expect(summary?.isLocked).toBe(true);
      expect(summary?.status).toBe("LOCKED");
    });

    it("Island 2 (Hutan Pola) unlocks immediately when Level 1.6 is completed", () => {
      const progressMap: Record<string, LevelProgress> = {
        "1.6": { status: "COMPLETED", stars: 2 },
      };

      expect(isIslandUnlocked("hutan-pola", progressMap)).toBe(true);

      const summary = getIslandSummary("hutan-pola", progressMap);
      expect(summary?.isLocked).toBe(false);
      expect(summary?.status).toBe("AVAILABLE");
      expect(summary?.activeLevelCode).toBe("2.1");
    });

    it("Computes exploring status for islands with partial progress", () => {
      const progressMap: Record<string, LevelProgress> = {
        "1.1": { status: "COMPLETED", stars: 3 },
        "1.2": { status: "IN_PROGRESS", stars: 0 },
      };

      const summary = getIslandSummary("desa-boti", progressMap);
      expect(summary?.status).toBe("EXPLORING");
      expect(summary?.completedLevels).toBe(1);
      expect(summary?.earnedStars).toBe(3);
      expect(summary?.activeLevelCode).toBe("1.2");
    });

    it("Computes completed status when all levels on an island are finished", () => {
      const progressMap: Record<string, LevelProgress> = {
        "1.1": { status: "COMPLETED", stars: 3 },
        "1.2": { status: "COMPLETED", stars: 3 },
        "1.3": { status: "COMPLETED", stars: 3 },
        "1.4": { status: "COMPLETED", stars: 3 },
        "1.5": { status: "COMPLETED", stars: 3 },
        "1.6": { status: "COMPLETED", stars: 3 },
      };

      const summary = getIslandSummary("desa-boti", progressMap);
      expect(summary?.status).toBe("COMPLETED");
      expect(summary?.isCompleted).toBe(true);
      expect(summary?.completedLevels).toBe(6);
      expect(summary?.earnedStars).toBe(18);
    });
  });

  describe("2. Level Node Selection & Prerequisites", () => {
    it("Level 1.1 is available by default, while 1.2 to 1.6 are locked", () => {
      const progressMap: Record<string, LevelProgress> = {};
      const completedCodes = getCompletedCodes(progressMap);

      expect(isLevelUnlocked("1.1", completedCodes)).toBe(true);
      expect(isLevelUnlocked("1.2", completedCodes)).toBe(false);
      expect(isLevelUnlocked("1.6", completedCodes)).toBe(false);

      const lvl11 = getLevelByCode("1.1")!;
      const lvl12 = getLevelByCode("1.2")!;

      expect(computeLevelSummary(lvl11, progressMap).computedStatus).toBe("AVAILABLE");
      expect(computeLevelSummary(lvl12, progressMap).computedStatus).toBe("LOCKED");
    });

    it("Completing 1.1 unlocks 1.2 as available node", () => {
      const progressMap: Record<string, LevelProgress> = {
        "1.1": { status: "COMPLETED", stars: 2 },
      };
      const completedCodes = getCompletedCodes(progressMap);

      expect(isLevelUnlocked("1.2", completedCodes)).toBe(true);
      expect(isLevelUnlocked("1.3", completedCodes)).toBe(false);

      const lvl12 = getLevelByCode("1.2")!;
      const summary = computeLevelSummary(lvl12, progressMap);
      expect(summary.computedStatus).toBe("AVAILABLE");
      expect(summary.isLocked).toBe(false);
    });

    it("Level 2.1 requires Level 1.6 to be completed", () => {
      const completedBefore = new Set(["1.1", "1.2", "1.3", "1.4", "1.5"]);
      expect(isLevelUnlocked("2.1", completedBefore)).toBe(false);

      const completedAfter = new Set(["1.1", "1.2", "1.3", "1.4", "1.5", "1.6"]);
      expect(isLevelUnlocked("2.1", completedAfter)).toBe(true);
    });
  });

  describe("3. Continue Adventure (Latest Playable Level)", () => {
    it("Returns Level 1.1 for brand new players", () => {
      const progressMap: Record<string, LevelProgress> = {};
      const latest = getLatestPlayableLevel(progressMap);
      expect(latest.code).toBe("1.1");
      expect(latest.title).toBe("Cipi Mau Maju");
    });

    it("Returns Level 1.2 when Level 1.1 is finished", () => {
      const progressMap: Record<string, LevelProgress> = {
        "1.1": { status: "COMPLETED", stars: 3 },
      };
      const latest = getLatestPlayableLevel(progressMap);
      expect(latest.code).toBe("1.2");
      expect(latest.title).toBe("Jalan Menuju Apel");
    });

    it("Transitions seamlessly to Island 2 (Level 2.1) when Level 1.6 is completed", () => {
      const progressMap: Record<string, LevelProgress> = {
        "1.1": { status: "COMPLETED", stars: 3 },
        "1.2": { status: "COMPLETED", stars: 3 },
        "1.3": { status: "COMPLETED", stars: 3 },
        "1.4": { status: "COMPLETED", stars: 3 },
        "1.5": { status: "COMPLETED", stars: 3 },
        "1.6": { status: "COMPLETED", stars: 3 },
      };
      const latest = getLatestPlayableLevel(progressMap);
      expect(latest.code).toBe("2.1");
      expect(latest.islandSlug).toBe("hutan-pola");
    });

    it("Returns Level 2.6 when all 12 levels are completed", () => {
      const progressMap: Record<string, LevelProgress> = {};
      const allLevels = [
        "1.1", "1.2", "1.3", "1.4", "1.5", "1.6",
        "2.1", "2.2", "2.3", "2.4", "2.5", "2.6"
      ];
      for (const code of allLevels) {
        progressMap[code] = { status: "COMPLETED", stars: 3 };
      }
      const latest = getLatestPlayableLevel(progressMap);
      expect(latest.code).toBe("2.6");
    });
  });

  describe("4. Catalog & Island Lookups", () => {
    it("Provides both islands in catalog", () => {
      const islands = getIslands();
      expect(islands).toHaveLength(2);
      expect(islands[0].slug).toBe("desa-boti");
      expect(islands[1].slug).toBe("hutan-pola");
    });

    it("getIslandBySlug retrieves correct island definition", () => {
      const desaBoti = getIslandBySlug("desa-boti");
      expect(desaBoti).toBeDefined();
      expect(desaBoti?.name).toBe("Pulau 1 — Desa Cipi");
      expect(desaBoti?.levelCodes).toHaveLength(6);

      const hutanPola = getIslandBySlug("hutan-pola");
      expect(hutanPola).toBeDefined();
      expect(hutanPola?.name).toBe("Pulau 2 — Hutan Pola");
      expect(hutanPola?.levelCodes).toHaveLength(6);

      const unknown = getIslandBySlug("pulau-hantu");
      expect(unknown).toBeUndefined();
    });
  });
});
