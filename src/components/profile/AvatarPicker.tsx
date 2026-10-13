"use client";

import React from "react";
import { AVATAR_OPTIONS, BotiAvatarIcon } from "./avatars";
import { Check } from "lucide-react";

interface AvatarPickerProps {
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
  disabled?: boolean;
}

export function AvatarPicker({
  selectedAvatarId,
  onSelectAvatar,
  disabled = false,
}: AvatarPickerProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-slate-800 mb-2">
        Pilih Karakter Boti-mu:
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {AVATAR_OPTIONS.map((avatar) => {
          const isSelected = selectedAvatarId === avatar.id;
          return (
            <button
              type="button"
              key={avatar.id}
              disabled={disabled}
              onClick={() => onSelectAvatar(avatar.id)}
              className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-200 text-center ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50/70 shadow-md shadow-emerald-100 scale-102"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-98"}`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                  <Check className="h-3 w-3 stroke-3" />
                </span>
              )}

              <BotiAvatarIcon avatarId={avatar.id} className="w-16 h-16 mb-2" />

              <span className="text-xs font-bold text-slate-900 leading-tight">
                {avatar.name}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                {avatar.tagline}
              </span>
            </button>
          );
        })}
      </div>
      <input type="hidden" name="avatarId" value={selectedAvatarId} />
    </div>
  );
}
