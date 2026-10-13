import React, { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { resolveGuestSession } from "@/lib/session/resolveSession";
import { GuestProfileService } from "@/services/guestProfileService";
import { LevelService } from "@/services/levelService";
import { LevelPlayer } from "@/components/game/LevelPlayer";
import { PlayerHeader } from "@/components/game/PlayerHeader";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Petualangan Level — LaskarCode",
  description: "Belajar coding dengan visual programming Blockly dan bantu Boti menuntaskan misi di Pulau Desa Boti dan Hutan Pola",
};

function PlayPageSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      <p className="text-sm font-semibold text-slate-600">Menyiapkan arena petualangan...</p>
    </div>
  );
}

async function PlayPageContent() {
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
      <div className="w-full max-w-md mx-auto my-12 bg-white rounded-3xl border border-rose-200 p-8 shadow-xl text-center">
        <div className="inline-flex p-3 rounded-full bg-rose-100 text-rose-600 mb-4 animate-bounce">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Kendala Database Supabase</h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Data level tidak dapat dimuat dari database server saat ini.
        </p>
        {databaseError && (
          <div className="mt-3 p-3 rounded-xl bg-slate-100 text-left text-xs font-mono text-slate-700 wrap-break-word">
            {databaseError}
          </div>
        )}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <Link
            href="/play"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Muat Ulang</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PlayerHeader profile={profile} levelCount={levels.length} />
      <LevelPlayer initialLevelCode="1.1" />
    </>
  );
}

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-4 px-3 md:px-6 flex flex-col justify-start max-w-7xl mx-auto">
      <Suspense fallback={<PlayPageSkeleton />}>
        <PlayPageContent />
      </Suspense>
    </main>
  );
}
