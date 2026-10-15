"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { AvatarPicker } from "./AvatarPicker";
import { RecoveryCodeCard } from "./RecoveryCodeCard";
import { createPlayerProfileAction, type CreateProfileActionResult } from "@/app/actions/profileActions";
import { Loader2, KeyRound, ArrowRight } from "lucide-react";

export function CreateProfileForm() {
  const [nickname, setNickname] = useState("");
  const [avatarId, setAvatarId] = useState("boti_explorer");
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
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl border-2 border-[#E8EDF5] p-6 sm:p-8 shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[#26334D]">
          Buat Profil Petualanganmu!
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">
          Cukup pilih nama panggilan dan karakter Cipi favoritmu. Tanpa email, tanpa kata sandi!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error notification */}
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-[#FF8787]/15 border-2 border-[#FF8787]/30 text-[#C92A2A] text-xs sm:text-sm font-bold text-center"
          >
            {error}
          </div>
        )}

        {/* Nickname Input */}
        <div>
          <label htmlFor="input-nickname" className="block text-sm font-bold text-[#26334D] mb-1.5">
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
              className="w-full min-h-12.5 rounded-2xl border-2 border-[#E8EDF5] px-4 py-3 text-base font-semibold text-[#26334D] placeholder:text-slate-400 focus:border-[#12B886] focus:ring-4 focus:ring-[#12B886]/15 focus:outline-none transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
            <span className="absolute right-3.5 top-3.5 text-xs font-semibold text-[#64748B]">
              {nickname.length}/20
            </span>
          </div>
          <p className="mt-1 text-xs text-[#64748B]">
            Gunakan nama panggilan (2–20 huruf). Jangan gunakan data pribadi ya.
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
            className="w-full min-h-13 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#12B886] px-6 py-3.5 text-base font-bold text-white shadow-[0_5px_0_#087F5B] hover:bg-[#0fa678] transition-all active:translate-y-1 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Mempersiapkan Petualangan...</span>
              </>
            ) : (
              <>
                <span>Mulai Petualangan</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Recovery code alternative link */}
      <div className="mt-8 pt-6 border-t border-[#E8EDF5] text-center">
        <p className="text-xs sm:text-sm text-[#64748B]">
          Sudah pernah bermain sebelumnya?
        </p>
        <Link
          id="link-recover-code"
          href="/profile/recover"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-[#12B886] hover:text-[#087F5B] transition-colors underline underline-offset-4"
        >
          <KeyRound className="w-4 h-4 text-[#64748B]" />
          <span>Masuk dengan Kode Petualangan</span>
        </Link>
      </div>
    </div>
  );
}
