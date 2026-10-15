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
  // Normalize comparison (e.g. boti_default maps to boti_explorer)
  const activeId =
    selectedAvatarId === "boti_default" ? "boti_explorer" : selectedAvatarId;

  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-[#26334D] mb-2.5">
        Pilih Sahabat Robot Boti:
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {AVATAR_OPTIONS.map((avatar) => {
          const isSelected = activeId === avatar.id;
          return (
            <button
              type="button"
              key={avatar.id}
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => onSelectAvatar(avatar.id)}
              className={`relative flex flex-col items-center p-3.5 rounded-2xl border-2 transition-all duration-200 text-center min-h-35 justify-between ${
                isSelected
                  ? "border-[#12B886] bg-[#12B886]/10 shadow-sm shadow-[#12B886]/20 scale-[1.03] ring-3 ring-[#12B886]/25"
                  : "border-[#E8EDF5] bg-white hover:border-[#12B886]/40 hover:bg-[#FFFDF7]"
              } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-98"}`}
            >
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#12B886] text-white shadow-xs">
                  <Check className="h-3 w-3 stroke-3" />
                </span>
              )}

              <BotiAvatarIcon avatarId={avatar.id} className="w-16 h-16 my-1" />

              <div>
                <span className="text-xs font-bold text-[#26334D] block leading-snug">
                  {avatar.name}
                </span>
                <span className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                  {avatar.tagline}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <input type="hidden" name="avatarId" value={selectedAvatarId} />
    </div>
  );
}

