"use client";

import React, { useState } from "react";
import { CheckCircle2, Lock, Play, Star } from "lucide-react";
import { getIslands, getLevelByCode } from "@/game/levels/catalog";
import { computeLevelSummary } from "@/game/levels/progression";
import { useProgressionStore } from "@/game/levels/store";

export type LevelSelectorProps = {
  currentLevelCode: string;
  onSelectLevel: (levelCode: string) => void;
  className?: string;
};

export function LevelSelector({
  currentLevelCode,
  onSelectLevel,
  className = "",
}: LevelSelectorProps) {
  const islands = getIslands();
  const [selectedIslandSlug, setSelectedIslandSlug] = useState<string>("desa-boti");
  const progress = useProgressionStore((state) => state.progress);

  const activeIsland = islands.find((i) => i.slug === selectedIslandSlug) ?? islands[0];

  return (
    <div className={`flex flex-col gap-3 rounded-3xl border border-[#E5DFD1] bg-white p-4 sm:p-5 shadow-sm ${className}`}>
      {/* Island Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5DFD1] pb-3">
        {islands.map((island) => {
          const isActive = island.slug === selectedIslandSlug;
          return (
            <button
              key={island.id}
              type="button"
              onClick={() => setSelectedIslandSlug(island.slug)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs md:text-sm font-bold transition-all cursor-pointer min-h-10 ${
                isActive
                  ? "bg-laskar-forest text-white shadow-xs"
                  : "bg-laskar-cream text-laskar-forest hover:bg-[#EFE9D9]"
              }`}
            >
              <span>{island.name}</span>
            </button>
          );
        })}
      </div>

      {/* Island Description */}
      <div className="text-xs text-[#5E726B]">
        <p>{activeIsland.description}</p>
      </div>

      {/* Level Grid / List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
        {activeIsland.levelCodes.map((code) => {
          const level = getLevelByCode(code);
          if (!level) return null;

          const summary = computeLevelSummary(level, progress);
          const isCurrent = code === currentLevelCode;
          const isLocked = summary.isLocked;
          const isCompleted = summary.isCompleted;

          return (
            <button
              key={code}
              type="button"
              disabled={isLocked}
              onClick={() => onSelectLevel(code)}
              className={`relative flex flex-col items-center justify-between rounded-2xl p-3 text-center transition-all min-h-23.75 cursor-pointer ${
                isCurrent
                  ? "border-2 border-laskar-forest bg-laskar-mint/40 shadow-xs ring-2 ring-laskar-botanical/50 scale-[1.02]"
                  : isCompleted
                  ? "border border-laskar-botanical bg-laskar-mint/25 hover:bg-laskar-mint/40"
                  : isLocked
                  ? "cursor-not-allowed border border-[#E5DFD1] bg-laskar-cream/60 text-slate-400 opacity-60"
                  : "border border-[#E5DFD1] bg-white hover:border-laskar-botanical hover:bg-laskar-cream/30"
              }`}
            >
              {/* Top indicator: Star or Lock or Play */}
              <div className="mb-1 flex items-center justify-center">
                {isCompleted ? (
                  <span className="flex items-center gap-0.5 text-xs font-bold text-[#B45309]">
                    <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#D97706]" />
                    <span>{summary.stars}</span>
                  </span>
                ) : isLocked ? (
                  <Lock className="h-4 w-4 text-slate-400" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-laskar-forest fill-current" />
                )}
              </div>

              {/* Level Code */}
              <span className="text-sm font-extrabold text-laskar-forest">
                {level.code}
              </span>

              {/* Title Truncated */}
              <span className="line-clamp-1 mt-0.5 text-[11px] font-medium text-[#5E726B]">
                {level.title}
              </span>

              {/* Completion checkmark */}
              {isCompleted && (
                <div className="absolute -top-1.5 -right-1.5 rounded-full bg-laskar-forest p-0.5 text-white shadow-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LevelSelector;
