"use client";

import React, { useState, useCallback } from "react";
import { Bot, Lightbulb, Sparkles, Loader2, ArrowRight, X, AlertCircle } from "lucide-react";
import type { HintLevel, HintResponse } from "@/lib/ai/types";

export interface KawanKodHintProps {
  levelCode: string;
  currentErrorType?: string | null;
  disabled?: boolean;
  attemptId?: string | null;
}

const HINT_LEVEL_LABELS: Record<HintLevel, { title: string; badge: string; color: string }> = {
  1: {
    title: "Amati Petualangan Cipi",
    badge: "Petunjuk 1: Observasi",
    color: "bg-[#4DABF7]/15 text-[#1971C2] border-[#4DABF7]/30",
  },
  2: {
    title: "Pikirkan Hubungan Langkah",
    badge: "Petunjuk 2: Penalaran",
    color: "bg-[#F59F00]/15 text-[#B45309] border-[#F59F00]/30",
  },
  3: {
    title: "Arahkan Bagian Balok",
    badge: "Petunjuk 3: Bimbingan Spesifik",
    color: "bg-[#7950F2]/15 text-[#5F3DC4] border-[#7950F2]/30",
  },
};

export function KawanKodHint({
  levelCode,
  currentErrorType,
  disabled = false,
  attemptId,
}: KawanKodHintProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState<HintLevel>(1);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [provider, setProvider] = useState<"gemini" | "fallback" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sinkronisasi reset state saat level berganti (pola resmi React tanpa useEffect)
  const [prevLevelCode, setPrevLevelCode] = useState(levelCode);
  if (prevLevelCode !== levelCode) {
    setPrevLevelCode(levelCode);
    setIsOpen(false);
    setIsLoading(false);
    setHintLevel(1);
    setHintMessage(null);
    setProvider(null);
    setErrorMessage(null);
  }

  const fetchHint = useCallback(
    async (targetLevel: HintLevel) => {
      if (isLoading || disabled) return;

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/ai/hint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            levelCode,
            hintLevel: targetLevel,
            currentErrorType: currentErrorType || undefined,
            attemptId: attemptId || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 429) {
            setErrorMessage(
              data.error ||
                "Permintaan petunjuk terlalu sering. Silakan coba pikirkan kembali langkahmu sebentar ya!"
            );
          } else if (response.status === 401) {
            setErrorMessage("Sesi bermain belum aktif. Silakan muat ulang halaman.");
          } else {
            setErrorMessage(
              data.error || "Kawan Kod sedang beristirahat sejenak. Yuk coba analisis langkahmu!"
            );
          }
          setIsOpen(true);
          return;
        }

        const validData = data as HintResponse;
        setHintMessage(validData.message);
        setHintLevel(validData.hintLevel);
        setProvider(validData.provider ?? null);
        setIsOpen(true);
      } catch {
        // Fallback network error
        setErrorMessage(
          "Jaringan terputus sejenak. Jangan khawatir, yuk amati kembali arah dan balok Boti!"
        );
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, disabled, levelCode, currentErrorType, attemptId]
  );

  const handleInitialClick = () => {
    if (!hintMessage) {
      void fetchHint(1);
    } else {
      setIsOpen(true);
    }
  };

  const handleNextLevel = () => {
    if (hintLevel < 3) {
      const nextLevel = (hintLevel + 1) as HintLevel;
      void fetchHint(nextLevel);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const levelInfo = HINT_LEVEL_LABELS[hintLevel];

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Tombol Utama: Minta Petunjuk Kawan Kod */}
      {!isOpen && (
        <button
          id="btn-ask-kawan-kod"
          type="button"
          onClick={handleInitialClick}
          disabled={disabled || isLoading}
          className={`group relative overflow-hidden flex items-center justify-between gap-3 w-full rounded-2xl border-2 px-4 py-3 transition-all cursor-pointer ${
            disabled
              ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
              : "border-[#7950F2]/30 bg-linear-to-r from-[#7950F2]/10 via-[#9775FA]/10 to-[#E599F7]/10 hover:border-[#7950F2]/60 hover:bg-[#7950F2]/15 shadow-xs active:translate-y-0.5"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#7950F2] to-[#5F3DC4] text-white shadow-xs group-hover:scale-105 transition-transform">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-sm text-[#5F3DC4]">
                  Tanya Kawan Kod
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-[#7950F2] bg-white/80 px-2 py-0.5 rounded-full border border-[#7950F2]/20">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI Mentor
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#7048E8] font-medium">
                {isLoading
                  ? "Kawan Kod sedang menyiapkan petunjuk..."
                  : hintMessage
                  ? `Petunjuk tingkat ${hintLevel} tersedia. Klik untuk membuka.`
                  : "Bingung atau terhalang? Dapatkan petunjuk bertahap di sini."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-black text-[#5F3DC4] shrink-0">
            {isLoading ? (
              <span className="text-[11px] text-slate-500">Memproses...</span>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 text-[#F59F00]" />
                <span className="hidden sm:inline">Minta Petunjuk</span>
              </>
            )}
          </div>
        </button>
      )}

      {/* Speech Bubble / Hint Card saat Terbuka */}
      {isOpen && (
        <div
          id="kawan-kod-hint-card"
          className="relative overflow-hidden rounded-3xl border-2 border-[#7950F2]/30 bg-white p-4 sm:p-5 shadow-md shadow-[#7950F2]/10 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          {/* Header Card: Avatar + Level Badge + Tombol Tutup */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#7950F2] to-[#5F3DC4] text-white shadow-xs">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-[#26334D]">Kawan Kod</h4>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${levelInfo.color}`}
                  >
                    {levelInfo.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] font-medium">{levelInfo.title}</p>
              </div>
            </div>

            <button
              id="btn-close-hint"
              type="button"
              onClick={handleClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Tutup petunjuk"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Isi Pesan Petunjuk / Loading / Error */}
          <div className="py-3.5">
            {isLoading ? (
              <div className="flex items-center gap-3 py-2 text-[#7950F2]">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs sm:text-sm font-semibold">
                  Kawan Kod sedang mengamati arena permainanmu...
                </span>
              </div>
            ) : errorMessage ? (
              <div className="flex items-start gap-2.5 rounded-2xl bg-[#FFF4E5] border border-[#F59F00]/30 p-3 text-[#B45309]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#F59F00]" />
                <p className="text-xs sm:text-sm font-medium leading-relaxed">{errorMessage}</p>
              </div>
            ) : hintMessage ? (
              <div className="relative rounded-2xl bg-[#F8F9FA] border border-slate-200/80 p-3.5 sm:p-4 text-[#26334D]">
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  &ldquo;{hintMessage}&rdquo;
                </p>

                {provider && (
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/60 pt-1.5">
                    <span>Tingkat {hintLevel} dari 3</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer Actions: Step Progression (Hint 1 -> 2 -> 3) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <span>Langkah Bantuan:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((step) => (
                  <span
                    key={step}
                    className={`h-2 rounded-full transition-all ${
                      step === hintLevel
                        ? "w-6 bg-[#7950F2]"
                        : step < hintLevel
                        ? "w-2 bg-[#7950F2]/50"
                        : "w-2 bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hintLevel < 3 ? (
                <button
                  id="btn-next-hint"
                  type="button"
                  onClick={handleNextLevel}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#7950F2] hover:bg-[#6741D9] text-white px-3.5 py-2 text-xs font-black shadow-xs transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Minta Petunjuk Berikutnya ({hintLevel + 1}/3)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[11px] font-extrabold text-[#087F5B] bg-[#12B886]/10 px-3 py-1.5 rounded-xl border border-[#12B886]/20">
                  Kamu pasti bisa! Coba susun baloknya sekarang!
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KawanKodHint;
