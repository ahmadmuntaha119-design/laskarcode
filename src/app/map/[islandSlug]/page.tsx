import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { resolveGuestSession } from "@/lib/session/resolveSession";
import { GuestProfileService } from "@/services/guestProfileService";
import { LevelService } from "@/services/levelService";
import { ProgressService } from "@/services/progressService";
import type { PlayerProgressDTO } from "@/services/types";
import { getIslandBySlug } from "@/game/levels/catalog";
import type { LevelProgress } from "@/game/levels/progression";
import { IslandMap } from "@/components/game/map/IslandMap";
import { PlayerHeader } from "@/components/game/PlayerHeader";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";

type PageProps = {
  params: Promise<{
    islandSlug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { islandSlug } = await params;
  const island = getIslandBySlug(islandSlug);
  return {
    title: island ? `Peta ${island.name} — LaskarCode` : "Peta Pulau — LaskarCode",
    description: island?.description ?? "Petualangan coding seru untuk anak SD.",
  };
}

function IslandPageSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-[#12B886]" />
      <p className="text-sm font-semibold text-[#64748B]">Membuka jalur pulau...</p>
    </div>
  );
}

export function generateStaticParams() {
  return [
    { islandSlug: "desa-boti" },
    { islandSlug: "hutan-pola" },
  ];
}

async function IslandPageContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ islandSlug: string }>;
}) {
  await connection();
  const { islandSlug } = await paramsPromise;

  const island = getIslandBySlug(islandSlug);
  if (!island) {
    notFound();
  }

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
        <h2 className="text-2xl font-black text-[#26334D]">Kendala Memuat Pulau</h2>
        <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
          Peta pulau belum dapat memuat data level. Silakan coba muat ulang halaman ini ya.
        </p>
        {databaseError && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 text-left text-xs font-mono text-slate-600 wrap-break-word">
            {databaseError}
          </div>
        )}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <Link
            href={`/map/${islandSlug}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#12B886] px-4 py-3 text-sm font-bold text-white shadow-[0_4px_0_#087F5B] hover:bg-[#0fa678] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Muat Ulang</span>
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center justify-center rounded-2xl border-2 border-[#E8EDF5] bg-white px-4 py-3 text-sm font-bold text-[#26334D] hover:bg-slate-50 transition-colors"
          >
            Peta Dunia
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

  return (
    <>
      <PlayerHeader profile={profile} levelCount={levels.length} />
      <IslandMap island={island} profile={profile} progressMap={progressMap} />
    </>
  );
}

export default function IslandRoutePage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-[#FFFDF7] py-4 px-3 md:px-6 flex flex-col justify-start max-w-7xl mx-auto">
      <Suspense fallback={<IslandPageSkeleton />}>
        <IslandPageContent paramsPromise={params} />
      </Suspense>
    </main>
  );
}
