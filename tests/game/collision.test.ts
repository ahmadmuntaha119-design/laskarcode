import { describe, expect, it } from "vitest";
import {
  checkCollision,
  isObstacle,
  isOutOfBounds,
} from "@/game/engine/collision";
import type { GridSize } from "@/game/types/level";
import type { Position } from "@/game/types/game";

describe("Collision Engine", () => {
  const grid: GridSize = { width: 5, height: 3 };
  const obstacles: Position[] = [
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 4, y: 1 },
  ];

  describe("Boundary checks (isOutOfBounds)", () => {
    it("should accept valid positions inside grid", () => {
      expect(isOutOfBounds({ x: 0, y: 0 }, grid)).toBe(false);
      expect(isOutOfBounds({ x: 4, y: 2 }, grid)).toBe(false);
      expect(isOutOfBounds({ x: 2, y: 1 }, grid)).toBe(false);
    });

    it("should detect negative x boundary violation", () => {
      expect(isOutOfBounds({ x: -1, y: 0 }, grid)).toBe(true);
    });

    it("should detect negative y boundary violation", () => {
      expect(isOutOfBounds({ x: 0, y: -1 }, grid)).toBe(true);
    });

    it("should detect x >= width boundary violation", () => {
      expect(isOutOfBounds({ x: 5, y: 0 }, grid)).toBe(true);
      expect(isOutOfBounds({ x: 6, y: 1 }, grid)).toBe(true);
    });

    it("should detect y >= height boundary violation", () => {
      expect(isOutOfBounds({ x: 0, y: 3 }, grid)).toBe(true);
      expect(isOutOfBounds({ x: 2, y: 4 }, grid)).toBe(true);
    });
  });

  describe("Obstacle checks (isObstacle)", () => {
    it("should detect configured obstacle positions", () => {
      expect(isObstacle({ x: 2, y: 0 }, obstacles)).toBe(true);
      expect(isObstacle({ x: 2, y: 1 }, obstacles)).toBe(true);
      expect(isObstacle({ x: 4, y: 1 }, obstacles)).toBe(true);
    });

    it("should return false for free tiles", () => {
      expect(isObstacle({ x: 0, y: 0 }, obstacles)).toBe(false);
      expect(isObstacle({ x: 1, y: 1 }, obstacles)).toBe(false);
      expect(isObstacle({ x: 3, y: 2 }, obstacles)).toBe(false);
    });
  });

  describe("Unified checkCollision", () => {
    it("should prioritize BOUNDARY when position is outside grid", () => {
      expect(checkCollision({ x: -1, y: 0 }, grid, obstacles)).toBe("BOUNDARY");
      expect(checkCollision({ x: 5, y: 2 }, grid, obstacles)).toBe("BOUNDARY");
    });

    it("should return OBSTACLE when hitting an obstacle within bounds", () => {
      expect(checkCollision({ x: 2, y: 0 }, grid, obstacles)).toBe("OBSTACLE");
      expect(checkCollision({ x: 4, y: 1 }, grid, obstacles)).toBe("OBSTACLE");
    });

    it("should return NONE for valid unblocked tiles", () => {
      expect(checkCollision({ x: 0, y: 0 }, grid, obstacles)).toBe("NONE");
      expect(checkCollision({ x: 1, y: 2 }, grid, obstacles)).toBe("NONE");
    });
  });
});
