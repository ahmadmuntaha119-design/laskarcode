import React, { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { resolveGuestSession } from "@/lib/session/resolveSession";
import { GuestProfileService } from "@/services/guestProfileService";
import { LevelService } from "@/services/levelService";
import { ProgressService } from "@/services/progressService";
import type { PlayerProgressDTO } from "@/services/types";
import { getLatestPlayableLevel, type LevelProgress } from "@/game/levels/progression";
import { AdventureWorldMap } from "@/components/game/map/AdventureWorldMap";
import { PlayerHeader } from "@/components/game/PlayerHeader";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Peta Petualangan Dunia — LaskarCode",
  description: "Jelajahi Pulau Desa Boti dan Hutan Pola bersama sahabat robot Boti.",
};

function MapPageSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-laskar-forest" />
      <p className="text-sm font-semibold text-[#5E726B]">Membuka peta kepulauan...</p>
    </div>
  );
}

async function MapPageContent() {
  await connection();

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

  // 3. Ambil data konfigurasi level dari database
  const levelService = new LevelService();
  let levels = [];
  let databaseError: string | null = null;

  try {
    levels = await levelService.getActiveLevels();
  } catch (err: unknown) {
    databaseError =
      err instanceof Error ? err.message : "Gagal terhubung ke database level Supabase.";
  }

  // 4. Penanganan kegagalan database secara eksplisit (Anti Fake Persistence)
  if (databaseError || levels.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto my-12 bg-white rounded-3xl border-2 border-[#FF8787]/30 p-8 shadow-sm text-center">
        <div className="inline-flex p-3 rounded-full bg-[#FF8787]/15 text-[#FA5252] mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#26334D]">Kendala Memuat Peta</h2>
        <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
          Peta petualangan belum dapat memuat data level. Silakan coba muat ulang halaman ini ya.
        </p>
        {databaseError && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 text-left text-xs font-mono text-slate-600 wrap-break-word">
            {databaseError}
          </div>
        )}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <Link
            href="/map"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#12B886] px-4 py-3 text-sm font-bold text-white shadow-[0_4px_0_#087F5B] hover:bg-[#0fa678] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Muat Ulang</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border-2 border-[#E8EDF5] bg-white px-4 py-3 text-sm font-bold text-[#26334D] hover:bg-slate-50 transition-colors"
          >
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  // 5. Ambil riwayat progress pemain dari database
  const progressService = new ProgressService();
  let playerProgress: PlayerProgressDTO[] = [];
  try {
    playerProgress = await progressService.getPlayerProgress(session, profile.id);
  } catch (err: unknown) {
    console.warn("Gagal memuat progress pemain:", err);
  }

  // Build progressMap for progression utilities
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

  const latestLevel = getLatestPlayableLevel(progressMap);

  return (
    <>
      <PlayerHeader profile={profile} levelCount={levels.length} />
      <AdventureWorldMap
        profile={profile}
        progressMap={progressMap}
        latestLevel={latestLevel}
      />
    </>
  );
}

export default function WorldMapPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF7] py-4 px-3 md:px-6 flex flex-col justify-start max-w-7xl mx-auto">
      <Suspense fallback={<MapPageSkeleton />}>
        <MapPageContent />
      </Suspense>
    </main>
  );
}
