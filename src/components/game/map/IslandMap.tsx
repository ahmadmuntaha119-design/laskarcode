"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Lock,
  Play,
  Star,
  Trophy,
} from "lucide-react";
import type { IslandDefinition } from "@/game/levels/types";
import {
  computeLevelSummary,
  getIslandSummary,
  isIslandUnlocked,
  type LevelProgress,
} from "@/game/levels/progression";
import { getLevelByCode } from "@/game/levels/catalog";
import { BotiAvatarIcon } from "@/components/profile/avatars";

export type IslandMapProps = {
  island: IslandDefinition;
  profile: {
    nickname: string;
    avatarId: string;
  };
  progressMap: Record<string, LevelProgress>;
  className?: string;
};

export function IslandMap({
  island,
  profile,
  progressMap,
  className = "",
}: IslandMapProps) {
  const isUnlocked = isIslandUnlocked(island.slug, progressMap);
  const islandSummary = getIslandSummary(island.slug, progressMap);

  // If island is locked, show child-friendly lock screen
  if (!isUnlocked) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto p-4 sm:p-6 text-center ${className}`}
      >
        <div className="relative overflow-hidden w-full rounded-3xl bg-white border-2 border-[#E8EDF5] p-6 sm:p-8 shadow-sm">
          {/* Ambient soft glow */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-[#4DABF7]/10 rounded-full blur-2xl pointer-events-none -z-0" />
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-[#12B886]/10 rounded-full blur-2xl pointer-events-none -z-0" />

          <div className="relative z-10 mx-auto w-16 h-16 rounded-3xl bg-[#4DABF7]/15 border-2 border-[#4DABF7]/30 text-[#1971C2] flex items-center justify-center mb-4 shadow-sm">
            <Lock className="w-8 h-8 stroke-[2.5]" />
          </div>

          <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-[#4DABF7]/10 border border-[#4DABF7]/25 px-3.5 py-1 text-xs font-bold text-[#1971C2] mb-3">
            <Compass className="w-3.5 h-3.5" />
            {island.name}
          </span>

          <h2 className="relative z-10 text-2xl sm:text-3xl font-black text-[#26334D] mb-3">
            Pulau Ini Belum Terbuka
          </h2>

          <p className="relative z-10 text-sm text-[#64748B] leading-relaxed mb-6 max-w-md mx-auto">
            Jembatan menuju pulau ini masih tertutup kabut tebal. Selesaikan seluruh 6 tantangan di{" "}
            <strong className="text-[#087F5B]">Pulau 1 — Desa Cipi</strong> (Level 1.1 sampai 1.6) untuk
            membuka jembatan penyeberangan! Cipi sudah siap menunggumu.
          </p>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              id="btn-return-desa-boti"
              href="/map/desa-boti"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#12B886] hover:bg-[#0fa678] text-white px-6 py-3.5 text-sm font-bold shadow-[0_4px_0_#087F5B] active:translate-y-1 active:shadow-none transition-all min-h-12 cursor-pointer"
            >
              <span>Pergi ke Desa Cipi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              id="btn-return-world-map"
              href="/map"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#E8EDF5] bg-white hover:bg-slate-50 text-[#26334D] px-5 py-3.5 text-sm font-bold transition-all min-h-12 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Peta Dunia</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine active level code: the first level that is NOT completed and IS available
  const activeLevelCode = islandSummary?.activeLevelCode ?? island.levelCodes[0];

  // Positions and horizontal alignments for the 6 nodes along the winding path (S-curve)
  const nodeAlignments = [
    { justify: "sm:justify-start", offsetClass: "sm:ml-8 md:ml-16" },
    { justify: "sm:justify-center", offsetClass: "sm:mr-12 md:mr-20" },
    { justify: "sm:justify-end", offsetClass: "sm:mr-8 md:mr-16" },
    { justify: "sm:justify-center", offsetClass: "sm:ml-16 md:ml-24" },
    { justify: "sm:justify-start", offsetClass: "sm:ml-12 md:ml-20" },
    { justify: "sm:justify-center", offsetClass: "" },
  ];

  return (
    <div className={`flex flex-col gap-6 w-full max-w-5xl mx-auto ${className}`}>
      {/* ========================================================================= */}
      {/* 3-LAYER HERO HEADER (Harmonized with AdventureWorldMap & Landing Page) */}
      {/* ========================================================================= */}
      <header className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-3xl bg-linear-to-r from-[#12B886] via-[#0fa678] to-[#087F5B] p-6 text-white shadow-md border-2 border-[#12B886]/30">
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
              id="btn-back-to-world-map"
              href="/map"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 px-3.5 py-1 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-xs border border-white/25 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Peta Dunia</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/25 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
              <Compass className="h-3.5 w-3.5" />
              {island.slug === "desa-boti" || island.slug === "desa-cipi" ? "Pulau 1 • Tahap Pemula" : "Pulau 2 • Logika Pola"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {island.name}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-50 max-w-xl mt-1 leading-relaxed">
            {island.description}
          </p>
        </div>

        {/* Island Stats HUD (Clean, crisp frosted cards) */}
        <div className="relative z-10 flex items-center gap-3 self-stretch sm:self-auto justify-end">
          <div className="flex-1 sm:flex-initial flex items-center gap-2.5 rounded-2xl bg-white/20 px-3.5 sm:px-4 py-2 border border-white/30 backdrop-blur-xs shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Trophy className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="text-left">
              <span className="text-[10px] sm:text-xs text-emerald-100 font-bold uppercase tracking-wider block">
                Level Selesai
              </span>
              <span className="font-black text-white text-sm sm:text-base tracking-tight">
                {islandSummary?.completedLevels ?? 0}{" "}
                <span className="text-emerald-200/80 font-semibold text-xs">
                  / {island.levelCodes.length}
                </span>
              </span>
            </div>
          </div>

          <div className="flex-1 sm:flex-initial flex items-center gap-2.5 rounded-2xl bg-white/20 px-3.5 sm:px-4 py-2 border border-white/30 backdrop-blur-xs shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-[#FFE66D] shrink-0">
              <Star className="h-4.5 w-4.5 fill-[#FFE66D] text-[#FFE66D]" />
            </div>
            <div className="text-left">
              <span className="text-[10px] sm:text-xs text-emerald-100 font-bold uppercase tracking-wider block">
                Bintang
              </span>
              <span className="font-black text-white text-sm sm:text-base tracking-tight">
                {islandSummary?.earnedStars ?? 0}{" "}
                <span className="text-emerald-200/80 font-semibold text-xs">/ 18</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* WINDING ADVENTURE TRAIL CONTAINER */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl bg-white p-6 sm:p-10 border-2 border-[#E8EDF5] shadow-sm overflow-hidden">
        {/* Playful terrain backdrop with soft theme gradient */}
        <div
          className={`absolute inset-0 -z-10 ${
            island.slug === "desa-boti" || island.slug === "desa-cipi"
              ? "bg-linear-to-b from-[#FFFDF7] via-[#EBF7F2]/60 to-[#FFFDF7]"
              : "bg-linear-to-b from-[#FFFDF7] via-[#E7F5FF]/60 to-[#FFFDF7]"
          }`}
        />

        {/* Trail Title & Guide Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-6 border-b border-[#E8EDF5] mb-8">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#26334D]">
              Jalur Petualangan {island.slug === "desa-boti" || island.slug === "desa-cipi" ? "Desa Cipi" : "Hutan Pola"}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Ikuti jalan setapak berkelok dari Level {island.levelCodes[0]} hingga Level{" "}
              {island.levelCodes[island.levelCodes.length - 1]}.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WINDING NODES LIST (Along curved pathway with Stepping Stone Connectors) */}
        {/* ========================================================================= */}
        <div className="relative flex flex-col gap-6 sm:gap-8 my-4">
          {island.levelCodes.map((code, index) => {
            const level = getLevelByCode(code);
            if (!level) return null;

            const summary = computeLevelSummary(level, progressMap);
            const isCompleted = summary.isCompleted;
            const isLocked = summary.isLocked;
            const isCurrentActive = code === activeLevelCode && !isCompleted;

            const align = nodeAlignments[index % nodeAlignments.length];

            const conceptLabel = level.concepts
              .map((c) =>
                c === "MOVE" || c === "boti_move" || c === "cipi_move"
                  ? "Langkah Maju"
                  : c === "TURN" || c === "boti_turn" || c === "cipi_turn"
                  ? "Arah Belok"
                  : c === "SEQUENCE"
                  ? "Urutan Langkah"
                  : c === "Pattern"
                  ? "Pola Langkah"
                  : c === "Algorithm"
                  ? "Algoritma"
                  : c
              )
              .join(" • ");

            return (
              <React.Fragment key={code}>
                <div className={`flex w-full ${align.justify} items-center relative z-10`}>
                  {/* Node Card Container */}
                  <div
                    className={`flex items-center gap-4 sm:gap-6 ${align.offsetClass} transition-all`}
                  >
                    {/* The Interactive Node Token */}
                    <div className="relative flex items-center justify-center shrink-0">
                      {/* Cipi Mascot Companion (Floating right above the active node!) */}
                      {isCurrentActive && (
                        <div className="absolute -top-16 sm:-top-18 flex flex-col items-center animate-bounce z-20 pointer-events-none">
                          <div className="bg-white text-[#087F5B] text-[10px] font-black px-3.5 py-1 rounded-full shadow-lg border-2 border-[#12B886] whitespace-nowrap flex items-center gap-1.5">
                            <span>{profile.nickname} di sini!</span>
                          </div>
                          <div className="relative -mt-1 p-1 bg-white rounded-full shadow-lg border-2 border-[#12B886]">
                            <BotiAvatarIcon avatarId={profile.avatarId} className="w-8 h-8" />
                          </div>
                        </div>
                      )}

                      {/* Active Halo Pulse Ring */}
                      {isCurrentActive && (
                        <div className="absolute inset-0 -m-2 rounded-full border-2 border-[#12B886] animate-ping opacity-30 pointer-events-none" />
                      )}

                      {/* Node Button / Token */}
                      {isLocked ? (
                        <div
                          id={`node-locked-${code}`}
                          aria-disabled="true"
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center shadow-inner cursor-not-allowed select-none"
                        >
                          <Lock className="w-5 h-5 text-slate-400" />
                          <span className="text-[10px] font-bold mt-0.5">{code}</span>
                        </div>
                      ) : (
                        <Link
                          id={`node-level-${code}`}
                          href={`/play?level=${code}`}
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-md active:translate-y-1 ${
                            isCurrentActive
                              ? "bg-[#12B886] text-white border-4 border-white ring-4 ring-[#12B886]/35 shadow-[0_5px_0_#087F5B] scale-110"
                              : isCompleted
                              ? "bg-white text-[#087F5B] border-3 border-[#12B886] hover:border-[#087F5B] hover:scale-105 shadow-[0_4px_0_#12B886]/30"
                              : "bg-white text-[#26334D] border-3 border-[#E8EDF5] hover:border-[#12B886] hover:scale-105 shadow-[0_4px_0_#E8EDF5]"
                          }`}
                        >
                          {isCompleted ? (
                            <div className="flex flex-col items-center">
                              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#087F5B]" />
                              <div className="flex items-center gap-0.5 mt-0.5">
                                <Star className="w-2.5 h-2.5 fill-[#FFD43B] text-[#F59F00]" />
                                <span className="text-[10px] font-black text-[#26334D]">
                                  {summary.stars}
                                </span>
                              </div>
                            </div>
                          ) : isCurrentActive ? (
                            <div className="flex flex-col items-center">
                              <Play className="w-5 h-5 fill-current text-white ml-0.5" />
                              <span className="text-[10px] font-black text-white">{code}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Play className="w-4 h-4 fill-current text-[#12B886] ml-0.5" />
                              <span className="text-[10px] font-black text-[#26334D]">{code}</span>
                            </div>
                          )}
                        </Link>
                      )}
                    </div>

                    {/* Level Details Card */}
                    <div
                      className={`flex flex-col justify-center rounded-3xl p-4 sm:p-5 max-w-xs sm:max-w-md transition-all border-2 relative overflow-hidden ${
                        isCurrentActive
                          ? "bg-white text-[#26334D] border-2 border-[#12B886] shadow-md"
                          : isCompleted
                          ? "bg-white text-[#26334D] border-[#E8EDF5] shadow-xs hover:border-[#12B886]/40"
                          : isLocked
                          ? "bg-slate-50/80 text-slate-400 border-slate-200"
                          : "bg-white text-[#26334D] border-[#E8EDF5] hover:border-[#12B886]/50 shadow-xs"
                      }`}
                    >
                      {/* Active Ambient Glow */}
                      {isCurrentActive && (
                        <div className="absolute -top-10 -left-10 w-28 h-28 bg-[#12B886]/10 rounded-full blur-xl pointer-events-none -z-0" />
                      )}

                      <div className="relative z-10 flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            isCurrentActive
                              ? "bg-[#12B886] text-white shadow-xs"
                              : isCompleted
                              ? "bg-[#12B886]/10 text-[#087F5B]"
                              : isLocked
                              ? "bg-slate-200 text-slate-500"
                              : "bg-slate-100 text-[#26334D]"
                          }`}
                        >
                          Level {code}
                        </span>

                        <span className="text-[10px] font-bold text-[#64748B]">
                          {conceptLabel}
                        </span>
                      </div>

                      <h3
                        className={`relative z-10 text-base sm:text-lg font-black tracking-tight ${
                          isCurrentActive
                            ? "text-[#26334D]"
                            : isLocked
                            ? "text-slate-500"
                            : "text-[#26334D]"
                        }`}
                      >
                        {level.title}
                      </h3>

                      <p
                        className={`relative z-10 text-xs mt-0.5 line-clamp-2 leading-relaxed ${
                          isLocked ? "text-slate-400" : "text-[#64748B]"
                        }`}
                      >
                        {level.description}
                      </p>

                      {/* Action Button inside card */}
                      {!isLocked && (
                        <div className="relative z-10 mt-3 pt-2.5 border-t border-[#E8EDF5]/70 flex items-center justify-between">
                          <Link
                            href={`/play?level=${code}`}
                            className={`inline-flex items-center gap-1.5 rounded-xl font-bold text-xs transition-all ${
                              isCurrentActive
                                ? "bg-[#12B886] hover:bg-[#0fa678] text-white px-4 py-2 shadow-[0_3px_0_#087F5B] active:translate-y-0.5 active:shadow-none"
                                : isCompleted
                                ? "bg-[#12B886]/10 hover:bg-[#12B886]/20 text-[#087F5B] px-3.5 py-1.5 border border-[#12B886]/25"
                                : "text-[#12B886] hover:text-[#087F5B] py-1"
                            }`}
                          >
                            <span>{isCompleted ? "Ulangi Misi" : "Mulai Misi"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          {isCompleted && (
                            <div className="flex items-center gap-1 text-xs font-bold text-[#087F5B]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#12B886]" />
                              <span>{summary.stars} Bintang diraih</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stepping-Stone Trail Indicators between nodes */}
                {index < island.levelCodes.length - 1 && (
                  <div
                    className="flex justify-center items-center my-0.5 sm:my-1 pointer-events-none select-none opacity-40"
                    aria-hidden="true"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#12B886]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#12B886]" />
                      <div className="w-2 h-2 rounded-full bg-[#12B886]" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Trail Bottom Navigation */}
        <div className="mt-12 pt-6 border-t border-[#E8EDF5] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            id="link-bottom-back-world-map"
            href="/map"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#E8EDF5] bg-white hover:bg-slate-50 text-[#26334D] px-5 py-3 text-xs sm:text-sm font-bold transition-all min-h-12 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Peta Dunia</span>
          </Link>

          {/* Quick Play active level button */}
          <Link
            id="btn-quick-play-active-level"
            href={`/play?level=${activeLevelCode}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#12B886] hover:bg-[#0fa678] text-white px-7 py-3 text-xs sm:text-sm font-bold shadow-[0_4px_0_#087F5B] active:translate-y-1 active:shadow-none transition-all min-h-12 cursor-pointer"
          >
            <span>Mainkan Level {activeLevelCode}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default IslandMap;
