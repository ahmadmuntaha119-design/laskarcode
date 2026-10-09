import { describe, expect, it } from "vitest";
import { isGoalReached } from "@/game/engine/goal";
import type { Position } from "@/game/types/game";

describe("Goal Detection", () => {
  const goal: Position = { x: 4, y: 2 };

  it("should return true when position exactly matches goal", () => {
    expect(isGoalReached({ x: 4, y: 2 }, goal)).toBe(true);
  });

  it("should return false when position differs on x", () => {
    expect(isGoalReached({ x: 3, y: 2 }, goal)).toBe(false);
  });

  it("should return false when position differs on y", () => {
    expect(isGoalReached({ x: 4, y: 1 }, goal)).toBe(false);
  });

  it("should return false when position is completely different", () => {
    expect(isGoalReached({ x: 0, y: 0 }, goal)).toBe(false);
  });
});
