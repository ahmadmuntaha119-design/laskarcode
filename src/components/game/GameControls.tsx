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
    <div className="flex flex-wrap items-center justify-between gap-3.5 rounded-2xl border-2 border-[#E8EDF5] bg-white p-3.5 shadow-xs">
      <div className="flex items-center gap-2.5">
        <button
          id="btn-game-run"
          type="button"
          onClick={onRun}
          disabled={isRunning || disabled}
          className={`flex items-center gap-2 rounded-2xl px-6 py-3 font-black text-white transition-all min-h-12 cursor-pointer ${
            isRunning || disabled
              ? "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
              : "bg-[#12B886] hover:bg-[#0fa678] shadow-[0_4px_0_#087F5B] active:translate-y-1 active:shadow-none"
          }`}
        >
          <Play className="h-5 w-5 fill-current" />
          <span>{isRunning ? "Menjalankan..." : "Jalankan"}</span>
        </button>

        <button
          id="btn-game-reset"
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 rounded-2xl border-2 border-[#E8EDF5] bg-white px-5 py-3 font-bold text-[#26334D] shadow-[0_3px_0_#E8EDF5] transition-all hover:border-[#12B886]/40 hover:bg-slate-50 active:translate-y-0.5 active:shadow-none min-h-12 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4 text-[#64748B]" />
          <span>Mulai Ulang</span>
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
        <div className="flex items-center gap-1.5 rounded-2xl bg-[#12B886]/10 border border-[#12B886]/20 px-3.5 py-2 text-[#087F5B]">
          <span>Langkah:</span>
          <span className="font-black text-[#087F5B]">
            {actionsExecuted} / {maxActions}
          </span>
        </div>
      </div>
    </div>
  );
}

export default GameControls;

