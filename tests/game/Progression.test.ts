import { beforeEach, describe, expect, it } from "vitest";
import { GameEngine } from "@/game/engine";
import {
  computeLevelSummary,
  getLevelByCode,
  isLevelUnlocked,
  useProgressionStore,
} from "@/game/levels";

describe("Progression & Active Level Execution", () => {
  beforeEach(() => {
    useProgressionStore.getState().resetProgress();
  });

  describe("Prerequisite & Status Computation", () => {
    it("unlocks level 1.1 by default without prerequisites", () => {
      expect(isLevelUnlocked("1.1", new Set())).toBe(true);
    });

    it("locks level 1.2 when level 1.1 is not completed", () => {
      expect(isLevelUnlocked("1.2", new Set())).toBe(false);
      expect(isLevelUnlocked("1.2", ["1.3"])).toBe(false);
    });

    it("unlocks level 1.2 when level 1.1 is completed", () => {
      expect(isLevelUnlocked("1.2", new Set(["1.1"]))).toBe(true);
    });

    it("locks island 2 (level 2.1) until level 1.6 is completed", () => {
      expect(isLevelUnlocked("2.1", new Set(["1.1", "1.2", "1.3", "1.4", "1.5"]))).toBe(false);
      expect(isLevelUnlocked("2.1", new Set(["1.6"]))).toBe(true);
    });

    it("computes level presentation statuses consistently", () => {
      const level1_1 = getLevelByCode("1.1")!;
      const level1_2 = getLevelByCode("1.2")!;

      // Initial state
      const summary1_1 = computeLevelSummary(level1_1, {});
      expect(summary1_1.computedStatus).toBe("AVAILABLE");
      expect(summary1_1.isAvailable).toBe(true);
      expect(summary1_1.isLocked).toBe(false);

      const summary1_2 = computeLevelSummary(level1_2, {});
      expect(summary1_2.computedStatus).toBe("LOCKED");
      expect(summary1_2.isLocked).toBe(true);
      expect(summary1_2.isAvailable).toBe(false);

      // In progress state
      const summaryInProgress = computeLevelSummary(level1_1, {
        "1.1": { status: "IN_PROGRESS", stars: 0 },
      });
      expect(summaryInProgress.computedStatus).toBe("IN_PROGRESS");

      // Completed state
      const summaryCompleted = computeLevelSummary(level1_1, {
        "1.1": { status: "COMPLETED", stars: 2 },
      });
      expect(summaryCompleted.computedStatus).toBe("COMPLETED");
      expect(summaryCompleted.isCompleted).toBe(true);
      expect(summaryCompleted.stars).toBe(2);

      // Level 1.2 becomes AVAILABLE once 1.1 is COMPLETED
      const summary1_2NowAvailable = computeLevelSummary(level1_2, {
        "1.1": { status: "COMPLETED", stars: 1 },
      });
      expect(summary1_2NowAvailable.computedStatus).toBe("AVAILABLE");
      expect(summary1_2NowAvailable.isAvailable).toBe(true);
    });
  });

  describe("Progression Store Session Behavior", () => {
    it("starts with active level 1.1", () => {
      const store = useProgressionStore.getState();
      expect(store.activeLevelCode).toBe("1.1");
      expect(store.getActiveLevel().title).toBe("Boti Mau Maju");
    });

    it("prevents switching to locked levels", () => {
      const store = useProgressionStore.getState();
      const success = store.setActiveLevelCode("1.2");
      expect(success).toBe(false);
      expect(store.activeLevelCode).toBe("1.1");
    });

    it("allows switching to level 1.2 after level 1.1 is completed", () => {
      const store = useProgressionStore.getState();
      store.completeLevel("1.1", 1);

      const success = store.setActiveLevelCode("1.2");
      expect(success).toBe(true);
      expect(useProgressionStore.getState().activeLevelCode).toBe("1.2");
      expect(useProgressionStore.getState().getActiveLevel().title).toBe("Jalan Menuju Apel");
    });

    it("provides the next level code correctly", () => {
      const store = useProgressionStore.getState();
      expect(store.getNextLevelCode("1.1")).toBe("1.2");
      expect(store.getNextLevelCode("1.6")).toBe("2.1");
      expect(store.getNextLevelCode("2.6")).toBeNull();
    });
  });

  describe("Game Engine executes active level configurations accurately", () => {
    it("executes Level 1.4 (Jalan Desa) and detects obstacle collisions correctly", () => {
      const level1_4 = getLevelByCode("1.4")!;
      const engine = new GameEngine(level1_4);

      expect(engine.getState()).toEqual({
        position: { x: 0, y: 0 },
        direction: "EAST",
      });

      // Valid solution through Level 1.4 village path:
      // Start (0, 0) EAST:
      // 1. MOVE -> (1, 0)
      // 2. TURN_RIGHT -> facing SOUTH
      // 3. MOVE -> (1, 1)
      // 4. MOVE -> (1, 2)
      // 5. TURN_LEFT -> facing EAST
      // 6. MOVE -> (2, 2)
      // 7. MOVE -> (3, 2)
      // 8. MOVE -> (4, 2) [Goal!]
      const actions = [
        "MOVE",
        "TURN_RIGHT",
        "MOVE",
        "MOVE",
        "TURN_LEFT",
        "MOVE",
        "MOVE",
        "MOVE",
      ] as const;

      const result = engine.execute(actions);
      expect(result.status).toBe("SUCCESS");
      expect(result.completed).toBe(true);
      expect(result.collisions).toBe(0);
      expect(result.finalPosition).toEqual({ x: 4, y: 2 });
    });

    it("detects obstacles on Level 1.4 when Boti tries to take a blocked path", () => {
      const level1_4 = getLevelByCode("1.4")!;
      const engine = new GameEngine(level1_4);

      // (2, 0) is an obstacle in Level 1.4. Moving twice EAST hits (2, 0).
      engine.step("MOVE"); // to (1, 0)
      const step2 = engine.step("MOVE"); // attempted to (2, 0), hits obstacle

      expect(step2.event.type).toBe("OBSTACLE_COLLISION");
      expect(step2.currentState.position).toEqual({ x: 1, y: 0 }); // position did not move
      expect(engine.getCollisions()).toBe(1);
    });
  });
});
