"use client";

import React from "react";
import { Play, RotateCcw } from "lucide-react";
import type { ControllerStatus } from "@/game/execution";

export type GameControlsProps = {
  status: ControllerStatus;
  onRun: () => void;
  onReset: () => void;
  actionsExecuted: number;
  maxActions: number;
  disabled?: boolean;
};

export function GameControls({
  status,
  onRun,
  onReset,
  actionsExecuted,
  maxActions,
  disabled = false,
}: GameControlsProps) {
  const isRunning = status === "RUNNING";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          id="btn-game-run"
          type="button"
          onClick={onRun}
          disabled={isRunning || disabled}
          className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white shadow-md transition-all active:scale-95 ${
            isRunning || disabled
              ? "cursor-not-allowed bg-slate-300 shadow-none"
              : "bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-200"
          }`}
        >
          <Play className="h-5 w-5 fill-current" />
          <span>{isRunning ? "Menjalankan..." : "JALANKAN (RUN)"}</span>
        </button>

        <button
          id="btn-game-reset"
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-5 py-3 font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95"
        >
          <RotateCcw className="h-5 w-5" />
          <span>RESET</span>
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
        <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5">
          <span>Langkah:</span>
          <span className="font-bold text-slate-900">
            {actionsExecuted} / {maxActions}
          </span>
        </div>
      </div>
    </div>
  );
}

export default GameControls;
