import { create } from "zustand";
import { getAllLevels, getLevelByCode, getNextLevel } from "./catalog";
import {
  computeLevelSummary,
  isLevelUnlocked,
  type LevelProgress,
  type LevelStatusSummary,
} from "./progression";
import type { LevelDefinition } from "./types";

export type ProgressionState = {
  activeLevelCode: string;
  progress: Record<string, LevelProgress>;
  setActiveLevelCode: (code: string) => boolean;
  completeLevel: (code: string, stars?: number) => void;
  markInProgress: (code: string) => void;
  getActiveLevel: () => LevelDefinition;
  getLevelSummary: (code: string) => LevelStatusSummary | null;
  getNextLevelCode: (currentCode: string) => string | null;
  resetProgress: () => void;
};

const INITIAL_PROGRESS: Record<string, LevelProgress> = {
  "1.1": {
    status: "NOT_STARTED",
    stars: 0,
  },
};

export const useProgressionStore = create<ProgressionState>((set, get) => ({
  activeLevelCode: "1.1",
  progress: INITIAL_PROGRESS,

  setActiveLevelCode: (code: string) => {
    const level = getLevelByCode(code);
    if (!level) return false;

    const completedCodes = new Set(
      Object.entries(get().progress)
        .filter(([, p]) => p.status === "COMPLETED")
        .map(([c]) => c)
    );

    // Only allow selection if level is unlocked
    if (!isLevelUnlocked(code, completedCodes)) {
      return false;
    }

    set({ activeLevelCode: code });
    get().markInProgress(code);
    return true;
  },

  completeLevel: (code: string, stars = 1) => {
    set((state) => {
      const prev = state.progress[code];
      const newStars = Math.max(prev?.stars ?? 0, stars);
      return {
        progress: {
          ...state.progress,
          [code]: {
            status: "COMPLETED",
            stars: newStars,
            bestAttempts: (prev?.bestAttempts ?? 0) + 1,
          },
        },
      };
    });
  },

  markInProgress: (code: string) => {
    set((state) => {
      const current = state.progress[code];
      if (current?.status === "COMPLETED") {
        return state; // Preserve COMPLETED status
      }
      return {
        progress: {
          ...state.progress,
          [code]: {
            status: "IN_PROGRESS",
            stars: current?.stars ?? 0,
          },
        },
      };
    });
  },

  getActiveLevel: () => {
    const code = get().activeLevelCode;
    return getLevelByCode(code) ?? getAllLevels()[0];
  },

  getLevelSummary: (code: string) => {
    const level = getLevelByCode(code);
    if (!level) return null;
    return computeLevelSummary(level, get().progress);
  },

  getNextLevelCode: (currentCode: string) => {
    const next = getNextLevel(currentCode);
    return next ? next.code : null;
  },

  resetProgress: () => {
    set({
      activeLevelCode: "1.1",
      progress: INITIAL_PROGRESS,
    });
  },
}));
