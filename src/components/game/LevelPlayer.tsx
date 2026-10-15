"use client";

import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import type * as Blockly from "blockly";
import { ArrowLeft, ArrowRight, Compass, Sparkles, Star, Target, Trophy } from "lucide-react";
import type { BotiState, LevelConfig } from "@/game/types";
import { BlocklyParser } from "@/game/parser";
import { type ControllerStatus, GameController } from "@/game/execution";
import type { RenderOptions } from "@/game/renderer";
import {
  getAllLevels,
  getIslandBySlug,
  getLevelByCode,
  getNextLevel,
  type LevelDefinition,
  useProgressionStore,
} from "@/game/levels";
import { GameBoard } from "./GameBoard";
import { BlocklyWorkspace } from "./BlocklyWorkspace";
import { GameControls } from "./GameControls";
import { FeedbackBanner } from "./FeedbackBanner";
import type { PlayerProgressDTO } from "@/services/types";

export type LevelPlayerProps = {
  initialLevelCode?: string;
  levelConfig?: LevelConfig;
  className?: string;
  initialProgress?: PlayerProgressDTO[];
  avatarId?: string;
};

type LevelPlaySessionProps = {
  activeLevel: LevelDefinition | LevelConfig;
  onNextLevel?: () => void;
  nextLevel: LevelDefinition | null;
  levelDef: LevelDefinition | null;
  avatarId?: string;
};

function LevelPlaySession({
  activeLevel,
  onNextLevel,
  nextLevel,
  levelDef,
  avatarId,
}: LevelPlaySessionProps) {
  const completeLevel = useProgressionStore((state) => state.completeLevel);
  const controller = useMemo(() => new GameController(activeLevel), [activeLevel]);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  const [botiState, setBotiState] = useState<BotiState>(() => controller.getState());
  const [status, setStatus] = useState<ControllerStatus>("IDLE");
  const [renderOptions, setRenderOptions] = useState<RenderOptions>({ avatarId });
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
          avatarId,
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
          avatarId,
        }));
      },
      onReset: (initialState) => {
        setBotiState({ ...initialState });
        setStatus("IDLE");
        setRenderOptions({ avatarId });
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
  }, [controller, avatarId]);

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

  const blockNames = activeLevel.availableBlocks
    .map((b) => {
      const bStr = String(b);
      return bStr === "MOVE" || bStr === "boti_move"
        ? "Maju"
        : bStr === "TURN_LEFT" || bStr === "boti_turn_left"
        ? "Belok Kiri"
        : bStr === "TURN_RIGHT" || bStr === "boti_turn_right"
        ? "Belok Kanan"
        : bStr;
    })
    .join(" • ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left Column: Board & Status (Desktop ~42%) */}
      <section className="lg:col-span-5 flex flex-col gap-3.5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#087F5B]">
              <Compass className="w-3.5 h-3.5 text-[#12B886]" />
              <span>Arena Petualangan ({activeLevel.grid.width}×{activeLevel.grid.height})</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#64748B] bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
              <span>Titik Mulai:</span>
              <span className="font-extrabold text-[#26334D]">
                ({activeLevel.start.x}, {activeLevel.start.y})
              </span>
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

        {/* Next Level Progression Banner (Celebration Card) */}
        {status === "SUCCESS" && (
          <div className="relative overflow-hidden flex flex-col gap-4 rounded-3xl border-2 border-[#12B886]/40 bg-linear-to-r from-[#12B886] via-[#0fa678] to-[#087F5B] p-5 sm:p-6 text-white shadow-lg shadow-[#12B886]/20 animate-in zoom-in-95">
            {/* Celebratory Sparkle Background Pattern */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none select-none -z-0"
              aria-hidden="true"
            >
              <svg
                className="w-full h-full"
                viewBox="0 0 400 160"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M40,25 Q40,33 48,33 Q40,33 40,41 Q40,33 32,33 Q40,33 40,25 Z"
                  fill="white"
                  opacity="0.22"
                />
                <path
                  d="M360,35 Q360,43 368,43 Q360,43 360,51 Q360,43 352,43 Q360,43 360,35 Z"
                  fill="white"
                  opacity="0.22"
                />
                <path
                  d="M220,15 Q220,21 226,21 Q220,21 220,27 Q220,21 214,21 Q220,21 220,15 Z"
                  fill="white"
                  opacity="0.18"
                />
                <circle cx="100" cy="45" r="3" fill="white" opacity="0.18" />
                <circle cx="310" cy="20" r="3.5" fill="white" opacity="0.18" />
                <circle cx="180" cy="40" r="2.5" fill="white" opacity="0.18" />
              </svg>
            </div>

            {/* Top row: Trophy, Title, Subtitle */}
            <div className="relative z-10 flex items-start gap-3.5">
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white/20 border-2 border-white/35 shadow-inner text-[#FFE66D] backdrop-blur-xs">
                <Trophy className="h-7 w-7 drop-shadow-xs" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-emerald-100 backdrop-blur-xs border border-white/20">
                    <Sparkles className="w-3 h-3 text-[#FFE66D]" />
                    Misi Berhasil
                  </span>
                </div>
                <h4 className="font-black text-lg sm:text-xl text-white tracking-tight">
                  Level {levelDef?.code} Selesai!
                </h4>
                <p className="text-xs sm:text-sm text-emerald-50 font-medium leading-relaxed mt-0.5">
                  {nextLevel
                    ? `Tantangan berikutnya: Level ${nextLevel.code} — ${nextLevel.title}`
                    : "Luar biasa! Kamu telah menuntaskan seluruh tantangan di pulau ini!"}
                </p>
              </div>
            </div>

            {/* Bottom row: Action Buttons (Dedicated row, guaranteed NO overflow!) */}
            <div className="relative z-10 pt-3 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              {nextLevel && (
                <button
                  id="btn-next-level"
                  type="button"
                  onClick={onNextLevel}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white hover:bg-slate-50 px-5 py-3.5 text-xs sm:text-sm font-black text-[#087F5B] shadow-[0_4px_0_#065f46]/25 transition-all active:translate-y-1 active:shadow-none cursor-pointer min-h-12"
                >
                  <span>Lanjut Misi</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </button>
              )}
              <Link
                id="btn-back-island-success"
                href={`/map/${levelDef?.islandSlug ?? "desa-boti"}`}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/35 px-4 py-3.5 text-xs sm:text-sm font-bold text-white transition-all active:translate-y-0.5 cursor-pointer min-h-12 backdrop-blur-xs ${
                  !nextLevel ? "sm:col-span-2" : ""
                }`}
              >
                <Compass className="h-4 w-4" />
                <span>Peta Pulau</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Right Column: Blockly Editor & Controls (Desktop ~58%) */}
      <section className="lg:col-span-7 flex flex-col gap-3.5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#087F5B]">
              <Sparkles className="w-3.5 h-3.5 text-[#12B886]" />
              <span>Area Susun Balok Kode</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1971C2] bg-[#4DABF7]/10 border border-[#4DABF7]/25 px-2.5 py-0.5 rounded-full">
              <span>Balok:</span>
              <span className="font-extrabold">{blockNames}</span>
            </span>
          </div>

          <div className="h-107.5 w-full rounded-3xl overflow-hidden border-2 border-[#E8EDF5] bg-white shadow-xs">
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
  avatarId = "boti_explorer",
}: LevelPlayerProps) {
  const { activeLevelCode, setActiveLevelCode, syncProgressFromDatabase } = useProgressionStore();

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

  const island = levelDef ? getIslandBySlug(levelDef.islandSlug) : null;
  const islandName = island ? island.name : "Pulau 1 — Desa Boti";

  const handleNextLevel = useCallback(() => {
    if (nextLevel) {
      setActiveLevelCode(nextLevel.code);
    }
  }, [nextLevel, setActiveLevelCode]);

  const title = levelDef ? `${levelDef.code} — ${levelDef.title}` : "Level Permainan";
  const subtitle = levelDef ? levelDef.description : "Bantu Boti mencapai bintang!";
  const conceptText = levelDef
    ? levelDef.concepts
        .map((c) =>
          c === "MOVE" || c === "boti_move"
            ? "Langkah Maju"
            : c === "TURN" || c === "boti_turn"
            ? "Arah Belok"
            : c === "SEQUENCE"
            ? "Urutan Langkah"
            : c === "Pattern"
            ? "Pola Langkah"
            : c === "Algorithm"
            ? "Algoritma"
            : c
        )
        .join(" • ")
    : "Instruksi";

  const levelTypeLabel =
    levelDef?.levelType === "Learn"
      ? "Pengenalan"
      : levelDef?.levelType === "Practice"
      ? "Latihan"
      : "Tantangan";

  return (
    <div className={`flex flex-col gap-4 w-full max-w-6xl mx-auto ${className}`}>
      {/* ========================================================================= */}
      {/* 3-LAYER LEVEL HERO HEADER (Consistent with Landing Page & World Map) */}
      {/* ========================================================================= */}
      <header className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-linear-to-r from-[#12B886] via-[#0fa678] to-[#087F5B] p-5 sm:p-6 text-white shadow-md border-2 border-[#12B886]/30">
        {/* Layer 2: Decorative Pattern Layer */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none select-none -z-0"
          aria-hidden="true"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 120"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Curving dashed adventure trail */}
            <path
              d="M-20,45 Q160,105 320,35 T680,75 T1040,35"
              stroke="white"
              strokeWidth="2.5"
              strokeDasharray="6,8"
              opacity="0.16"
            />
            {/* Subtle floating coding block shapes */}
            <g opacity="0.12" stroke="white" strokeWidth="2">
              <rect x="180" y="16" width="28" height="28" rx="8" />
              <path
                d="M190,30 L198,30 M195,26 L199,30 L195,34"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="680" y="18" width="30" height="30" rx="8" />
              <path
                d="M691,33 L699,33 M696,29 L700,33 L696,37"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            {/* Geometric 4-point stars */}
            <path
              d="M460,22 Q460,32 470,32 Q460,32 460,42 Q460,32 450,32 Q460,32 460,22 Z"
              fill="white"
              opacity="0.18"
            />
            <path
              d="M860,40 Q860,48 868,48 Q860,48 860,56 Q860,48 852,48 Q860,48 860,40 Z"
              fill="white"
              opacity="0.18"
            />
            <path
              d="M70,68 Q70,74 76,74 Q70,74 70,80 Q70,74 64,74 Q70,74 70,68 Z"
              fill="white"
              opacity="0.18"
            />
            {/* Soft bubbles / dots */}
            <circle cx="280" cy="70" r="4" fill="white" opacity="0.14" />
            <circle cx="390" cy="20" r="3" fill="white" opacity="0.14" />
            <circle cx="580" cy="75" r="5" fill="white" opacity="0.14" />
            <circle cx="780" cy="22" r="3" fill="white" opacity="0.14" />
            <circle cx="940" cy="65" r="5" fill="white" opacity="0.14" />
            {/* Island hills contour */}
            <path
              d="M600,120 C680,85 760,90 840,120 C900,90 980,95 1020,120 Z"
              fill="white"
              opacity="0.08"
            />
          </svg>
        </div>

        {/* Layer 3: Foreground Content */}
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Link
              id="link-header-island"
              href={`/map/${levelDef?.islandSlug ?? "desa-boti"}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/25 px-3.5 py-1 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{islandName}</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/25 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
              <Compass className="h-3.5 w-3.5" />
              {conceptText}
            </span>

            {levelDef && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-emerald-100">
                Tingkat: {levelTypeLabel}
              </span>
            )}

            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 border border-white/25 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-xs">
              <Star className="h-3.5 w-3.5 fill-[#FFE66D] text-[#FFE66D]" />
              <span>{levelDef ? `${levelDef.difficulty} Bintang` : "1 Bintang"}</span>
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">{title}</h1>
          <p className="text-xs sm:text-sm text-emerald-50 max-w-2xl mt-1 font-medium leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Target HUD & Back Button */}
        <div className="relative z-10 flex flex-wrap sm:flex-col items-start sm:items-end gap-2.5">
          <div className="flex items-center gap-2.5 bg-white/20 rounded-2xl px-4 py-2 border border-white/30 backdrop-blur-xs shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Target className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] sm:text-xs text-emerald-100 font-bold uppercase tracking-wider">
                Target Bintang
              </p>
              <p className="font-black text-white text-sm sm:text-base tracking-tight">
                ({activeLevel.goal.x}, {activeLevel.goal.y})
              </p>
            </div>
          </div>

          {/* Button to return to Island Map */}
          <Link
            id="btn-back-to-island-map"
            href={`/map/${levelDef?.islandSlug ?? "desa-boti"}`}
            className="flex items-center gap-1.5 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/25 text-white px-4 py-2 text-xs font-bold transition-all cursor-pointer min-h-10 shadow-xs backdrop-blur-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Peta Pulau</span>
          </Link>
        </div>
      </header>

      {/* Main Gameplay Session with key to reset state cleanly on level change */}
      <LevelPlaySession
        key={levelKey}
        activeLevel={activeLevel}
        onNextLevel={handleNextLevel}
        nextLevel={nextLevel}
        levelDef={levelDef}
        avatarId={avatarId}
      />
    </div>
  );
}

export default LevelPlayer;
