"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { recoverPlayerProfileAction } from "@/app/actions/profileActions";
import { KeyRound, Loader2, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export function RecoverProfileForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^0-9A-Z-]/g, "");
    if (val.length > 20) val = val.slice(0, 20);
    setCode(val);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Masukkan Kode Petualanganmu terlebih dahulu.");
      return;
    }

    // Cek format dasar
    const formatRegex = /^(CIPI|BOTI)-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{2}$/i;
    if (!formatRegex.test(trimmed)) {
      setError("Kode belum cocok. Contoh format: CIPI-7K4P-92");
      return;
    }

    const formData = new FormData();
    formData.append("recoveryCode", trimmed);

    startTransition(async () => {
      try {
        const response = await recoverPlayerProfileAction(null, formData);
        if (!response.success) {
          setError(response.error || "Kode belum cocok. Periksa kembali kode petualanganmu.");
        } else {
          setIsSuccess(true);
          router.push("/map");
          router.refresh();
        }
      } catch {
        setError("Gagal menghubungi server. Periksa koneksi internetmu.");
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl border-2 border-[#12B886]/30 p-8 shadow-sm text-center">
        <div className="inline-flex p-3 rounded-full bg-[#12B886]/10 text-[#087F5B] mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#26334D]">Kode Berhasil Cocok!</h2>
        <p className="mt-2 text-sm text-[#64748B]">
          Memulihkan petualangan dan progresmu... Mengalihkan ke arena bermain.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl border-2 border-[#E8EDF5] p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#26334D] transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="inline-flex items-center gap-2 rounded-full bg-[#4DABF7]/10 border border-[#4DABF7]/25 px-3.5 py-1 text-xs font-bold text-[#1971C2] mb-3">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Pemulihan Akun Petualang</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#26334D]">
          Masuk dengan Kode
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">
          Masukkan Kode Petualangan rahasiamu untuk melanjutkan dari HP atau komputer mana saja.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-[#FF8787]/15 border-2 border-[#FF8787]/30 text-[#C92A2A] text-xs sm:text-sm font-bold flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FA5252]" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="input-recovery-code" className="block text-sm font-bold text-[#26334D] mb-1.5">
            Kode Petualangan:
          </label>
          <input
            id="input-recovery-code"
            name="recoveryCode"
            type="text"
            autoComplete="off"
            spellCheck="false"
            disabled={isPending}
            value={code}
            onChange={handleCodeChange}
            placeholder="CIPI-XXXX-XX"
            className="w-full font-mono text-center tracking-widest text-lg font-bold rounded-2xl border-2 border-[#E8EDF5] px-4 py-3.5 text-[#26334D] placeholder:text-slate-400 focus:border-[#12B886] focus:ring-4 focus:ring-[#12B886]/15 focus:outline-none transition-all uppercase disabled:bg-slate-50 min-h-13"
          />
          <p className="mt-1.5 text-[11px] text-[#64748B] text-center">
            Format: <strong>CIPI-XXXX-XX</strong> (contoh: <code>CIPI-7K4P-92</code>)
          </p>
        </div>

        <div className="pt-2">
          <button
            id="btn-submit-recovery"
            type="submit"
            disabled={isPending}
            className="w-full min-h-13 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#12B886] px-6 py-3.5 text-base font-bold text-white shadow-[0_5px_0_#087F5B] hover:bg-[#0fa678] transition-all active:translate-y-1 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memeriksa Kode...</span>
              </>
            ) : (
              <>
                <span>Pulihkan Petualangan</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-[#E8EDF5] text-center">
        <p className="text-xs sm:text-sm text-[#64748B]">
          Belum punya Kode Petualangan?
        </p>
        <Link
          id="link-create-profile"
          href="/profile/create"
          className="mt-1.5 inline-block text-sm font-bold text-[#12B886] hover:text-[#087F5B] transition-colors underline underline-offset-4"
        >
          Buat Profil Petualang Baru
        </Link>
      </div>
    </div>
  );
}
