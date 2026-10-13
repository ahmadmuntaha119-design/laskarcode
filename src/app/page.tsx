import React, { Suspense } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, KeyRound, Blocks, Bot, Compass, ShieldCheck } from "lucide-react";
import { resolveGuestSession } from "@/lib/session/resolveSession";
import { GuestProfileService } from "@/services/guestProfileService";
import { BotiAvatarIcon } from "@/components/profile/avatars";

function DefaultNavAction() {
  return (
    <Link
      id="link-nav-recover-default"
      href="/profile/recover"
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
    >
      <KeyRound className="w-3.5 h-3.5 text-slate-500" />
      <span>Punya Kode?</span>
    </Link>
  );
}

async function NavUserAction() {
  const session = await resolveGuestSession();
  let currentProfile = null;

  if (session) {
    try {
      currentProfile = await GuestProfileService.getCurrentProfile();
    } catch {
      currentProfile = null;
    }
  }

  if (currentProfile) {
    return (
      <div className="flex items-center gap-2.5 rounded-full bg-emerald-50 border border-emerald-200 py-1 px-3">
        <BotiAvatarIcon avatarId={currentProfile.avatarId} className="w-6 h-6" />
        <span className="text-xs font-bold text-emerald-900 hidden sm:inline">
          {currentProfile.nickname}
        </span>
        <Link
          id="link-nav-play"
          href="/play"
          className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
        >
          Masuk Game
        </Link>
      </div>
    );
  }

  return <DefaultNavAction />;
}

function DefaultHeroActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md justify-center">
      <Link
        id="link-start-adventure"
        href="/profile/create"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-500 hover:scale-102 transition-all active:scale-98"
      >
        <span>🚀 Mulai Petualangan</span>
        <ArrowRight className="h-5 w-5" />
      </Link>
      <Link
        id="link-recover-code-hero"
        href="/profile/recover"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
      >
        <KeyRound className="w-4 h-4 text-slate-500" />
        <span>Punya Kode Petualangan?</span>
      </Link>
    </div>
  );
}

async function HeroActionButtons() {
  const session = await resolveGuestSession();
  let currentProfile = null;

  if (session) {
    try {
      currentProfile = await GuestProfileService.getCurrentProfile();
    } catch {
      currentProfile = null;
    }
  }

  if (currentProfile) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md justify-center">
        <Link
          id="link-continue-adventure"
          href="/play"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-500 hover:scale-102 transition-all active:scale-98"
        >
          <span>Lanjut Petualangan ({currentProfile.nickname})</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
        <Link
          id="link-switch-profile"
          href="/profile/create"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
        >
          Ganti Profil
        </Link>
      </div>
    );
  }

  return <DefaultHeroActionButtons />;
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-sky-50 via-white to-emerald-50 text-slate-800">
      {/* Top Navigation */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BotiAvatarIcon avatarId="boti_default" className="w-9 h-9" />
            <span className="text-xl font-black tracking-tight text-slate-900">
              Laskar<span className="text-emerald-600">Code</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Suspense fallback={<DefaultNavAction />}>
              <NavUserAction />
            </Suspense>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-12 sm:py-16 flex flex-col items-center text-center justify-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100/80 px-4 py-1.5 text-xs sm:text-sm font-bold text-emerald-800 shadow-xs">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span>Edukasi Coding Ceria Anak SD berbasis Visual AI</span>
        </div>

        {/* Mascot Animation / Presentation */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-linear-to-tr from-emerald-200 to-sky-200 opacity-60 blur-xl animate-pulse"></div>
          <div className="relative rounded-3xl bg-white/90 p-4 shadow-xl border border-slate-100">
            <BotiAvatarIcon avatarId="boti_default" className="w-28 h-28 sm:w-36 sm:h-36" />
          </div>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 max-w-3xl leading-tight">
          Petualangan kecil untuk melatih{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500 underline decoration-emerald-300">
            cara berpikir besar
          </span>.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
          Bantu <strong>Boti</strong> menuntaskan misi di pulau teka-teki logika menggunakan balok kode visual. Belajar berpikir algoritmis, urutan langkah (sequence), dan pemecahan masalah dengan cara menyenangkan!
        </p>

        {/* CTA Actions (Streaming with Suspense for Partial Prerendering) */}
        <div className="mt-8 w-full flex justify-center">
          <Suspense fallback={<DefaultHeroActionButtons />}>
            <HeroActionButtons />
          </Suspense>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left w-full">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-xs">
            <div className="rounded-xl bg-emerald-100 p-2.5 w-fit text-emerald-700 mb-3">
              <Blocks className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Visual Block Coding</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Balok logika intuitif berbasis Blockly yang mudah dipahami tanpa perlu mengetik kode rumit.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-xs">
            <div className="rounded-xl bg-sky-100 p-2.5 w-fit text-sky-700 mb-3">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Boti Si Sahabat Ceria</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Game Engine deterministic memastikan gerakan Boti selalu pasti, adil, dan konsisten.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-xs">
            <div className="rounded-xl bg-amber-100 p-2.5 w-fit text-amber-700 mb-3">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Petualangan 2 Pulau</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Jelajahi Desa Boti dan Hutan Pola dengan 12 level puzzle bertahap dari pemula hingga master.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-xs">
            <div className="rounded-xl bg-teal-100 p-2.5 w-fit text-teal-700 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Aman & Ramah Anak</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Tanpa email, tanpa password, dan tanpa pelacakan data pribadi. Kode Petualangan untuk pemulihan mudah.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <p>LaskarCode — Platform Edukasi Coding Anak SD • M-One Telkomsel Coding Competition</p>
      </footer>
    </div>
  );
}
