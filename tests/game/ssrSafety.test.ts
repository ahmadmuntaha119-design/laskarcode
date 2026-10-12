import { describe, expect, it } from "vitest";
import { GameEngine } from "@/game/engine";
import { BlocklyParser, createToolbox } from "@/game/parser";
import { GameController } from "@/game/execution";
import { LEVEL_1_1 } from "@/game/levels";

describe("SSR Safety Check", () => {
  it("ensures game logic, parser, and controller do not access window or document", () => {
    // In Node.js testing environment, window is undefined
    const isWindowUndefined = typeof window === "undefined";
    expect(isWindowUndefined).toBe(true);

    // Instantiating GameEngine on server
    const engine = new GameEngine(LEVEL_1_1);
    expect(engine.getState().position).toEqual({ x: 0, y: 1 });

    // Instantiating GameController on server
    const controller = new GameController(LEVEL_1_1);
    expect(controller.getStatus()).toBe("IDLE");

    // Generating toolbox on server
    const toolbox = createToolbox(LEVEL_1_1.availableBlocks);
    expect(toolbox).toBeDefined();

    // Parsing block sequences on server
    const parseResult = BlocklyParser.parseBlockSequence(["MOVE", "MOVE"]);
    expect(parseResult.success).toBe(true);
  });
});
