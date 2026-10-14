"use client";

import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import type * as Blockly from "blockly";
import { ArrowRight, Compass, MapPin, Sparkles, Target, Trophy } from "lucide-react";
import type { BotiState, LevelConfig } from "@/game/types";
import { BlocklyParser } from "@/game/parser";
import { type ControllerStatus, GameController } from "@/game/execution";
import type { RenderOptions } from "@/game/renderer";
import {
  getAllLevels,
  getLevelByCode,
  getNextLevel,
  type LevelDefinition,
  useProgressionStore,
} from "@/game/levels";
import { GameBoard } from "./GameBoard";
import { BlocklyWorkspace } from "./BlocklyWorkspace";
import { GameControls } from "./GameControls";
import { FeedbackBanner } from "./FeedbackBanner";
import { LevelSelector } from "./LevelSelector";
import type { PlayerProgressDTO } from "@/services/types";

export type LevelPlayerProps = {
  initialLevelCode?: string;
  levelConfig?: LevelConfig;
  className?: string;
  initialProgress?: PlayerProgressDTO[];
};

type LevelPlaySessionProps = {
  activeLevel: LevelDefinition | LevelConfig;
  onNextLevel?: () => void;
  nextLevel: LevelDefinition | null;
  levelDef: LevelDefinition | null;
};

function LevelPlaySession({
  activeLevel,
  onNextLevel,
  nextLevel,
  levelDef,
}: LevelPlaySessionProps) {
  const completeLevel = useProgressionStore((state) => state.completeLevel);
  const controller = useMemo(() => new GameController(activeLevel), [activeLevel]);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  const [botiState, setBotiState] = useState<BotiState>(() => controller.getState());
  const [status, setStatus] = useState<ControllerStatus>("IDLE");
  const [renderOptions, setRenderOptions] = useState<RenderOptions>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [verifiedStars, setVerifiedStars] = useState<number | null>(null);
  const [actionsExecuted, setActionsExecuted] = useState(0);
  const [collisions, setCollisions] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

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
        setSaveNotice(null);
        setVerifiedStars(null);
        setActionsExecuted(0);
        setCollisions(0);
        isSubmittingRef.current = false;
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
    if (errorMessage) {
      setErrorMessage(null);
    }
  }, [errorMessage]);

  const handleRun = useCallback(async () => {
    if (status === "RUNNING" || isSubmitting) {
      return;
    }

    const workspace = workspaceRef.current;
    if (!workspace) {
      setErrorMessage("Workspace belum siap.");
      return;
    }

    setErrorMessage(null);
    setSaveNotice(null);
    setVerifiedStars(null);

    // 1. Parse Blockly Workspace using BlocklyParser
    const parseResult = BlocklyParser.parseWorkspace(workspace, {
      availableBlocks: activeLevel.availableBlocks,
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
      isSubmittingRef.current = false;
      const startTime = Date.now();

      await controller.run(parseResult.actions, { stepDelayMs: 450 });

      // 3. Setelah eksekusi selesai, kirim ke Server Action untuk verifikasi objektif & persistensi
      if (!isSubmittingRef.current && levelDef) {
        isSubmittingRef.current = true;
        setIsSubmitting(true);
        const durationMs = Date.now() - startTime;

        try {
          const { submitGameplayAttemptAction } = await import("@/app/actions/gameplayActions");
          const res = await submitGameplayAttemptAction({
            levelCode: levelDef.code,
            actions: parseResult.actions,
            durationMs,
            startedAt: new Date(startTime).toISOString(),
          });

          if (res.success && res.verifiedResult) {
            if (res.verifiedResult.successful) {
              setVerifiedStars(res.verifiedResult.stars);
              completeLevel(levelDef.code, res.verifiedResult.stars);
            }
          } else if (!res.success) {
            setSaveNotice(res.error ?? "Progres belum dapat tersimpan ke server.");
          }
        } catch {
          setSaveNotice("Kendala jaringan: Progres belum tersimpan ke server.");
        } finally {
          setIsSubmitting(false);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menjalankan program.";
      setErrorMessage(msg);
      setStatus("FAILED");
    }
  }, [controller, activeLevel.availableBlocks, levelDef, completeLevel, status, isSubmitting]);

  const handleReset = useCallback(() => {
    isSubmittingRef.current = true;
    controller.reset();
    setStatus("IDLE");
    setErrorMessage(null);
    setSaveNotice(null);
  }, [controller]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left Column: Board & Status */}
      <section className="lg:col-span-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Papan Permainan ({activeLevel.grid.width}×{activeLevel.grid.height})
            </h2>
            <span className="text-xs text-slate-400">
              Awal: ({activeLevel.start.x}, {activeLevel.start.y}) {activeLevel.start.direction}
            </span>
          </div>
          <GameBoard
            levelConfig={activeLevel}
            botiState={botiState}
            renderOptions={renderOptions}
          />
        </div>

        <FeedbackBanner
          status={status}
          errorMessage={errorMessage}
          collisions={collisions}
          isGoal={renderOptions.isGoal}
          verifiedStars={verifiedStars}
          saveNotice={saveNotice}
        />

        {/* Next Level Progression Banner */}
        {status === "SUCCESS" && nextLevel && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-500 p-4 text-white shadow-lg animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-amber-300 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Level {levelDef?.code} Selesai!</h4>
                <p className="text-xs text-emerald-100">
                  Buka tantangan selanjutnya: <strong>Level {nextLevel.code} — {nextLevel.title}</strong>
                </p>
              </div>
            </div>

            <button
              id="btn-next-level"
              type="button"
              onClick={onNextLevel}
              className="flex items-center gap-1.5 shrink-0 rounded-xl bg-white px-4 py-2.5 text-xs md:text-sm font-bold text-emerald-800 shadow transition-all hover:bg-emerald-50 active:scale-95"
            >
              <span>Lanjut</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      {/* Right Column: Blockly Editor & Controls */}
      <section className="lg:col-span-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Susun Blok Instruksi (Blockly)
            </h2>
            <span className="text-xs text-slate-400">
              Blok: {activeLevel.availableBlocks.join(", ")}
            </span>
          </div>

          <div className="h-95 w-full">
            <BlocklyWorkspace
              availableBlocks={activeLevel.availableBlocks}
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
          maxActions={activeLevel.maxActions}
          disabled={isSubmitting}
        />
      </section>
    </div>
  );
}

export function LevelPlayer({
  initialLevelCode = "1.1",
  levelConfig: customConfig,
  className = "",
  initialProgress,
}: LevelPlayerProps) {
  const { activeLevelCode, setActiveLevelCode, syncProgressFromDatabase } = useProgressionStore();
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    if (initialProgress && initialProgress.length > 0) {
      syncProgressFromDatabase(initialProgress);
    }
  }, [initialProgress, syncProgressFromDatabase]);

  // Active level determination: priority customConfig -> activeLevelCode -> fallback 1.1
  const activeLevel: LevelDefinition | LevelConfig = useMemo(() => {
    if (customConfig) return customConfig;
    const fromStore = getLevelByCode(activeLevelCode);
    if (fromStore) return fromStore;
    const fromProp = getLevelByCode(initialLevelCode);
    if (fromProp) return fromProp;
    return getAllLevels()[0];
  }, [customConfig, activeLevelCode, initialLevelCode]);

  const levelDef = "code" in activeLevel ? (activeLevel as LevelDefinition) : null;
  const nextLevel = levelDef ? getNextLevel(levelDef.code) : null;
  const levelKey = levelDef ? levelDef.code : "custom";

  const handleSelectLevel = useCallback(
    (code: string) => {
      setActiveLevelCode(code);
      setShowSelector(false);
    },
    [setActiveLevelCode]
  );

  const handleNextLevel = useCallback(() => {
    if (nextLevel) {
      setActiveLevelCode(nextLevel.code);
    }
  }, [nextLevel, setActiveLevelCode]);

  const title = levelDef ? `${levelDef.code} — ${levelDef.title}` : "Level Permainan";
  const subtitle = levelDef ? levelDef.description : "Bantu Boti mencapai bintang!";
  const conceptText = levelDef ? levelDef.concepts.join(" • ") : "Instruksi";

  return (
    <div className={`flex flex-col gap-5 w-full max-w-6xl mx-auto p-4 md:p-6 ${className}`}>
      {/* Level Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-700 p-5 text-white shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold backdrop-blur-sm">
              <Compass className="h-3.5 w-3.5" />
              {conceptText}
            </span>
            {levelDef && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/80 px-2.5 py-0.5 text-xs font-medium">
                Tingkat: {levelDef.levelType}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 text-amber-950 px-2.5 py-0.5 text-xs font-bold">
              <Sparkles className="h-3 w-3" />
              {levelDef ? `${levelDef.difficulty} Star` : "1 Star"}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-sm md:text-base text-emerald-100 max-w-2xl">{subtitle}</p>
        </div>

        <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2.5">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
            <Target className="h-5 w-5 text-amber-300" />
            <div className="text-xs">
              <p className="text-emerald-200">Target Bintang:</p>
              <p className="font-bold text-white">({activeLevel.goal.x}, {activeLevel.goal.y})</p>
            </div>
          </div>

          {/* Button to open level catalog */}
          <button
            type="button"
            onClick={() => setShowSelector(!showSelector)}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-sm transition-all"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>{showSelector ? "Tutup Katalog" : "Pilih Level (12)"}</span>
          </button>
        </div>
      </header>

      {/* Collapsible Level Selector */}
      {showSelector && (
        <div className="animate-in fade-in zoom-in-95">
          <LevelSelector
            currentLevelCode={levelDef ? levelDef.code : "1.1"}
            onSelectLevel={handleSelectLevel}
          />
        </div>
      )}

      {/* Main Gameplay Session with key to reset state cleanly on level change */}
      <LevelPlaySession
        key={levelKey}
        activeLevel={activeLevel}
        onNextLevel={handleNextLevel}
        nextLevel={nextLevel}
        levelDef={levelDef}
      />
    </div>
  );
}

export default LevelPlayer;
