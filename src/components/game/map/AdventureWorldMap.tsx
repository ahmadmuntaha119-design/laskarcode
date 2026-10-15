"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  Star,
  MapPin,
  Compass,
  Trophy,
} from "lucide-react";
import type { LevelDefinition } from "@/game/levels/types";
import {
  getIslandSummary,
  type LevelProgress,
} from "@/game/levels/progression";
import { AVATAR_OPTIONS, BotiAvatarIcon } from "@/components/profile/avatars";
import { FeedbackCard } from "@/components/ui/FeedbackCard";

export type AdventureWorldMapProps = {
  profile: {
    nickname: string;
    avatarId: string;
  };
  progressMap: Record<string, LevelProgress>;
  latestLevel: LevelDefinition;
  className?: string;
};

export function AdventureWorldMap({
  profile,
  progressMap,
  latestLevel,
  className = "",
}: AdventureWorldMapProps) {
  const avatarOption = AVATAR_OPTIONS.find((a) => a.id === profile.avatarId);
  const companionName = avatarOption ? avatarOption.name : "Sahabat Boti";

  // Compute island progress summaries
  const desaBotiSummary = getIslandSummary("desa-boti", progressMap);
  const hutanPolaSummary = getIslandSummary("hutan-pola", progressMap);

  const totalEarnedStars =
    (desaBotiSummary?.earnedStars ?? 0) + (hutanPolaSummary?.earnedStars ?? 0);
  const totalCompletedLevels =
    (desaBotiSummary?.completedLevels ?? 0) + (hutanPolaSummary?.completedLevels ?? 0);

  const isHutanPolaLocked = hutanPolaSummary?.isLocked ?? true;

  return (
    <div className={`flex flex-col gap-6 w-full max-w-6xl mx-auto ${className}`}>
      {/* World Map Hero Header with 3-Layer Visual Treatment */}
      <header className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-3xl bg-linear-to-r from-[#12B886] via-[#0fa678] to-[#087F5B] p-6 text-white shadow-md border-2 border-[#12B886]/30">
        {/* Layer 2: Decorative Adventure Map Pattern (Curved trail, coding blocks, stars, contours) */}
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
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative shrink-0 p-1.5 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-xs shadow-inner">
            <BotiAvatarIcon avatarId={profile.avatarId} className="w-14 h-14" />
            <div className="absolute -bottom-1 -right-1 rounded-full bg-white text-[#087F5B] p-1 shadow-xs border border-white/40">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white backdrop-blur-xs">
                <Compass className="h-3 w-3" />
                Peta Petualangan LaskarCode
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Halo, Petualang {profile.nickname}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-50 mt-0.5">
              Pilih pulau yang ingin kamu jelajahi bersama {companionName}.
            </p>
          </div>
        </div>

        {/* Global Stats Badges (Clean, crisp, no dark mustard brown) */}
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
                {totalCompletedLevels}{" "}
                <span className="text-emerald-200/80 font-semibold text-xs">/ 12</span>
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
                {totalEarnedStars}{" "}
                <span className="text-emerald-200/80 font-semibold text-xs">/ 36</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Action: Lanjut Petualangan (Continue to Next Playable Level) */}
      <section className="relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-white p-5 sm:p-6 border-2 border-[#12B886]/30 shadow-sm">
        {/* Ambient soft glow on left */}
        <div className="absolute -left-12 -top-12 w-40 h-40 bg-[#12B886]/10 rounded-full blur-2xl pointer-events-none -z-0" />

        <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#12B886]/15 border-2 border-[#12B886]/30 text-[#087F5B] flex items-center justify-center shrink-0 shadow-inner">
            <Play className="h-6 w-6 fill-[#087F5B] text-[#087F5B] ml-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#087F5B]">
              <Sparkles className="w-3.5 h-3.5 text-[#12B886]" />
              <span>Langkah Berikutnya</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#26334D] tracking-tight">
              Level {latestLevel.code} — {latestLevel.title}
            </h3>
            <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#12B886]" />
              <span>
                {latestLevel.islandSlug === "desa-boti"
                  ? "Pulau 1 • Desa Boti"
                  : "Pulau 2 • Hutan Pola"}
              </span>
            </p>
          </div>
        </div>

        <Link
          id="btn-continue-adventure"
          href={`/play?level=${latestLevel.code}`}
          className="relative z-10 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#12B886] hover:bg-[#0fa678] text-white px-7 py-3.5 text-sm sm:text-base font-bold transition-all shadow-[0_5px_0_#087F5B] active:translate-y-1 active:shadow-none cursor-pointer min-h-12 shrink-0"
        >
          <span>Lanjut Petualangan</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* World Map: 2 Islands + Inter-island Bridge */}
      <section className="relative rounded-3xl bg-white p-6 sm:p-8 border-2 border-[#E8EDF5] shadow-sm overflow-hidden">
        {/* Playful background water tint */}
        <div className="absolute inset-0 bg-[#4DABF7]/5 -z-10" />

        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[#26334D]">
            Dunia Kepulauan LaskarCode
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Selesaikan misi di Desa Boti untuk membuka jembatan menuju Hutan Pola!
          </p>
        </div>

        {/* Desktop Grid (2 Islands) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative">
          {/* ========================================================= */}
          {/* PULAU 1: DESA BOTI */}
          {/* ========================================================= */}
          <div
            id="island-card-desa-boti"
            className="group flex flex-col justify-between rounded-3xl border-2 border-[#12B886]/40 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all hover:border-[#12B886]"
          >
            <div>
              {/* Island Illustration Container */}
              <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden mb-4 bg-emerald-50 border border-[#12B886]/20 shadow-inner">
                <Image
                  src="/images/islands/island-desa-boti.webp"
                  alt="Pulau Desa Boti"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                {/* Status Badge (Typo fixed: Sedang Dijelajahi) */}
                <div className="absolute top-3 left-3">
                  {desaBotiSummary?.isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#12B886] px-3 py-1 text-xs font-bold text-white shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Pulau Selesai
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#087F5B] px-3 py-1 text-xs font-bold text-white shadow-xs">
                      <MapPin className="w-3.5 h-3.5 text-white" />
                      Sedang Dijelajahi
                    </span>
                  )}
                </div>

                {/* Stars Collected Badge (Crisp navy text, cheerful lemon star) */}
                <div className="absolute top-3 right-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#26334D] flex items-center gap-1.5 shadow-xs border border-[#E8EDF5] backdrop-blur-xs">
                  <Star className="w-3.5 h-3.5 fill-[#FFD43B] text-[#F59F00]" />
                  <span>{desaBotiSummary?.earnedStars ?? 0} / 18 Bintang</span>
                </div>

                {/* Island Label overlay (Clean translucent emerald badge, no mustard text) */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-black/45 backdrop-blur-xs text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 mb-1">
                    Pulau 1 • Tahap Pemula
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black drop-shadow-md">Desa Boti</h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-4">
                Petualangan perdana Boti mempelajari instruksi dasar, urutan langkah (sequence), dan arah belok.
              </p>

              {/* Level Progress Visual Meter */}
              <div className="rounded-2xl bg-[#FFFDF7] border-2 border-[#E8EDF5] p-3.5 mb-5">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-[#64748B]">Kemajuan Level:</span>
                  <span className="font-black text-[#087F5B]">
                    {desaBotiSummary?.completedLevels ?? 0} dari 6 Selesai
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#12B886] transition-all duration-500"
                    style={{
                      width: `${Math.min(100, ((desaBotiSummary?.completedLevels ?? 0) / 6) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Link
              id="link-explore-desa-boti"
              href="/map/desa-boti"
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#12B886] hover:bg-[#0fa678] text-white py-3.5 px-4 text-sm font-bold transition-all shadow-[0_4px_0_#087F5B] active:translate-y-1 active:shadow-none cursor-pointer min-h-12"
            >
              <span>Buka Peta Desa Boti (6 Level)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* ========================================================= */}
          {/* PULAU 2: HUTAN POLA */}
          {/* ========================================================= */}
          <div
            id="island-card-hutan-pola"
            className={`group flex flex-col justify-between rounded-3xl border-2 p-5 sm:p-6 transition-all ${
              isHutanPolaLocked
                ? "border-[#E8EDF5] bg-slate-50/80"
                : "border-[#12B886]/40 bg-white shadow-sm hover:shadow-md hover:border-[#12B886]"
            }`}
          >
            <div>
              {/* Island Illustration Container */}
              <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden mb-4 bg-emerald-950 border border-[#E8EDF5] shadow-inner">
                <Image
                  src="/images/islands/island-village-isometric.webp"
                  alt="Pulau Hutan Pola"
                  fill
                  className={`object-cover transition-transform duration-500 ${
                    isHutanPolaLocked ? "grayscale-30 group-hover:scale-100" : "group-hover:scale-105"
                  }`}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  {isHutanPolaLocked ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#26334D]/85 px-3 py-1 text-xs font-bold text-white shadow-xs border border-white/20 backdrop-blur-xs">
                      <Lock className="w-3.5 h-3.5 text-white" />
                      Pulau Terkunci
                    </span>
                  ) : hutanPolaSummary?.isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#12B886] px-3 py-1 text-xs font-bold text-white shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Pulau Selesai
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#087F5B] px-3 py-1 text-xs font-bold text-white shadow-xs">
                      <MapPin className="w-3.5 h-3.5 text-white" />
                      Sedang Dijelajahi
                    </span>
                  )}
                </div>

                {/* Stars Collected Badge (when unlocked) */}
                {!isHutanPolaLocked && (
                  <div className="absolute top-3 right-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#26334D] flex items-center gap-1.5 shadow-xs border border-[#E8EDF5] backdrop-blur-xs">
                    <Star className="w-3.5 h-3.5 fill-[#FFD43B] text-[#F59F00]" />
                    <span>{hutanPolaSummary?.earnedStars ?? 0} / 18 Bintang</span>
                  </div>
                )}

                {/* Friendly Locked Overlay (Centered, non-clashing) */}
                {isHutanPolaLocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-[#1E293B]/45 backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 border-2 border-white/40 text-white flex items-center justify-center mb-2 shadow-sm backdrop-blur-xs">
                      <Lock className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <p className="text-xs font-bold text-white max-w-[220px] drop-shadow-sm leading-snug">
                      Selesaikan 6 level di Desa Boti untuk membuka pulau ini!
                    </p>
                  </div>
                )}

                {/* Island Label overlay (Clean sky blue badge, no mustard text) */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-black/45 backdrop-blur-xs text-[10px] font-extrabold uppercase tracking-wider text-sky-200 mb-1">
                    Pulau 2 • Logika Pola
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black drop-shadow-md">Hutan Pola</h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-4">
                Eksplorasi algoritma langkah, pengenalan pola pergerakan (pattern), dan efisiensi rute di Hutan Pola.
              </p>

              {/* Level Progress Visual Meter */}
              <div className="rounded-2xl bg-[#FFFDF7] border-2 border-[#E8EDF5] p-3.5 mb-5">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-[#64748B]">Kemajuan Level:</span>
                  <span className="font-black text-[#64748B]">
                    {isHutanPolaLocked
                      ? "Terkunci"
                      : `${hutanPolaSummary?.completedLevels ?? 0} dari 6 Selesai`}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-300 transition-all duration-500"
                    style={{
                      width: `${
                        isHutanPolaLocked
                          ? 0
                          : Math.min(100, ((hutanPolaSummary?.completedLevels ?? 0) / 6) * 100)
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            {isHutanPolaLocked ? (
              <div
                id="link-explore-hutan-pola-locked"
                aria-disabled="true"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 border-2 border-slate-200 text-slate-400 py-3.5 px-4 text-sm font-bold cursor-not-allowed min-h-12"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Buka Desa Boti Dulu</span>
              </div>
            ) : (
              <Link
                id="link-explore-hutan-pola"
                href="/map/hutan-pola"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#12B886] hover:bg-[#0fa678] text-white py-3.5 px-4 text-sm font-bold transition-all shadow-[0_4px_0_#087F5B] active:translate-y-1 active:shadow-none cursor-pointer min-h-12"
              >
                <span>Buka Peta Hutan Pola (6 Level)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Structured Feedback Card for Inter-Island Bridge */}
        <div className="mt-8 pt-6 border-t border-[#E8EDF5] flex flex-col gap-4">
          <FeedbackCard
            variant={isHutanPolaLocked ? "info" : "success"}
            title={
              isHutanPolaLocked
                ? "Jembatan Antar-Pulau Terkunci"
                : "Jembatan Antar-Pulau Terbuka Bebas!"
            }
            message={
              isHutanPolaLocked
                ? "Jembatan menuju Hutan Pola akan terbuka otomatis setelah kamu menaklukkan tantangan terakhir di Desa Boti (Level 1.6). Semangat belajar codingnya ya!"
                : "Hebat! Kamu telah membuka akses ke seluruh kepulauan LaskarCode. Kamu bisa menjelajahi Desa Boti maupun Hutan Pola kapan saja!"
            }
          />

          <div className="flex justify-center sm:justify-start">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#12B886] hover:text-[#087F5B] transition-colors cursor-pointer py-1"
            >
              <span>← Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdventureWorldMap;
