"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as Blockly from "blockly";
import { Compass, Sparkles, Target } from "lucide-react";
import type { BotiState, LevelConfig } from "@/game/types";
import { BlocklyParser } from "@/game/parser";
import { type ControllerStatus, GameController } from "@/game/execution";
import type { RenderOptions } from "@/game/renderer";
import { GameBoard } from "./GameBoard";
import { BlocklyWorkspace } from "./BlocklyWorkspace";
import { GameControls } from "./GameControls";
import { FeedbackBanner } from "./FeedbackBanner";

export type LevelPlayerProps = {
  levelConfig: LevelConfig;
  title?: string;
  subtitle?: string;
  conceptBadge?: string;
  className?: string;
};

export function LevelPlayer({
  levelConfig,
  title = "Level 1.1 — Boti Mau Maju",
  subtitle = "Bantu Boti melangkah menuju target bintang!",
  conceptBadge = "Instruksi / Sequence",
  className = "",
}: LevelPlayerProps) {
  const controller = useMemo(() => new GameController(levelConfig), [levelConfig]);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  const [botiState, setBotiState] = useState<BotiState>(() => controller.getState());
  const [status, setStatus] = useState<ControllerStatus>("IDLE");
  const [renderOptions, setRenderOptions] = useState<RenderOptions>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionsExecuted, setActionsExecuted] = useState(0);
  const [collisions, setCollisions] = useState(0);

  // Setup controller callbacks
  useEffect(() => {
    controller.setCallbacks({
      onStep: (stepResult) => {
        setBotiState({ ...stepResult.currentState });
        setActionsExecuted(controller.getActionsExecuted());
        setCollisions(controller.getCollisions());

        const isCollision =
          stepResult.event.type === "BOUNDARY_COLLISION" ||
          stepResult.event.type === "OBSTACLE_COLLISION";
        const isGoal = stepResult.event.type === "GOAL_REACHED";

        setRenderOptions({
          isColliding: isCollision,
          isGoal: isGoal,
        });

        if (stepResult.executionState === "SUCCESS" || stepResult.executionState === "FAILED") {
          setStatus(stepResult.executionState);
        }
      },
      onComplete: (gameResult) => {
        setStatus(gameResult.status);
        setActionsExecuted(gameResult.actionsExecuted);
        setCollisions(gameResult.collisions);
        setRenderOptions((prev) => ({
          ...prev,
          isGoal: gameResult.status === "SUCCESS",
        }));
      },
      onReset: (initialState) => {
        setBotiState({ ...initialState });
        setStatus("IDLE");
        setRenderOptions({});
        setErrorMessage(null);
        setActionsExecuted(0);
        setCollisions(0);
      },
    });

    return () => {
      controller.cancelExecution();
    };
  }, [controller]);

  const handleWorkspaceReady = useCallback((workspace: Blockly.WorkspaceSvg) => {
    workspaceRef.current = workspace;
  }, []);

  const handleWorkspaceChange = useCallback(() => {
    // If user changes code after an error, clear the error message
    if (errorMessage) {
      setErrorMessage(null);
    }
  }, [errorMessage]);

  const handleRun = useCallback(async () => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      setErrorMessage("Workspace belum siap.");
      return;
    }

    setErrorMessage(null);

    // 1. Parse Blockly Workspace using BlocklyParser
    const parseResult = BlocklyParser.parseWorkspace(workspace, {
      availableBlocks: levelConfig.availableBlocks,
    });

    if (!parseResult.success) {
      setErrorMessage(parseResult.error.message);
      setStatus("FAILED");
      return;
    }

    // 2. Run program sequentially via GameController
    try {
      setStatus("RUNNING");
      setRenderOptions({});
      await controller.run(parseResult.actions, { stepDelayMs: 450 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menjalankan program.";
      setErrorMessage(msg);
      setStatus("FAILED");
    }
  }, [controller, levelConfig.availableBlocks]);

  const handleReset = useCallback(() => {
    controller.reset();
  }, [controller]);

  return (
    <div className={`flex flex-col gap-5 w-full max-w-6xl mx-auto p-4 md:p-6 ${className}`}>
      {/* Level Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-700 p-5 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold backdrop-blur-sm">
              <Compass className="h-3.5 w-3.5" />
              {conceptBadge}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 text-amber-950 px-2.5 py-0.5 text-xs font-bold">
              <Sparkles className="h-3 w-3" />
              1 Star
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-sm md:text-base text-emerald-100">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm self-start sm:self-center">
          <Target className="h-5 w-5 text-amber-300" />
          <div className="text-xs">
            <p className="text-emerald-200">Target Bintang:</p>
            <p className="font-bold text-white">({levelConfig.goal.x}, {levelConfig.goal.y})</p>
          </div>
        </div>
      </header>

      {/* Main Gameplay Layout: Grid Canvas & Blockly Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Board & Status (5 cols on lg) */}
        <section className="lg:col-span-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Papan Permainan (Game Board)
            </h2>
            <GameBoard
              levelConfig={levelConfig}
              botiState={botiState}
              renderOptions={renderOptions}
            />
          </div>

          <FeedbackBanner
            status={status}
            errorMessage={errorMessage}
            collisions={collisions}
            isGoal={renderOptions.isGoal}
          />
        </section>

        {/* Right Column: Blockly Editor & Controls (6 cols on lg) */}
        <section className="lg:col-span-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Susun Blok Instruksi (Blockly)
              </h2>
              <span className="text-xs text-slate-400">Tarik blok dari panel kiri</span>
            </div>

            <div className="h-95 w-full">
              <BlocklyWorkspace
                availableBlocks={levelConfig.availableBlocks}
                onWorkspaceReady={handleWorkspaceReady}
                onWorkspaceChange={handleWorkspaceChange}
              />
            </div>
          </div>

          {/* Controls Bar */}
          <GameControls
            status={status}
            onRun={handleRun}
            onReset={handleReset}
            actionsExecuted={actionsExecuted}
            maxActions={levelConfig.maxActions}
          />
        </section>
      </div>
    </div>
  );
}

export default LevelPlayer;
