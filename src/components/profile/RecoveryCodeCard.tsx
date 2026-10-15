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
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl border-2 border-[#E8EDF5] p-6 sm:p-8 shadow-sm text-center">
      {/* Celebration Header */}
      <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#12B886]/10 text-[#087F5B] mb-3">
        <Sparkles className="w-7 h-7" />
      </div>

      <div className="flex justify-center mb-3">
        <BotiAvatarIcon avatarId={avatarId} className="w-20 h-20" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-black text-[#26334D]">
        Selamat Bergabung, <span className="text-[#12B886]">{nickname}</span>!
      </h2>
      <p className="mt-2 text-sm text-[#64748B]">
        Profil petualangmu sudah siap. Sebelum melangkah, ini kunci rahasiamu:
      </p>

      {/* Recovery Code Box */}
      <div className="mt-5 rounded-2xl border-2 border-dashed border-[#F59F00]/50 bg-[#FFD43B]/10 p-5">
        <span className="text-xs font-bold uppercase tracking-wider text-[#B45309] block mb-1">
          Kode Petualangan Rahasia
        </span>
        <div className="my-2 flex items-center justify-center">
          <span
            id="text-recovery-code"
            className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-[#26334D] select-all"
          >
            {recoveryCode}
          </span>
        </div>

        <button
          id="btn-copy-code"
          type="button"
          onClick={handleCopy}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#FFD43B] px-4 py-2.5 text-xs font-bold text-[#78350F] shadow-[0_3px_0_#F59F00] hover:bg-[#fcc419] transition-all active:translate-y-0.5 active:shadow-none cursor-pointer min-h-11"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-[#087F5B] stroke-3" />
              <span className="text-[#087F5B]">Tersalin ke Clipboard!</span>
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
      <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-[#FFFDF7] border border-[#E8EDF5] p-3.5 text-left">
        <ShieldAlert className="h-5 w-5 text-[#F59F00] shrink-0 mt-0.5" />
        <p className="text-xs text-[#64748B] leading-relaxed">
          <strong className="text-[#26334D]">Catat atau simpan kode ini ya!</strong> Kamu bisa memakainya kapan saja untuk
          melanjutkan petualangan jika membuka LaskarCode di komputer atau HP lain.
        </p>
      </div>

      {/* Primary Action Button to Adventure */}
      <div className="mt-7">
        <Link
          id="btn-start-adventure"
          href="/map"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#12B886] px-6 py-3.5 text-base font-bold text-white shadow-[0_5px_0_#087F5B] hover:bg-[#0fa678] transition-all active:translate-y-1 active:shadow-none min-h-13"
        >
          <span>Buka Peta Petualangan</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
