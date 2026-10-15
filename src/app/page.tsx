import React, { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  Sparkles,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Gamepad2,
  Compass,
  Trophy,
  ShieldCheck,
  Star,
} from "lucide-react";
import { resolveGuestSession } from "@/lib/session/resolveSession";
import { GuestProfileService } from "@/services/guestProfileService";
import { BotiAvatarIcon } from "@/components/profile/avatars";
import {
  HeroBotiStage,
  BenefitBlockIllustration,
  BenefitWorldIllustration,
  BenefitRetryIllustration,
} from "@/components/landing/LandingVisuals";

/* ========================================================================= */
/* NAVBAR USER ACTIONS (Streaming with Suspense for PPR)                      */
/* ========================================================================= */

function DefaultNavAction() {
  return (
    <div className="flex items-center gap-2">
      <Link
        id="link-nav-recover-default"
        href="/profile/recover"
        className="inline-flex items-center gap-1.5 rounded-xl border border-candy-border bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-candy-text hover:bg-candy-bg transition-colors shadow-2xs min-h-10 cursor-pointer"
      >
        <KeyRound className="w-4 h-4 text-candy-muted" />
        <span className="hidden xs:inline">Punya Kode?</span>
        <span className="xs:hidden">Masuk</span>
      </Link>
      <Link
        id="link-nav-start-default"
        href="/profile/create"
        className="inline-flex items-center gap-1.5 rounded-xl bg-candy-green hover:bg-candy-darkgreen px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition-all active:scale-95 min-h-10 cursor-pointer"
      >
        <span>Mulai Main</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

async function NavUserAction() {
  await connection();
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
      <div className="flex items-center gap-2 sm:gap-2.5 rounded-full bg-emerald-50 border border-emerald-200 py-1 px-2.5 sm:px-3">
        <BotiAvatarIcon avatarId={currentProfile.avatarId} className="w-6 h-6" />
        <span className="text-xs font-bold text-candy-text max-w-[100px] sm:max-w-none truncate">
          {currentProfile.nickname}
        </span>
        <Link
          id="link-nav-play"
          href="/map"
          className="rounded-full bg-candy-green hover:bg-candy-darkgreen px-3 py-1 text-xs font-bold text-white shadow-xs transition-colors"
        >
          Peta Dunia
        </Link>
      </div>
    );
  }

  return <DefaultNavAction />;
}

/* ========================================================================= */
/* HERO CTA BUTTONS (Streaming with Suspense for PPR)                        */
/* ========================================================================= */

function DefaultHeroActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full max-w-lg">
      <Link
        id="link-start-adventure"
        href="/profile/create"
        className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-candy-green hover:bg-candy-darkgreen px-8 py-4 text-base sm:text-lg font-black text-white shadow-[0_5px_0_#087F5B] hover:translate-y-0.5 hover:shadow-[0_3px_0_#087F5B] active:translate-y-1.5 active:shadow-none transition-all min-h-13 cursor-pointer"
      >
        <span>Mulai Petualangan</span>
        <ArrowRight className="h-5 w-5 stroke-[2.5]" />
      </Link>
      <Link
        id="link-recover-code-hero"
        href="/profile/recover"
        className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-candy-border bg-white hover:bg-candy-bg px-6 py-4 text-sm sm:text-base font-bold text-candy-text shadow-[0_4px_0_#E8EDF5] hover:translate-y-0.5 active:translate-y-1.5 active:shadow-none transition-all min-h-13 cursor-pointer"
      >
        <KeyRound className="w-4 h-4 text-candy-muted" />
        <span>Sudah Punya Kode?</span>
      </Link>
    </div>
  );
}

async function HeroActionButtons() {
  await connection();
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full max-w-lg">
        <Link
          id="link-continue-adventure"
          href="/map"
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-candy-green hover:bg-candy-darkgreen px-8 py-4 text-base sm:text-lg font-black text-white shadow-[0_5px_0_#087F5B] hover:translate-y-0.5 hover:shadow-[0_3px_0_#087F5B] active:translate-y-1.5 active:shadow-none transition-all min-h-13 cursor-pointer"
        >
          <span>Lanjut Petualangan ({currentProfile.nickname})</span>
          <ArrowRight className="h-5 w-5 stroke-[2.5]" />
        </Link>
        <Link
          id="link-switch-profile"
          href="/profile/create"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-candy-border bg-white hover:bg-candy-bg px-6 py-4 text-sm sm:text-base font-bold text-candy-text shadow-[0_4px_0_#E8EDF5] hover:translate-y-0.5 active:translate-y-1.5 active:shadow-none transition-all min-h-13 cursor-pointer"
        >
          Ganti Profil
        </Link>
      </div>
    );
  }

  return <DefaultHeroActionButtons />;
}

/* ========================================================================= */
/* FINAL CTA BUTTON (Streaming with Suspense for PPR)                        */
/* ========================================================================= */

function DefaultFinalCtaButton() {
  return (
    <Link
      id="link-final-cta-start"
      href="/profile/create"
      className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-candy-green hover:bg-candy-darkgreen px-8 py-4 text-base sm:text-lg font-black text-white shadow-[0_5px_0_#087F5B] hover:translate-y-0.5 hover:shadow-[0_3px_0_#087F5B] active:translate-y-1.5 active:shadow-none transition-all min-h-13 cursor-pointer"
    >
      <span>Mulai Petualangan</span>
      <ArrowRight className="h-5 w-5 stroke-[2.5]" />
    </Link>
  );
}

async function FinalCtaButton() {
  await connection();
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
      <Link
        id="link-final-cta-continue"
        href="/map"
        className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-candy-green hover:bg-candy-darkgreen px-8 py-4 text-base sm:text-lg font-black text-white shadow-[0_5px_0_#087F5B] hover:translate-y-0.5 hover:shadow-[0_3px_0_#087F5B] active:translate-y-1.5 active:shadow-none transition-all min-h-13 cursor-pointer"
      >
        <span>Buka Peta Petualangan ({currentProfile.nickname})</span>
        <ArrowRight className="h-5 w-5 stroke-[2.5]" />
      </Link>
    );
  }

  return <DefaultFinalCtaButton />;
}

/* ========================================================================= */
/* MAIN LANDING PAGE COMPONENT                                               */
/* ========================================================================= */

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-candy-bg text-candy-text selection:bg-candy-green/20">
      
      {/* =================================================================== */}
      {/* SECTION 1: NAVIGATION                                               */}
      {/* =================================================================== */}
      <header className="w-full border-b border-candy-border bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Mark */}
          <Link href="/" className="flex items-center gap-2.5 group transition-transform active:scale-95">
            <BotiAvatarIcon avatarId="boti_explorer" className="w-9 h-9 drop-shadow-xs" />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-candy-text leading-none">
                Laskar<span className="text-candy-green">Code</span>
              </span>
              <span className="text-[10px] font-bold text-candy-muted uppercase tracking-wider">
                Game Edukasi Coding
              </span>
            </div>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center">
            <Suspense fallback={<DefaultNavAction />}>
              <NavUserAction />
            </Suspense>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* SECTION 2: HERO                                                     */}
      {/* =================================================================== */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:py-16 lg:py-20 px-4 sm:px-8">
        {/* Subtle decorative background ambient dots/orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-emerald-100/40 blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-sky-100/40 blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Text & Hero CTA */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Playful Pill Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs sm:text-sm font-bold text-emerald-800 shadow-2xs">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>Petualangan Belajar Coding untuk Anak SD</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-candy-text leading-[1.15]">
              Belajar Coding Jadi{" "}
              <span className="text-candy-green drop-shadow-xs">
                Petualangan!
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-base sm:text-lg lg:text-xl text-candy-muted font-medium max-w-xl leading-relaxed">
              Bantu <strong>Boti</strong> menjelajah dunia, menyelesaikan tantangan, dan belajar menyusun instruksi pertamanya.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 w-full flex justify-center lg:justify-start">
              <Suspense fallback={<DefaultHeroActionButtons />}>
                <HeroActionButtons />
              </Suspense>
            </div>

            {/* Child-friendly Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs font-bold text-candy-muted">
              <div className="flex items-center gap-1.5 rounded-full bg-white border border-candy-border px-3 py-1.5 shadow-2xs">
                <Gamepad2 className="w-3.5 h-3.5 text-candy-green" />
                <span>100% Gratis & Edukatif</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white border border-candy-border px-3 py-1.5 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                <span>Tanpa Password & Aman</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white border border-candy-border px-3 py-1.5 shadow-2xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>Ramah Usia 7–12 Tahun</span>
              </div>
            </div>
          </div>

          {/* Right Column: Whimsical Boti Game Stage */}
          <div className="lg:col-span-5 flex justify-center order-first lg:order-last">
            <HeroBotiStage />
          </div>

        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 3: LEARNING BENEFITS (TIGA MANFAAT INTI)                     */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 border-t border-candy-border bg-white/70">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-3">
              Serunya Belajar
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-candy-text tracking-tight">
              Tiga Langkah Mudah Menjadi Penjelajah Kode
            </h2>
            <p className="mt-3 text-sm sm:text-base text-candy-muted leading-relaxed">
              Dirancang khusus agar anak memahami dasar logika dan algoritma secara alami, ceria, dan penuh rasa ingin tahu.
            </p>
          </div>

          {/* 3 Cohesive Benefit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Card 1: Susun Blok Coding */}
            <div className="group rounded-3xl bg-white p-7 sm:p-8 border-2 border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="mb-5 transition-transform duration-300 group-hover:scale-105">
                  <BenefitBlockIllustration />
                </div>
                <h3 className="text-xl font-extrabold text-candy-text">
                  Susun Blok Coding
                </h3>
                <p className="mt-2.5 text-sm text-candy-muted leading-relaxed">
                  Belajar memberi instruksi dengan balok visual berwarna-warni tanpa perlu mengetik kode rumit. Tarik, pasang, dan jalankan petunjuk arah Boti!
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-50 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Konsep Urutan Langkah (Sequence)</span>
              </div>
            </div>

            {/* Card 2: Jelajahi Dunia Boti */}
            <div className="group rounded-3xl bg-white p-7 sm:p-8 border-2 border-sky-100 hover:border-sky-300 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="mb-5 transition-transform duration-300 group-hover:scale-105">
                  <BenefitWorldIllustration />
                </div>
                <h3 className="text-xl font-extrabold text-candy-text">
                  Jelajahi Dunia Boti
                </h3>
                <p className="mt-2.5 text-sm text-candy-muted leading-relaxed">
                  Pecahkan teka-teki seru di Pulau Desa Boti dan Hutan Pola. Setiap level menyuguhkan jalur berliku yang memancing imajinasi dan rasa penasaran.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-sky-50 flex items-center gap-1.5 text-xs font-bold text-sky-700">
                <Compass className="w-4 h-4 text-sky-500" />
                <span>12 Level di 2 Pulau Petualangan</span>
              </div>
            </div>

            {/* Card 3: Belajar dari Kesalahan */}
            <div className="group rounded-3xl bg-white p-7 sm:p-8 border-2 border-rose-100 hover:border-rose-300 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="mb-5 transition-transform duration-300 group-hover:scale-105">
                  <BenefitRetryIllustration />
                </div>
                <h3 className="text-xl font-extrabold text-candy-text">
                  Belajar dari Kesalahan
                </h3>
                <p className="mt-2.5 text-sm text-candy-muted leading-relaxed">
                  Jalan Boti terhalang rintangan? Tidak masalah! Anak diajak mencoba kembali dengan berani, melatih daya juang dan pemecahan masalah tanpa rasa takut salah.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-rose-50 flex items-center gap-1.5 text-xs font-bold text-rose-700">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Eksplorasi Tanpa Takut Salah</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 4: HOW IT WORKS (PETUALANGAN 3 LANGKAH)                    */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 border-t border-candy-border bg-candy-bg">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-1 text-xs font-extrabold text-sky-800 uppercase tracking-wider mb-3">
              Cara Bermain
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-candy-text tracking-tight">
              Hanya 3 Langkah untuk Memulai
            </h2>
            <p className="mt-3 text-sm sm:text-base text-candy-muted leading-relaxed">
              Langsung bermain di browser HP, tablet, atau laptop tanpa instalasi aplikasi berat.
            </p>
          </div>

          {/* 3 Step Journey Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="rounded-3xl bg-white p-7 sm:p-8 border-2 border-candy-border shadow-xs relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-900 font-black text-lg flex items-center justify-center mb-5 shadow-xs">
                  01
                </div>
                <h3 className="text-xl font-extrabold text-candy-text">
                  Pilih Sahabat Boti
                </h3>
                <p className="mt-2 text-sm text-candy-muted leading-relaxed">
                  Buat profil petualang dengan nama panggilan dan karakter robot favoritmu. Bebas dari email atau kata sandi yang sulit diingat anak.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-candy-border/60 text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Tanpa Email & Password</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl bg-white p-7 sm:p-8 border-2 border-candy-border shadow-xs relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-100 border-2 border-sky-300 text-sky-900 font-black text-lg flex items-center justify-center mb-5 shadow-xs">
                  02
                </div>
                <h3 className="text-xl font-extrabold text-candy-text">
                  Susun Balok Arah
                </h3>
                <p className="mt-2 text-sm text-candy-muted leading-relaxed">
                  Bantu Boti dengan menyusun balok instruksi: maju, belok kanan, dan belok kiri untuk menemukan rute paling tepat mencapai bintang sasaran.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-candy-border/60 text-xs font-bold text-sky-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Visual Programming Blockly</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl bg-white p-7 sm:p-8 border-2 border-candy-border shadow-xs relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-900 font-black text-lg flex items-center justify-center mb-5 shadow-xs">
                  03
                </div>
                <h3 className="text-xl font-extrabold text-candy-text">
                  Raih Bintang & Buka Pulau
                </h3>
                <p className="mt-2 text-sm text-candy-muted leading-relaxed">
                  Dapatkan hingga 3 bintang di setiap level, selesaikan Desa Boti, dan buka jembatan penyeberangan menuju Pulau Hutan Pola!
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-candy-border/60 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-emerald-600" />
                <span>Kumpulkan 36 Bintang Petualang</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 5: FINAL CTA                                                */}
      {/* =================================================================== */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 border-t border-candy-border">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-linear-to-br from-emerald-500/10 via-amber-400/15 to-sky-400/10 p-8 sm:p-12 lg:p-14 border-2 border-emerald-200/80 text-center overflow-hidden shadow-sm">
            
            {/* Ambient decorative background sparkles */}
            <div className="absolute top-4 left-6 text-amber-300 text-xl animate-spin [animation-duration:8s]">✨</div>
            <div className="absolute bottom-6 right-8 text-sky-300 text-2xl animate-bounce [animation-duration:3s]">⭐</div>
            <div className="absolute top-1/2 right-6 -translate-y-1/2 w-32 h-32 rounded-full bg-emerald-300/20 blur-2xl -z-10" />

            <div className="flex justify-center mb-4">
              <div className="p-2 rounded-2xl bg-white shadow-xs border border-emerald-100">
                <BotiAvatarIcon avatarId="boti_explorer" className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-candy-text tracking-tight">
              Petualangan Boti Menunggumu!
            </h2>
            <p className="mt-3 text-base sm:text-lg text-candy-muted max-w-xl mx-auto leading-relaxed">
              Yuk, mulai langkah pertamamu dan temukan serunya belajar coding bersama robot sahabatmu.
            </p>

            <div className="mt-8 flex justify-center">
              <Suspense fallback={<DefaultFinalCtaButton />}>
                <FinalCtaButton />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 6: FOOTER                                                   */}
      {/* =================================================================== */}
      <footer className="w-full border-t border-candy-border bg-white py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <BotiAvatarIcon avatarId="boti_explorer" className="w-7 h-7" />
            <span className="font-black text-base text-candy-text">
              Laskar<span className="text-candy-green">Code</span>
            </span>
            <span className="text-candy-muted/40">•</span>
            <span className="text-xs text-candy-muted">
              Petualangan kecil untuk melatih cara berpikir besar.
            </span>
          </div>

          <div className="text-xs text-candy-muted">
            <p>© LaskarCode • Game Edukasi Coding Anak SD • Telkomsel Coding Competition</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
