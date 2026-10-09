import { describe, expect, it } from "vitest";
import { GameEngine } from "@/game/engine/GameEngine";
import { InvalidLevelConfigError } from "@/game/engine/validation";
import type { LevelConfig } from "@/game/types/level";

describe("GameEngine Core", () => {
  const defaultLevel: LevelConfig = {
    grid: { width: 5, height: 3 },
    start: { x: 0, y: 0, direction: "EAST" },
    goal: { x: 4, y: 2 },
    obstacles: [
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 2, y: 1 },
      { x: 4, y: 1 },
    ],
    availableBlocks: ["MOVE", "TURN_LEFT", "TURN_RIGHT"],
    maxActions: 12,
  };

  describe("Initialization & Level Validation", () => {
    it("should initialize with correct initial BotiState and IDLE execution state", () => {
      const engine = new GameEngine(defaultLevel);
      expect(engine.getState()).toEqual({
        position: { x: 0, y: 0 },
        direction: "EAST",
      });
      expect(engine.getExecutionState()).toBe("IDLE");
      expect(engine.getCollisions()).toBe(0);
      expect(engine.getActionsExecuted()).toBe(0);
      expect(engine.getEvents()).toEqual([]);
    });

    it("should reject invalid level config on construction", () => {
      expect(
        () =>
          new GameEngine({
            ...defaultLevel,
            grid: { width: -1, height: 3 },
          })
      ).toThrowError(InvalidLevelConfigError);
    });
  });

  describe("Movement in all directions", () => {
    const openGridLevel: LevelConfig = {
      grid: { width: 5, height: 5 },
      start: { x: 2, y: 2, direction: "EAST" },
      goal: { x: 4, y: 4 },
      obstacles: [],
      availableBlocks: ["MOVE", "TURN_LEFT", "TURN_RIGHT"],
      maxActions: 20,
    };

    it("should MOVE to EAST correctly (x increases)", () => {
      const engine = new GameEngine({
        ...openGridLevel,
        start: { x: 2, y: 2, direction: "EAST" },
      });
      const result = engine.step("MOVE");

      expect(result.currentState.position).toEqual({ x: 3, y: 2 });
      expect(result.currentState.direction).toBe("EAST");
      expect(result.event.type).toBe("ACTION_EXECUTED");
    });

    it("should MOVE to NORTH correctly (y decreases)", () => {
      const engine = new GameEngine({
        ...openGridLevel,
        start: { x: 2, y: 2, direction: "NORTH" },
      });
      const result = engine.step("MOVE");

      expect(result.currentState.position).toEqual({ x: 2, y: 1 });
      expect(result.currentState.direction).toBe("NORTH");
      expect(result.event.type).toBe("ACTION_EXECUTED");
    });

    it("should MOVE to SOUTH correctly (y increases)", () => {
      const engine = new GameEngine({
        ...openGridLevel,
        start: { x: 2, y: 2, direction: "SOUTH" },
      });
      const result = engine.step("MOVE");

      expect(result.currentState.position).toEqual({ x: 2, y: 3 });
      expect(result.currentState.direction).toBe("SOUTH");
      expect(result.event.type).toBe("ACTION_EXECUTED");
    });

    it("should MOVE to WEST correctly (x decreases)", () => {
      const engine = new GameEngine({
        ...openGridLevel,
        start: { x: 2, y: 2, direction: "WEST" },
      });
      const result = engine.step("MOVE");

      expect(result.currentState.position).toEqual({ x: 1, y: 2 });
      expect(result.currentState.direction).toBe("WEST");
      expect(result.event.type).toBe("ACTION_EXECUTED");
    });
  });

  describe("Rotation (TURN_LEFT and TURN_RIGHT)", () => {
    const rotationLevel: LevelConfig = {
      grid: { width: 3, height: 3 },
      start: { x: 1, y: 1, direction: "NORTH" },
      goal: { x: 2, y: 2 },
      obstacles: [],
      availableBlocks: ["TURN_LEFT", "TURN_RIGHT"],
      maxActions: 10,
    };

    it("TURN_RIGHT should cycle NORTH -> EAST -> SOUTH -> WEST -> NORTH without changing position", () => {
      const engine = new GameEngine(rotationLevel);
      const initialPos = { x: 1, y: 1 };

      engine.step("TURN_RIGHT");
      expect(engine.getState()).toEqual({ position: initialPos, direction: "EAST" });

      engine.step("TURN_RIGHT");
      expect(engine.getState()).toEqual({ position: initialPos, direction: "SOUTH" });

      engine.step("TURN_RIGHT");
      expect(engine.getState()).toEqual({ position: initialPos, direction: "WEST" });

      engine.step("TURN_RIGHT");
      expect(engine.getState()).toEqual({ position: initialPos, direction: "NORTH" });
    });

    it("TURN_LEFT should cycle NORTH -> WEST -> SOUTH -> EAST -> NORTH without changing position", () => {
      const engine = new GameEngine(rotationLevel);
      const initialPos = { x: 1, y: 1 };

      engine.step("TURN_LEFT");
      expect(engine.getState()).toEqual({ position: initialPos, direction: "WEST" });

      engine.step("TURN_LEFT");
      expect(engine.getState()).toEqual({ position: initialPos, direction: "SOUTH" });

      engine.step("TURN_LEFT");
      expect(engine.getState()).toEqual({ position: initialPos, direction: "EAST" });

      engine.step("TURN_LEFT");
      expect(engine.getState()).toEqual({ position: initialPos, direction: "NORTH" });
    });
  });

  describe("Collisions", () => {
    it("Obstacle collision must NOT change position and emit OBSTACLE_COLLISION", () => {
      const engine = new GameEngine(defaultLevel); // start at (0, 0), facing EAST. Obstacle at (2,0)
      // (0,0) -> MOVE -> (1,0) -> facing EAST, obstacle at (2,0)
      engine.step("MOVE");
      expect(engine.getState().position).toEqual({ x: 1, y: 0 });

      // Move into obstacle at (2, 0)
      const stepResult = engine.step("MOVE");

      expect(stepResult.currentState.position).toEqual({ x: 1, y: 0 }); // Position unchanged!
      expect(stepResult.event.type).toBe("OBSTACLE_COLLISION");
      expect(engine.getCollisions()).toBe(1);
    });

    it("Boundary collision must NOT change position and emit BOUNDARY_COLLISION", () => {
      const engine = new GameEngine(defaultLevel); // start at (0, 0), facing EAST
      // Turn to NORTH and try to move out of top boundary (y: -1)
      engine.step("TURN_LEFT"); // facing NORTH
      expect(engine.getState().direction).toBe("NORTH");

      const stepResult = engine.step("MOVE");

      expect(stepResult.currentState.position).toEqual({ x: 0, y: 0 }); // Position unchanged!
      expect(stepResult.event.type).toBe("BOUNDARY_COLLISION");
      expect(engine.getCollisions()).toBe(1);
    });

    it("West boundary collision (x < 0) does not change position", () => {
      const engine = new GameEngine({
        ...defaultLevel,
        start: { x: 0, y: 0, direction: "WEST" },
      });

      const stepResult = engine.step("MOVE");
      expect(stepResult.currentState.position).toEqual({ x: 0, y: 0 });
      expect(stepResult.event.type).toBe("BOUNDARY_COLLISION");
      expect(engine.getCollisions()).toBe(1);
    });
  });

  describe("Goal detection & execution termination", () => {
    const simpleLevel: LevelConfig = {
      grid: { width: 3, height: 1 },
      start: { x: 0, y: 0, direction: "EAST" },
      goal: { x: 2, y: 0 },
      obstacles: [],
      availableBlocks: ["MOVE"],
      maxActions: 5,
    };

    it("should reach goal and stop execution immediately", () => {
      const engine = new GameEngine(simpleLevel);

      // Execute sequence with extra moves after reaching goal: MOVE, MOVE, MOVE, MOVE
      const result = engine.execute(["MOVE", "MOVE", "MOVE", "MOVE"]);

      expect(result.status).toBe("SUCCESS");
      expect(result.completed).toBe(true);
      expect(result.finalPosition).toEqual({ x: 2, y: 0 });
      // Only 2 actions were needed to reach goal; extra actions must NOT be executed!
      expect(result.actionsExecuted).toBe(2);
      expect(engine.getExecutionState()).toBe("SUCCESS");
    });

    it("subsequent step() calls after SUCCESS should be no-ops", () => {
      const engine = new GameEngine(simpleLevel);
      engine.step("MOVE");
      engine.step("MOVE"); // Goal reached here

      expect(engine.getExecutionState()).toBe("SUCCESS");

      // Attempting step after goal
      const afterGoal = engine.step("MOVE");
      expect(afterGoal.currentState.position).toEqual({ x: 2, y: 0 });
      expect(afterGoal.executionState).toBe("SUCCESS");
    });
  });

  describe("Reset Functionality", () => {
    it("reset() should restore initial position, direction, and clear counters", () => {
      const engine = new GameEngine(defaultLevel);

      // Perform moves and turns
      engine.step("MOVE");
      engine.step("TURN_RIGHT");
      engine.step("MOVE"); // might hit obstacle or boundary

      expect(engine.getActionsExecuted()).toBeGreaterThan(0);

      // Reset
      engine.reset();

      expect(engine.getState()).toEqual({
        position: { x: defaultLevel.start.x, y: defaultLevel.start.y },
        direction: defaultLevel.start.direction,
      });
      expect(engine.getExecutionState()).toBe("IDLE");
      expect(engine.getCollisions()).toBe(0);
      expect(engine.getActionsExecuted()).toBe(0);
      expect(engine.getEvents()).toHaveLength(1);
      expect(engine.getEvents()[0]!.type).toBe("RESET");
    });
  });

  describe("Max Actions Limit", () => {
    const limitedLevel: LevelConfig = {
      grid: { width: 5, height: 5 },
      start: { x: 0, y: 0, direction: "EAST" },
      goal: { x: 4, y: 4 },
      obstacles: [],
      availableBlocks: ["MOVE", "TURN_RIGHT"],
      maxActions: 3,
    };

    it("should terminate with FAILED when maxActions is reached without reaching goal", () => {
      const engine = new GameEngine(limitedLevel);

      // Provide 10 actions, but maxActions is 3
      const result = engine.execute([
        "MOVE",
        "MOVE",
        "MOVE",
        "MOVE",
        "MOVE",
        "MOVE",
      ]);

      expect(result.status).toBe("FAILED");
      expect(result.completed).toBe(false);
      expect(result.actionsExecuted).toBe(3);
      expect(engine.getExecutionState()).toBe("FAILED");

      const events = engine.getEvents();
      const lastEvent = events[events.length - 1];
      expect(lastEvent?.type).toBe("MAX_ACTIONS_REACHED");
    });
  });

  describe("Batch execution (execute)", () => {
    it("should return FAILED if all actions executed but goal is not reached", () => {
      const engine = new GameEngine(defaultLevel);

      const result = engine.execute(["MOVE", "TURN_RIGHT"]);

      expect(result.status).toBe("FAILED");
      expect(result.completed).toBe(false);
      expect(result.actionsExecuted).toBe(2);
      expect(result.finalPosition).toEqual({ x: 1, y: 0 });
    });

    it("should solve a complete maze with obstacles and turns", () => {
      // Setup a level with a clear valid path
      const mazeLevel: LevelConfig = {
        grid: { width: 3, height: 3 },
        start: { x: 0, y: 0, direction: "EAST" },
        goal: { x: 2, y: 2 },
        obstacles: [
          { x: 1, y: 0 }, // blocking top row
          { x: 1, y: 2 }, // blocking bottom row
        ],
        availableBlocks: ["MOVE", "TURN_LEFT", "TURN_RIGHT"],
        maxActions: 10,
      };

      // Valid path:
      // Turn SOUTH, MOVE to (0,1), Turn EAST, MOVE to (1,1), MOVE to (2,1), Turn SOUTH, MOVE to (2,2)
      const solution: LevelConfig["availableBlocks"] = [
        "TURN_RIGHT", // facing SOUTH
        "MOVE",       // -> (0, 1)
        "TURN_LEFT",  // facing EAST
        "MOVE",       // -> (1, 1)
        "MOVE",       // -> (2, 1)
        "TURN_RIGHT", // facing SOUTH
        "MOVE",       // -> (2, 2) [GOAL]
      ];

      const engine = new GameEngine(mazeLevel);
      const result = engine.execute(solution);

      expect(result.status).toBe("SUCCESS");
      expect(result.completed).toBe(true);
      expect(result.actionsExecuted).toBe(7);
      expect(result.collisions).toBe(0);
      expect(result.finalPosition).toEqual({ x: 2, y: 2 });
    });

    it("handles start position already at goal", () => {
      const startAtGoalLevel: LevelConfig = {
        grid: { width: 3, height: 3 },
        start: { x: 1, y: 1, direction: "EAST" },
        goal: { x: 1, y: 1 },
        obstacles: [],
        availableBlocks: ["MOVE"],
        maxActions: 5,
      };

      const engine = new GameEngine(startAtGoalLevel);
      const result = engine.execute(["MOVE"]);

      expect(result.status).toBe("SUCCESS");
      expect(result.completed).toBe(true);
      expect(result.actionsExecuted).toBe(0);
    });
  });
});
