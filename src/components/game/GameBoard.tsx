"use client";

import React, { useEffect, useRef } from "react";
import type { BotiState, LevelConfig } from "@/game/types";
import { CanvasRenderer, type RenderOptions } from "@/game/renderer";

export type GameBoardProps = {
  levelConfig: LevelConfig;
  botiState: BotiState;
  renderOptions?: RenderOptions;
  onRendererReady?: (renderer: CanvasRenderer) => void;
  className?: string;
};

export function GameBoard({
  levelConfig,
  botiState,
  renderOptions = {},
  onRendererReady,
  className = "",
}: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new CanvasRenderer(canvas, levelConfig);
    rendererRef.current = renderer;
    onRendererReady?.(renderer);

    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [levelConfig, onRendererReady]);

  // Re-render when botiState or renderOptions changes
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.render(botiState, renderOptions);
    }
  }, [botiState, renderOptions]);

  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-[#E8EDF5] bg-white p-3 shadow-xs ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="max-h-115 w-full rounded-2xl touch-none select-none"
      />
    </div>
  );
}

export default GameBoard;
