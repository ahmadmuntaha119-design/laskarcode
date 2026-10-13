"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { LogOut, Loader2, Database, ShieldCheck } from "lucide-react";
import { BotiAvatarIcon } from "@/components/profile/avatars";
import { logoutPlayerProfileAction } from "@/app/actions/profileActions";
import type { ProfileDTO } from "@/services/guestProfileService";

interface PlayerHeaderProps {
  profile: ProfileDTO;
  levelCount: number;
}

export function PlayerHeader({ profile, levelCount }: PlayerHeaderProps) {
  const [isLoggingOut, startTransition] = useTransition();

  const handleLogout = () => {
    if (confirm("Apakah kamu yakin ingin keluar dari petualangan ini? Pastikan kamu sudah mencatat Kode Petualanganmu!")) {
      startTransition(async () => {
        await logoutPlayerProfileAction();
      });
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 px-4 py-3 mb-4 rounded-2xl shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Home Link */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform active:scale-95"
          >
            <BotiAvatarIcon avatarId="boti_default" className="w-8 h-8" />
            <span className="font-black text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">
              Laskar<span className="text-emerald-600">Code</span>
            </span>
          </Link>

          {/* Database status pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Database className="w-3 h-3 text-emerald-600" />
            <span>Supabase Sync ({levelCount} Level)</span>
          </div>
        </div>

        {/* Profile Card & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 py-1 px-3">
            <BotiAvatarIcon avatarId={profile.avatarId} className="w-6 h-6" />
            <span className="text-xs font-bold text-slate-900">
              {profile.nickname}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
          </div>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            title="Keluar dari sesi ini"
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
