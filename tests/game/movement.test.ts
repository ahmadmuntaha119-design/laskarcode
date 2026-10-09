import { describe, expect, it } from "vitest";
import {
  DIRECTION_DELTAS,
  getDeltaForDirection,
  getNextPosition,
} from "@/game/engine/movement";
import type { Position } from "@/game/types/game";

describe("Movement Engine", () => {
  describe("Direction Deltas", () => {
    it("should have correct delta for NORTH (dx=0, dy=-1)", () => {
      expect(getDeltaForDirection("NORTH")).toEqual({ x: 0, y: -1 });
    });

    it("should have correct delta for EAST (dx=1, dy=0)", () => {
      expect(getDeltaForDirection("EAST")).toEqual({ x: 1, y: 0 });
    });

    it("should have correct delta for SOUTH (dx=0, dy=1)", () => {
      expect(getDeltaForDirection("SOUTH")).toEqual({ x: 0, y: 1 });
    });

    it("should have correct delta for WEST (dx=-1, dy=0)", () => {
      expect(getDeltaForDirection("WEST")).toEqual({ x: -1, y: 0 });
    });

    it("should expose DIRECTION_DELTAS mapping directly", () => {
      expect(DIRECTION_DELTAS.EAST).toEqual({ x: 1, y: 0 });
    });
  });

  describe("getNextPosition", () => {
    const origin: Position = { x: 2, y: 2 };

    it("should move EAST: x increases by 1", () => {
      expect(getNextPosition(origin, "EAST")).toEqual({ x: 3, y: 2 });
    });

    it("should move NORTH: y decreases by 1", () => {
      expect(getNextPosition(origin, "NORTH")).toEqual({ x: 2, y: 1 });
    });

    it("should move SOUTH: y increases by 1", () => {
      expect(getNextPosition(origin, "SOUTH")).toEqual({ x: 2, y: 3 });
    });

    it("should move WEST: x decreases by 1", () => {
      expect(getNextPosition(origin, "WEST")).toEqual({ x: 1, y: 2 });
    });
  });
});
