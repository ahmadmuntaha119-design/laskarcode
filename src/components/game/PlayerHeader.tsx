"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { LogOut, Loader2 } from "lucide-react";
import { BotiAvatarIcon } from "@/components/profile/avatars";
import { logoutPlayerProfileAction } from "@/app/actions/profileActions";
import type { ProfileDTO } from "@/services/guestProfileService";

interface PlayerHeaderProps {
  profile: ProfileDTO;
  levelCount: number;
}

export function PlayerHeader({ profile }: PlayerHeaderProps) {
  const [isLoggingOut, startTransition] = useTransition();

  const handleLogout = () => {
    if (confirm("Apakah kamu ingin keluar dari petualangan ini? Pastikan kamu sudah mencatat Kode Petualanganmu ya!")) {
      startTransition(async () => {
        await logoutPlayerProfileAction();
      });
    }
  };

  return (
    <header className="w-full bg-white border-2 border-[#E8EDF5] px-4 py-3 mb-4 rounded-2xl shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Home Link */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform active:scale-95"
          >
            <BotiAvatarIcon avatarId="boti_explorer" className="w-8 h-8" />
            <span className="font-black text-lg text-[#26334D] group-hover:text-[#12B886] transition-colors">
              Laskar<span className="text-[#12B886]">Code</span>
            </span>
          </Link>

        
        </div>

        {/* Profile Card & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-[#FFFDF7] border border-[#E8EDF5] py-1 px-3">
            <BotiAvatarIcon avatarId={profile.avatarId} className="w-6 h-6" />
            <span className="text-xs font-bold text-[#26334D]">
              {profile.nickname}
            </span>
          </div>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            title="Keluar dari sesi ini"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#FF8787]/30 bg-[#FF8787]/15 hover:bg-[#FF8787]/25 px-3.5 py-1.5 text-xs font-bold text-[#FA5252] transition-colors cursor-pointer active:scale-95 disabled:opacity-50 min-h-9.5"
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

