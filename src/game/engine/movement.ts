import type { Direction, Position } from "../types/game";

export const DIRECTION_DELTAS: Record<Direction, Position> = {
  NORTH: { x: 0, y: -1 },
  EAST: { x: 1, y: 0 },
  SOUTH: { x: 0, y: 1 },
  WEST: { x: -1, y: 0 },
};

/**
 * Returns displacement delta (dx, dy) for a given direction.
 * x increases to the right, y increases downward.
 */
export function getDeltaForDirection(direction: Direction): Position {
  return DIRECTION_DELTAS[direction];
}

/**
 * Calculates candidate position if moving 1 tile forward in current direction.
 */
export function getNextPosition(
  current: Position,
  direction: Direction
): Position {
  const delta = getDeltaForDirection(direction);
  return {
    x: current.x + delta.x,
    y: current.y + delta.y,
  };
}
