import { getAllLevels, getIslandBySlug, getLevelByCode } from "./catalog";
import type { IslandDefinition, LevelDefinition } from "./types";

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

/**
 * Menghitung perolehan bintang permainan secara objektif:
 * - 0 Bintang: Tidak berhasil mencapai target.
 * - 1 Bintang: Berhasil mencapai goal target.
 * - 2 Bintang: Berhasil tanpa collision (menabrak rintangan atau batas grid).
 * - 3 Bintang: Berhasil tanpa collision dan dengan langkah yang efisien (<= 75% maxActions).
 */
export function calculateStars(
  successful: boolean,
  actionsUsed: number,
  collisions: number,
  maxActions: number
): number {
  if (!successful) return 0;

  let stars = 1;
  if (collisions === 0) {
    stars += 1;
  }
  if (collisions === 0 && actionsUsed <= Math.ceil(maxActions * 0.75)) {
    stars += 1;
  }

  return Math.min(3, Math.max(1, stars));
}

/**
 * Returns a set of level codes that have been COMPLETED.
 */
export function getCompletedCodes(
  progressMap: Record<string, LevelProgress>
): Set<string> {
  return new Set(
    Object.entries(progressMap)
      .filter(([, p]) => p.status === "COMPLETED")
      .map(([code]) => code)
  );
}

export type IslandStatus = "LOCKED" | "AVAILABLE" | "EXPLORING" | "COMPLETED";

export type IslandProgressSummary = {
  island: IslandDefinition;
  status: IslandStatus;
  completedLevels: number;
  totalLevels: number;
  earnedStars: number;
  maxStars: number;
  isLocked: boolean;
  isCompleted: boolean;
  activeLevelCode: string;
};

/**
 * Determines whether an island is unlocked based on prerequisites.
 * Island 1 (Desa Boti) is always unlocked.
 * Island 2 (Hutan Pola) requires Level 1.6 to be COMPLETED.
 */
export function isIslandUnlocked(
  islandSlug: string,
  progressMap: Record<string, LevelProgress>
): boolean {
  if (islandSlug === "desa-boti") {
    return true;
  }
  if (islandSlug === "hutan-pola") {
    return progressMap["1.6"]?.status === "COMPLETED";
  }
  return false;
}

/**
 * Computes runtime progression summary for an island.
 */
export function getIslandSummary(
  islandSlug: string,
  progressMap: Record<string, LevelProgress>
): IslandProgressSummary | null {
  const island = getIslandBySlug(islandSlug);
  if (!island) return null;

  const unlocked = isIslandUnlocked(islandSlug, progressMap);
  const completedCodes = getCompletedCodes(progressMap);

  let completedLevels = 0;
  let earnedStars = 0;
  let firstPlayableCode: string | null = null;

  for (const code of island.levelCodes) {
    const record = progressMap[code];
    if (record?.status === "COMPLETED") {
      completedLevels++;
      earnedStars += record.stars || 0;
    } else if (!firstPlayableCode && isLevelUnlocked(code, completedCodes)) {
      firstPlayableCode = code;
    }
  }

  const totalLevels = island.levelCodes.length;
  const isCompleted = completedLevels === totalLevels;

  let status: IslandStatus;
  if (!unlocked) {
    status = "LOCKED";
  } else if (isCompleted) {
    status = "COMPLETED";
  } else if (
    completedLevels > 0 ||
    island.levelCodes.some((c: string) => progressMap[c]?.status === "IN_PROGRESS")
  ) {
    status = "EXPLORING";
  } else {
    status = "AVAILABLE";
  }

  const activeLevelCode =
    firstPlayableCode ||
    (isCompleted ? island.levelCodes[island.levelCodes.length - 1] : island.levelCodes[0]);

  return {
    island,
    status,
    completedLevels,
    totalLevels,
    earnedStars,
    maxStars: totalLevels * 3,
    isLocked: !unlocked,
    isCompleted,
    activeLevelCode,
  };
}

/**
 * Gets the next playable level for the player (for "Lanjut Petualangan" button).
 * Finds the first incomplete, unlocked level.
 * If all are completed, returns the final level ("2.6").
 */
export function getLatestPlayableLevel(
  progressMap: Record<string, LevelProgress>
): LevelDefinition {
  const allLevels = getAllLevels();
  const completed = getCompletedCodes(progressMap);

  for (const lvl of allLevels) {
    const record = progressMap[lvl.code];
    if (record?.status !== "COMPLETED" && isLevelUnlocked(lvl.code, completed)) {
      return lvl;
    }
  }

  return allLevels[allLevels.length - 1];
}

