"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { AvatarPicker } from "./AvatarPicker";
import { RecoveryCodeCard } from "./RecoveryCodeCard";
import { createPlayerProfileAction, type CreateProfileActionResult } from "@/app/actions/profileActions";
import { Sparkles, Loader2, KeyRound } from "lucide-react";

export function CreateProfileForm() {
  const [nickname, setNickname] = useState("");
  const [avatarId, setAvatarId] = useState("boti_default");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateProfileActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      setError("Nama panggilan minimal 2 karakter ya!");
      return;
    }
    if (trimmed.length > 20) {
      setError("Nama panggilan maksimal 20 karakter.");
      return;
    }

    const formData = new FormData();
    formData.append("nickname", trimmed);
    formData.append("avatarId", avatarId);

    startTransition(async () => {
      try {
        const response = await createPlayerProfileAction(null, formData);
        if (!response.success) {
          setError(response.error || "Gagal membuat profil. Silakan coba lagi.");
        } else {
          setResult(response);
        }
      } catch {
        setError("Terjadi gangguan koneksi. Silakan periksa jaringan dan coba lagi.");
      }
    });
  };

  // Jika profil berhasil dibuat, tampilkan kartu Kode Petualangan satu kali
  if (result?.success && result.profile && result.recoveryCode) {
    return (
      <RecoveryCodeCard
        nickname={result.profile.nickname}
        avatarId={result.profile.avatarId}
        recoveryCode={result.recoveryCode}
      />
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Profil Petualang LaskarCode</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Buat Profil Petualanganmu!
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Cukup pilih nama panggilan dan karakter Boti favoritmu. Tanpa email, tanpa kata sandi!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error notification */}
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium text-center"
          >
            {error}
          </div>
        )}

        {/* Nickname Input */}
        <div>
          <label htmlFor="input-nickname" className="block text-sm font-bold text-slate-800 mb-1.5">
            Nama Panggilanmu:
          </label>
          <div className="relative">
            <input
              id="input-nickname"
              name="nickname"
              type="text"
              autoComplete="off"
              disabled={isPending}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Contoh: Arya, Bima, Citra"
              maxLength={20}
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none transition-colors disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
            <span className="absolute right-3.5 top-3.5 text-xs font-semibold text-slate-400">
              {nickname.length}/20
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Gunakan nama panggilan (2–20 huruf). Jangan gunakan nama lengkap atau data pribadi.
          </p>
        </div>

        {/* Avatar Picker */}
        <AvatarPicker
          selectedAvatarId={avatarId}
          onSelectAvatar={(id) => setAvatarId(id)}
          disabled={isPending}
        />

        {/* Submit button with double submission protection */}
        <div className="pt-2">
          <button
            id="btn-submit-profile"
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-500 hover:shadow-emerald-300 transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Mempersiapkan Petualangan...</span>
              </>
            ) : (
              <span>🚀 Mulai Petualangan Sekarang!</span>
            )}
          </button>
        </div>
      </form>

      {/* Recovery code alternative link */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs sm:text-sm text-slate-600">
          Sudah pernah bermain sebelumnya?
        </p>
        <Link
          id="link-recover-code"
          href="/profile/recover"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-sky-600 hover:text-sky-700 underline underline-offset-4"
        >
          <KeyRound className="w-4 h-4" />
          <span>Masuk dengan Kode Petualangan</span>
        </Link>
      </div>
    </div>
  );
}
