import type { Direction } from "../types/game";

const CLOCKWISE_ORDER: readonly Direction[] = [
  "NORTH",
  "EAST",
  "SOUTH",
  "WEST",
] as const;

/**
 * Rotates direction 90 degrees clockwise (TURN_RIGHT)
 * NORTH -> EAST -> SOUTH -> WEST -> NORTH
 */
export function rotateRight(direction: Direction): Direction {
  const currentIndex = CLOCKWISE_ORDER.indexOf(direction);
  const nextIndex = (currentIndex + 1) % CLOCKWISE_ORDER.length;
  return CLOCKWISE_ORDER[nextIndex]!;
}

/**
 * Rotates direction 90 degrees counter-clockwise (TURN_LEFT)
 * NORTH -> WEST -> SOUTH -> EAST -> NORTH
 */
export function rotateLeft(direction: Direction): Direction {
  const currentIndex = CLOCKWISE_ORDER.indexOf(direction);
  const nextIndex =
    (currentIndex - 1 + CLOCKWISE_ORDER.length) % CLOCKWISE_ORDER.length;
  return CLOCKWISE_ORDER[nextIndex]!;
}

/**
 * Rotates direction based on turn action
 */
export function rotate(
  direction: Direction,
  action: "TURN_LEFT" | "TURN_RIGHT"
): Direction {
  return action === "TURN_RIGHT"
    ? rotateRight(direction)
    : rotateLeft(direction);
}
