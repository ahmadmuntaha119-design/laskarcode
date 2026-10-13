"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";
import { BotiAvatarIcon } from "./avatars";

interface RecoveryCodeCardProps {
  nickname: string;
  avatarId: string;
  recoveryCode: string;
}

export function RecoveryCodeCard({
  nickname,
  avatarId,
  recoveryCode,
}: RecoveryCodeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback jika clipboard API dicegah browser
      const textarea = document.createElement("textarea");
      textarea.value = recoveryCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl text-center">
      {/* Celebration Header */}
      <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-100 text-emerald-700 mb-4 animate-bounce">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="flex justify-center mb-4">
        <BotiAvatarIcon avatarId={avatarId} className="w-20 h-20" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
        Selamat Bergabung, <span className="text-emerald-600">{nickname}</span>!
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Profil petualangmu sudah siap. Sebelum melangkah, ini kunci rahasiamu:
      </p>

      {/* Recovery Code Box */}
      <div className="mt-6 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 block mb-1">
          Kode Petualangan Rahasia
        </span>
        <div className="my-2 flex items-center justify-center">
          <span
            id="text-recovery-code"
            className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-slate-900 select-all"
          >
            {recoveryCode}
          </span>
        </div>

        <button
          id="btn-copy-code"
          type="button"
          onClick={handleCopy}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-200/80 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-300 transition-colors active:scale-95 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-700 stroke-3" />
              <span className="text-emerald-800">Tersalin ke Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Salin Kode Petualangan</span>
            </>
          )}
        </button>
      </div>

      {/* Child-friendly Advisory Warning */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-left">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>Catat atau simpan kode ini!</strong> Kamu bisa memakainya kapan saja untuk
          melanjutkan petualangan jika membuka LaskarCode di komputer atau HP lain.
        </p>
      </div>

      {/* Primary Action Button to Adventure */}
      <div className="mt-8">
        <Link
          id="btn-start-adventure"
          href="/play"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-500 hover:shadow-emerald-300 transition-all active:scale-98"
        >
          <span>🚀 Siap, Menuju Petualangan!</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
