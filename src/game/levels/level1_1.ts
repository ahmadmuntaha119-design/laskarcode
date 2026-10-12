import type { LevelConfig } from "../types/level";

/**
 * Level 1.1 — Boti Mau Maju
 * Pulau 1: Desa Boti
 * Konsep: Instruction / MOVE
 */
export const LEVEL_1_1: LevelConfig = {
  grid: {
    width: 5,
    height: 3,
  },
  start: {
    x: 0,
    y: 1,
    direction: "EAST",
  },
  goal: {
    x: 4,
    y: 1,
  },
  obstacles: [],
  availableBlocks: ["MOVE"],
  maxActions: 10,
};
