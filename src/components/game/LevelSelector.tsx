"use client";

import React, { useState } from "react";
import { CheckCircle2, Lock, Play, Sparkles } from "lucide-react";
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
    <div className={`flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {/* Island Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {islands.map((island) => {
          const isActive = island.slug === selectedIslandSlug;
          return (
            <button
              key={island.id}
              type="button"
              onClick={() => setSelectedIslandSlug(island.slug)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs md:text-sm font-bold transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{island.name}</span>
            </button>
          );
        })}
      </div>

      {/* Island Description */}
      <div className="text-xs text-slate-500">
        <p>{activeIsland.description}</p>
      </div>

      {/* Level Grid / List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
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
              className={`relative flex flex-col items-center justify-between rounded-xl p-3 text-center transition-all ${
                isCurrent
                  ? "border-2 border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-200"
                  : isCompleted
                  ? "border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60"
                  : isLocked
                  ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 opacity-60"
                  : "border border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50"
              }`}
            >
              {/* Top indicator: Star or Lock or Play */}
              <div className="mb-1 flex items-center justify-center">
                {isCompleted ? (
                  <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                    <Sparkles className="h-3.5 w-3.5 fill-current" />
                    <span>{summary.stars}★</span>
                  </span>
                ) : isLocked ? (
                  <Lock className="h-4 w-4 text-slate-400" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-emerald-600 fill-current" />
                )}
              </div>

              {/* Level Code */}
              <span className="text-sm font-extrabold text-slate-800">
                {level.code}
              </span>

              {/* Title Truncated */}
              <span className="line-clamp-1 mt-0.5 text-[11px] font-medium text-slate-500">
                {level.title}
              </span>

              {/* Completion checkmark */}
              {isCompleted && (
                <div className="absolute -top-1.5 -right-1.5 rounded-full bg-emerald-500 p-0.5 text-white shadow">
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
