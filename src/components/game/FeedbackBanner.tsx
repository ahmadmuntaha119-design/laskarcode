"use client";

import React from "react";
import { AlertTriangle, Info, Sparkles } from "lucide-react";
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
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 shadow-sm animate-in fade-in">
        <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
        <div className="text-sm font-medium">
          <p className="font-bold">Perhatian:</p>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (status === "SUCCESS" || isGoal) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm animate-in zoom-in-95">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-800">🎉 Hore! Misi Berhasil!</h4>
            <p className="text-sm text-emerald-700">
              Boti berhasil sampai ke bintang target dengan selamat!
            </p>
            {verifiedStars !== null && verifiedStars > 0 && (
              <p className="text-xs font-bold text-amber-600 mt-1">
                ⭐ {verifiedStars} Bintang Diperoleh!
              </p>
            )}
          </div>
        </div>
        {saveNotice && (
          <div className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{saveNotice}</span>
          </div>
        )}
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm animate-in fade-in">
          <AlertTriangle className="h-6 w-6 shrink-0 text-rose-600" />
          <div>
            <h4 className="font-bold text-rose-800">
              {collisions > 0 ? "💥 Boti Menabrak Batas!" : "Belum Sampai Target"}
            </h4>
            <p className="text-sm text-rose-700">
              {collisions > 0
                ? "Boti menabrak tembok grid. Coba periksa kembali jumlah langkah Maju yang disusun!"
                : "Boti belum mencapai bintang. Tambahkan lebih banyak langkah untuk sampai!"}
            </p>
          </div>
        </div>
        {saveNotice && (
          <div className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{saveNotice}</span>
          </div>
        )}
      </div>
    );
  }

  if (status === "RUNNING") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-900 shadow-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-400 border-t-sky-700" />
        <div className="text-sm font-medium">
          <p className="font-semibold text-sky-900">Boti sedang bergerak...</p>
          <p className="text-sky-700">Memeriksa setiap langkah yang kamu susun.</p>
        </div>
      </div>
    );
  }

  // IDLE status
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700 shadow-sm">
      <Info className="h-5 w-5 shrink-0 text-slate-500" />
      <div className="text-sm">
        <span className="font-semibold text-slate-800">Petunjuk Level:</span> Tarik blok{" "}
        <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-800">Maju</span>{" "}
        dari panel kiri ke area kerja, sambungkan, lalu tekan tombol{" "}
        <span className="font-bold text-emerald-700">JALANKAN</span>!
      </div>
    </div>
  );
}

export default FeedbackBanner;
