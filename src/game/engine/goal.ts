import type { Position } from "../types/game";

/**
 * Checks whether current position matches the target goal position.
 */
export function isGoalReached(current: Position, goal: Position): boolean {
  return current.x === goal.x && current.y === goal.y;
}
