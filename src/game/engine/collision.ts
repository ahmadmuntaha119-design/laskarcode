import type { Position } from "../types/game";
import type { GridSize } from "../types/level";

export type CollisionResult = "BOUNDARY" | "OBSTACLE" | "NONE";

/**
 * Checks whether position is outside the grid bounds.
 * Valid coordinates are: 0 <= x < grid.width and 0 <= y < grid.height
 */
export function isOutOfBounds(position: Position, grid: GridSize): boolean {
  return (
    position.x < 0 ||
    position.x >= grid.width ||
    position.y < 0 ||
    position.y >= grid.height
  );
}

/**
 * Checks whether position matches any obstacle in the list.
 */
export function isObstacle(
  position: Position,
  obstacles: readonly Position[]
): boolean {
  return obstacles.some((o) => o.x === position.x && o.y === position.y);
}

/**
 * Checks candidate position for collisions:
 * - Checks boundary first
 * - Checks obstacles next
 * - Returns "NONE" if clear
 */
export function checkCollision(
  target: Position,
  grid: GridSize,
  obstacles: readonly Position[]
): CollisionResult {
  if (isOutOfBounds(target, grid)) {
    return "BOUNDARY";
  }

  if (isObstacle(target, obstacles)) {
    return "OBSTACLE";
  }

  return "NONE";
}
