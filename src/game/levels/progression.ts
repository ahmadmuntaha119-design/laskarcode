import { getAllLevels, getLevelByCode } from "./catalog";
import type { LevelDefinition } from "./types";

export type LevelRecordStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type LevelComputedStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";

export type LevelProgress = {
  status: LevelRecordStatus;
  stars: number;
  bestAttempts?: number;
};

export type LevelStatusSummary = {
  code: string;
  recordStatus: LevelRecordStatus;
  computedStatus: LevelComputedStatus;
  isAvailable: boolean;
  isLocked: boolean;
  isCompleted: boolean;
  stars: number;
};

/**
 * Checks whether a level is unlocked based on prerequisites.
 * Level 1.1 is unlocked by default.
 * Subsequent levels require the previous level (orderIndex - 1) to be COMPLETED.
 */
export function isLevelUnlocked(
  code: string,
  completedCodes: ReadonlySet<string> | readonly string[]
): boolean {
  const level = getLevelByCode(code);
  if (!level) return false;

  // First level is always unlocked
  if (level.orderIndex === 1) {
    return true;
  }

  // Find prerequisite level (orderIndex - 1)
  const allLevels = getAllLevels();
  const prevLevel = allLevels.find((l) => l.orderIndex === level.orderIndex - 1);
  if (!prevLevel) return true;

  const set = completedCodes instanceof Set ? completedCodes : new Set(completedCodes);
  return set.has(prevLevel.code);
}

/**
 * Computes runtime presentation status (LOCKED / AVAILABLE / IN_PROGRESS / COMPLETED)
 * without persisting LOCKED or AVAILABLE as permanent database statuses.
 */
export function computeLevelSummary(
  level: LevelDefinition,
  progressMap: Record<string, LevelProgress>
): LevelStatusSummary {
  const record = progressMap[level.code] ?? {
    status: "NOT_STARTED",
    stars: 0,
  };

  const completedCodes = new Set(
    Object.entries(progressMap)
      .filter(([, p]) => p.status === "COMPLETED")
      .map(([code]) => code)
  );

  const unlocked = isLevelUnlocked(level.code, completedCodes);
  const isCompleted = record.status === "COMPLETED";

  let computedStatus: LevelComputedStatus;
  if (isCompleted) {
    computedStatus = "COMPLETED";
  } else if (!unlocked) {
    computedStatus = "LOCKED";
  } else if (record.status === "IN_PROGRESS") {
    computedStatus = "IN_PROGRESS";
  } else {
    computedStatus = "AVAILABLE";
  }

  return {
    code: level.code,
    recordStatus: record.status,
    computedStatus,
    isAvailable: unlocked,
    isLocked: !unlocked,
    isCompleted,
    stars: record.stars,
  };
}
