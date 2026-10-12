import { describe, expect, it } from "vitest";
import { GameController } from "@/game/execution";
import { LEVEL_1_1 } from "@/game/levels";
import type { GameAction, StepResult } from "@/game";

describe("GameController Integration", () => {
  it("initializes with Level 1.1 initial state", () => {
    const controller = new GameController(LEVEL_1_1);
    expect(controller.getStatus()).toBe("IDLE");
    expect(controller.getState()).toEqual({
      position: { x: 0, y: 1 },
      direction: "EAST",
    });
    expect(controller.getCollisions()).toBe(0);
    expect(controller.getActionsExecuted()).toBe(0);
  });

  it("RUN executes program via Game Engine and reaches goal in Level 1.1", async () => {
    const controller = new GameController(LEVEL_1_1);
    const stepStates: StepResult[] = [];

    controller.setCallbacks({
      onStep: (step) => {
        stepStates.push(step);
      },
    });

    const actions: GameAction[] = ["MOVE", "MOVE", "MOVE", "MOVE"];
    const result = await controller.run(actions, { stepDelayMs: 0 });

    expect(result.status).toBe("SUCCESS");
    expect(result.completed).toBe(true);
    expect(result.actionsExecuted).toBe(4);
    expect(result.collisions).toBe(0);
    expect(result.finalPosition).toEqual({ x: 4, y: 1 });
    expect(controller.getState()).toEqual({
      position: { x: 4, y: 1 },
      direction: "EAST",
    });

    // Check step positions progression: (1,1) -> (2,1) -> (3,1) -> (4,1)
    expect(stepStates.length).toBe(4);
    expect(stepStates[0].currentState.position).toEqual({ x: 1, y: 1 });
    expect(stepStates[1].currentState.position).toEqual({ x: 2, y: 1 });
    expect(stepStates[2].currentState.position).toEqual({ x: 3, y: 1 });
    expect(stepStates[3].currentState.position).toEqual({ x: 4, y: 1 });
    expect(stepStates[3].executionState).toBe("SUCCESS");
  });

  it("stops execution immediately when goal is reached even with extra blocks", async () => {
    const controller = new GameController(LEVEL_1_1);
    // 6 MOVEs, but goal is at 4 MOVEs
    const actions: GameAction[] = ["MOVE", "MOVE", "MOVE", "MOVE", "MOVE", "MOVE"];
    const result = await controller.run(actions, { stepDelayMs: 0 });

    expect(result.status).toBe("SUCCESS");
    expect(result.actionsExecuted).toBe(4); // stopped at 4
    expect(controller.getState().position).toEqual({ x: 4, y: 1 });
  });

  it("RESET halts running execution and restores initial level state", async () => {
    const controller = new GameController(LEVEL_1_1);

    // Run actions with slight delay
    const runPromise = controller.run(["MOVE", "MOVE", "MOVE", "MOVE"], { stepDelayMs: 50 });

    // Immediately trigger RESET
    controller.reset();
    await runPromise;

    expect(controller.getStatus()).toBe("IDLE");
    expect(controller.getState()).toEqual({
      position: { x: 0, y: 1 },
      direction: "EAST",
    });
    expect(controller.getCollisions()).toBe(0);
    expect(controller.getActionsExecuted()).toBe(0);
  });

  it("handles boundary collision and marks FAILED without crashing", async () => {
    // Starting at (0, 1) facing WEST would collide with boundary
    const controller = new GameController({
      ...LEVEL_1_1,
      start: { x: 0, y: 1, direction: "WEST" },
      availableBlocks: ["MOVE"],
    });

    const result = await controller.run(["MOVE"], { stepDelayMs: 0 });

    expect(result.status).toBe("FAILED");
    expect(result.collisions).toBe(1);
    expect(controller.getState().position).toEqual({ x: 0, y: 1 }); // Position unchanged on collision
  });
});
