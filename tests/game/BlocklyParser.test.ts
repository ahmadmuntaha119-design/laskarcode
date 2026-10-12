import { describe, expect, it } from "vitest";
import {
  BlocklyParser,
  type BlockLike,
  type WorkspaceLike,
} from "@/game/parser";

describe("BlocklyParser", () => {
  describe("parseBlockSequence", () => {
    it("preserves block execution order for valid sequence", () => {
      const result = BlocklyParser.parseBlockSequence(["boti_move", "boti_turn_right", "boti_move"]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.actions).toEqual(["MOVE", "TURN_RIGHT", "MOVE"]);
      }
    });

    it("accepts uppercase and custom action string aliases", () => {
      const result = BlocklyParser.parseBlockSequence(["MOVE", "TURN_LEFT", "TURN_RIGHT"]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.actions).toEqual(["MOVE", "TURN_LEFT", "TURN_RIGHT"]);
      }
    });

    it("handles empty block sequence safely", () => {
      const result = BlocklyParser.parseBlockSequence([]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("EMPTY_WORKSPACE");
      }
    });

    it("rejects blocks that are not in availableBlocks list", () => {
      const result = BlocklyParser.parseBlockSequence(["boti_move", "boti_turn_left"], {
        availableBlocks: ["MOVE"],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("UNAVAILABLE_BLOCK");
        expect(result.error.blockType).toBe("boti_turn_left");
      }
    });

    it("rejects unknown block types safely without throwing", () => {
      const result = BlocklyParser.parseBlockSequence(["boti_move", "unknown_alien_block"]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("UNKNOWN_BLOCK");
        expect(result.error.blockType).toBe("unknown_alien_block");
      }
    });
  });

  describe("parseWorkspace (with Workspace-like structure)", () => {
    function createMockBlock(type: string, next: BlockLike | null = null): BlockLike {
      return {
        type,
        getNextBlock: () => next,
      };
    }

    it("handles null or undefined workspace safely", () => {
      const result = BlocklyParser.parseWorkspace(null);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("EMPTY_WORKSPACE");
      }
    });

    it("handles workspace with 0 top blocks safely", () => {
      const emptyWorkspace: WorkspaceLike = {
        getTopBlocks: () => [],
      };
      const result = BlocklyParser.parseWorkspace(emptyWorkspace);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("EMPTY_WORKSPACE");
      }
    });

    it("traverses chained blocks down getNextBlock in sequential order", () => {
      const block4 = createMockBlock("boti_move", null);
      const block3 = createMockBlock("boti_move", block4);
      const block2 = createMockBlock("boti_move", block3);
      const block1 = createMockBlock("boti_move", block2);

      const mockWorkspace: WorkspaceLike = {
        getTopBlocks: () => [block1],
      };

      const result = BlocklyParser.parseWorkspace(mockWorkspace, {
        availableBlocks: ["MOVE"],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.actions).toEqual(["MOVE", "MOVE", "MOVE", "MOVE"]);
      }
    });

    it("rejects disconnected blocks when strictSingleStack is enabled", () => {
      const stack1 = createMockBlock("boti_move", null);
      const stack2 = createMockBlock("boti_move", null);

      const mockWorkspace: WorkspaceLike = {
        getTopBlocks: () => [stack1, stack2],
      };

      const result = BlocklyParser.parseWorkspace(mockWorkspace, {
        strictSingleStack: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("DISCONNECTED_BLOCKS");
      }
    });
  });
});
