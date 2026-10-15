"use client";

import React from "react";
import { AlertTriangle, Info, Sparkles, Star, Loader2 } from "lucide-react";
import type { ControllerStatus } from "@/game/execution";

export type FeedbackBannerProps = {
  status: ControllerStatus;
  errorMessage?: string | null;
  collisions?: number;
  isGoal?: boolean;
  verifiedStars?: number | null;
  saveNotice?: string | null;
};

export function FeedbackBanner({
  status,
  errorMessage,
  collisions = 0,
  isGoal = false,
  verifiedStars = null,
  saveNotice = null,
}: FeedbackBannerProps) {
  if (errorMessage) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border-2 border-[#F59F00]/35 bg-[#FFF4E5] p-3.5 text-[#B45309] shadow-xs">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F59F00] text-white shadow-xs">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="text-xs sm:text-sm font-medium">
          <p className="font-extrabold text-[#78350F]">Periksa Balok Kode:</p>
          <p className="text-[#92400E]">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (status === "SUCCESS" || isGoal) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3.5 rounded-2xl border-2 border-[#12B886]/35 bg-[#12B886]/10 p-3.5 text-[#087F5B] shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#12B886] text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-sm text-[#087F5B]">Hebat, Cipi sampai ke Bintang!</h4>
            <p className="text-xs text-[#099268] font-medium">
              Kamu berhasil menemukan instruksi yang tepat.
            </p>
            {verifiedStars !== null && verifiedStars > 0 && (
              <div className="flex items-center gap-2 mt-1 text-xs font-black text-[#087F5B]">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: verifiedStars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#FFE66D] text-[#F59F00]" />
                  ))}
                </div>
                <span>{verifiedStars} Bintang Diperoleh!</span>
              </div>
            )}
          </div>
        </div>
        {saveNotice && (
          <div className="text-[11px] font-bold text-[#B45309] bg-[#FFF4E5] border border-[#F59F00]/30 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0 text-[#F59F00]" />
            <span>{saveNotice}</span>
          </div>
        )}
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3.5 rounded-2xl border-2 border-[#FF8787]/35 bg-[#FF8787]/12 p-3.5 text-[#C92A2A] shadow-xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FA5252] text-white shadow-xs">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-black text-sm text-[#C92A2A]">
              {collisions > 0 ? "Jalan Cipi terhalang" : "Yuk, coba lagi!"}
            </h4>
            <p className="text-xs text-[#E03131] font-medium mt-0.5">
              {collisions > 0
                ? "Cipi menyentuh batas grid. Periksa kembali arah dan jumlah langkah Cipi."
                : "Cipi belum mencapai target. Periksa kembali urutan langkahmu."}
            </p>
          </div>
        </div>
        {saveNotice && (
          <div className="text-xs font-bold text-[#C92A2A] bg-[#FF8787]/15 border border-[#FF8787]/30 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#FA5252]" />
            <span>{saveNotice}</span>
          </div>
        )}
      </div>
    );
  }

  if (status === "RUNNING") {
    return (
      <div className="flex items-center gap-3.5 rounded-2xl border-2 border-[#12B886]/25 bg-[#12B886]/10 p-3.5 text-[#087F5B] shadow-xs">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#12B886] text-white shadow-xs">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <div className="text-xs sm:text-sm font-medium">
          <p className="font-extrabold text-[#087F5B]">Cipi sedang bergerak...</p>
          <p className="text-[#099268]">Memeriksa setiap langkah yang kamu susun.</p>
        </div>
      </div>
    );
  }

  // IDLE status
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border-2 border-[#4DABF7]/25 bg-[#4DABF7]/10 p-3.5 text-[#1971C2] shadow-xs">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4DABF7] text-white shadow-xs">
        <Info className="h-5 w-5" />
      </div>
      <div className="text-xs sm:text-sm font-medium text-[#1864AB]">
        <span className="font-extrabold text-[#1971C2]">Petunjuk:</span> Tarik balok dari panel kanan, pasang di area kerja, lalu tekan tombol{" "}
        <span className="font-extrabold text-[#1971C2]">Jalankan</span>!
      </div>
    </div>
  );
}

export default FeedbackBanner;

