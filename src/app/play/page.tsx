import React, { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { resolveGuestSession } from "@/lib/session/resolveSession";
import { GuestProfileService } from "@/services/guestProfileService";
import { LevelService } from "@/services/levelService";
import { ProgressService } from "@/services/progressService";
import type { PlayerProgressDTO } from "@/services/types";
import { LevelPlayer } from "@/components/game/LevelPlayer";
import { PlayerHeader } from "@/components/game/PlayerHeader";
import { getLevelByCode } from "@/game/levels/catalog";
import {
  getCompletedCodes,
  getLatestPlayableLevel,
  isLevelUnlocked,
  type LevelProgress,
} from "@/game/levels/progression";
import { AlertTriangle, ArrowLeft, Lock, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";

type PlayPageProps = {
  searchParams: Promise<{
    level?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Petualangan Level — LaskarCode",
  description: "Belajar coding dengan visual programming Blockly dan bantu Boti menuntaskan misi di Pulau Desa Boti dan Hutan Pola",
};

function PlayPageSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-[#12B886]" />
      <p className="text-sm font-semibold text-[#64748B]">Menyiapkan arena petualangan...</p>
    </div>
  );
}

async function PlayPageContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ level?: string }>;
}) {
  await connection();
  const { level: requestedLevelCode } = await searchParamsPromise;

  // 1. Verifikasi sesi guest di server (Protected Route)
  const session = await resolveGuestSession();
  if (!session) {
    redirect("/profile/create");
  }

  // 2. Ambil profil pemain yang sah dari database
  let profile = null;
  try {
    profile = await GuestProfileService.getCurrentProfile();
  } catch {
    redirect("/profile/create");
  }

  // 3. Ambil data konfigurasi level dari Supabase (Runtime Database Integration)
  const levelService = new LevelService();
  let levels = [];
  let databaseError: string | null = null;

  try {
    levels = await levelService.getActiveLevels();
  } catch (err: unknown) {
    databaseError = err instanceof Error ? err.message : "Gagal terhubung ke database level Supabase.";
  }

  // 4. Penanganan kegagalan database secara eksplisit (Anti Fake Persistence)
  if (databaseError || levels.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto my-12 bg-white rounded-3xl border-2 border-[#FF8787]/30 p-8 shadow-sm text-center">
        <div className="inline-flex p-3 rounded-full bg-[#FF8787]/15 text-[#FA5252] mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#26334D]">Kendala Memuat Permainan</h2>
        <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
          Data level belum dapat dimuat dari database server saat ini.
        </p>
        {databaseError && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 text-left text-xs font-mono text-slate-600 wrap-break-word">
            {databaseError}
          </div>
        )}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <Link
            href="/play"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#12B886] px-4 py-3 text-sm font-bold text-white shadow-[0_4px_0_#087F5B] hover:bg-[#0fa678] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Muat Ulang</span>
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center justify-center rounded-2xl border-2 border-[#E8EDF5] bg-white px-4 py-3 text-sm font-bold text-[#26334D] hover:bg-slate-50 transition-colors"
          >
            Peta Petualangan
          </Link>
        </div>
      </div>
    );
  }

  // 3.5 Ambil riwayat progress pemain dari Supabase untuk pemulihan (Persistence Restoration)
  const progressService = new ProgressService();
  let playerProgress: PlayerProgressDTO[] = [];
  try {
    playerProgress = await progressService.getPlayerProgress(session, profile.id);
  } catch (err: unknown) {
    console.warn("Gagal memuat player progress dari database:", err);
  }

  // Build progressMap
  const progressMap: Record<string, LevelProgress> = {};
  for (const p of playerProgress) {
    if (p.levelCode) {
      progressMap[p.levelCode] = {
        status: p.status,
        stars: p.stars,
        bestAttempts: p.bestAttempts,
      };
    }
  }

  const completedCodes = getCompletedCodes(progressMap);

  // Determine active level to play
  let activeCode = requestedLevelCode;

  if (activeCode) {
    const requestedLevel = getLevelByCode(activeCode);
    if (!requestedLevel) {
      activeCode = getLatestPlayableLevel(progressMap).code;
    } else {
      const unlocked = isLevelUnlocked(activeCode, completedCodes);
      if (!unlocked) {
        // Show friendly locked level feedback
        return (
          <div className="relative overflow-hidden w-full max-w-md mx-auto my-12 bg-white rounded-3xl border-2 border-[#E8EDF5] p-8 shadow-sm text-center">
            {/* Ambient soft glow */}
            <div className="absolute -top-10 -left-10 w-36 h-36 bg-[#4DABF7]/10 rounded-full blur-2xl pointer-events-none -z-0" />
            <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-[#12B886]/10 rounded-full blur-2xl pointer-events-none -z-0" />

            <div className="relative z-10 mx-auto w-16 h-16 rounded-3xl bg-[#4DABF7]/15 border-2 border-[#4DABF7]/30 text-[#1971C2] flex items-center justify-center mb-4 shadow-sm">
              <Lock className="w-8 h-8 stroke-[2.5]" />
            </div>

            <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-[#4DABF7]/10 border border-[#4DABF7]/25 px-3.5 py-1 text-xs font-bold text-[#1971C2] mb-3">
              Misi Belum Terbuka
            </span>

            <h2 className="relative z-10 text-2xl font-black text-[#26334D] mb-2">
              Level {activeCode} Masih Terkunci
            </h2>
            <p className="relative z-10 text-sm text-[#64748B] leading-relaxed max-w-sm mx-auto mb-6">
              Kamu perlu menuntaskan tantangan di level sebelumnya terlebih dahulu untuk membuka level ini. Semangat ya!
            </p>

            <div className="relative z-10 flex flex-col sm:flex-row gap-2.5">
              <Link
                href={`/map/${requestedLevel.islandSlug}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#12B886] hover:bg-[#0fa678] px-5 py-3.5 text-sm font-bold text-white shadow-[0_4px_0_#087F5B] active:translate-y-1 active:shadow-none transition-all min-h-12 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Peta Pulau</span>
              </Link>
              <Link
                href={`/play?level=${getLatestPlayableLevel(progressMap).code}`}
                className="inline-flex items-center justify-center rounded-2xl border-2 border-[#E8EDF5] bg-white hover:bg-slate-50 px-4 py-3.5 text-sm font-bold text-[#26334D] transition-colors min-h-12 cursor-pointer"
              >
                Main Level Terbuka
              </Link>
            </div>
          </div>
        );
      }
    }
  } else {
    activeCode = getLatestPlayableLevel(progressMap).code;
  }

  return (
    <>
      <PlayerHeader profile={profile} levelCount={levels.length} />
      <LevelPlayer
        initialLevelCode={activeCode}
        initialProgress={playerProgress}
        avatarId={profile.avatarId}
      />
    </>
  );
}

export default function PlayPage({ searchParams }: PlayPageProps) {
  return (
    <main className="min-h-screen bg-[#FFFDF7] py-4 px-3 md:px-6 flex flex-col justify-start max-w-7xl mx-auto">
      <Suspense fallback={<PlayPageSkeleton />}>
        <PlayPageContent searchParamsPromise={searchParams} />
      </Suspense>
    </main>
  );
}
