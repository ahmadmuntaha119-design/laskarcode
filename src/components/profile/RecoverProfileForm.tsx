"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { recoverPlayerProfileAction } from "@/app/actions/profileActions";
import { KeyRound, Loader2, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";

export function RecoverProfileForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Helper format: Otomatis tambahkan prefix 'BOTI-' atau format sesuai kebiasaan anak
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
    const formatRegex = /^BOTI-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{2}$/i;
    if (!formatRegex.test(trimmed)) {
      setError("Format kode tidak sesuai. Contoh: BOTI-7K4P-92");
      return;
    }

    const formData = new FormData();
    formData.append("recoveryCode", trimmed);

    startTransition(async () => {
      try {
        const response = await recoverPlayerProfileAction(null, formData);
        if (!response.success) {
          setError(response.error || "Kode Petualangan tidak valid.");
        } else {
          setIsSuccess(true);
          router.push("/play");
          router.refresh();
        }
      } catch {
        setError("Gagal menghubungi server. Periksa koneksi internetmu.");
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center">
        <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Kode Diterima!</h2>
        <p className="mt-2 text-sm text-slate-600">
          Memulihkan petualangan dan progresmu... Mengalihkan ke ruang bermain.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3.5 py-1 text-xs font-bold text-sky-800 mb-3">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Pemulihan Akun Petualang</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Masuk dengan Kode
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Masukkan Kode Petualangan rahasiamu untuk melanjutkan dari HP atau komputer mana saja.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="input-recovery-code" className="block text-sm font-bold text-slate-800 mb-1.5">
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
            placeholder="BOTI-XXXX-XX"
            className="w-full font-mono text-center tracking-widest text-lg font-bold rounded-2xl border-2 border-slate-200 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none transition-colors uppercase disabled:bg-slate-50"
          />
          <p className="mt-1.5 text-[11px] text-slate-500 text-center">
            Format: <strong>BOTI-XXXX-XX</strong> (contoh: <code>BOTI-7K4P-92</code>)
          </p>
        </div>

        <div className="pt-2">
          <button
            id="btn-submit-recovery"
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-sky-200 hover:bg-sky-500 hover:shadow-sky-300 transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memeriksa Kode...</span>
              </>
            ) : (
              <span>Pulihkan Petualanganku!</span>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs sm:text-sm text-slate-600">
          Belum punya Kode Petualangan?
        </p>
        <Link
          id="link-create-profile"
          href="/profile/create"
          className="mt-1.5 inline-block text-sm font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4"
        >
          Buat Profil Petualang Baru
        </Link>
      </div>
    </div>
  );
}
