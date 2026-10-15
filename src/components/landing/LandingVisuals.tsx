import React from "react";
import { CipiAvatarIcon } from "@/components/profile/avatars";
import { Star, ArrowRight, CornerDownRight } from "lucide-react";

/**
 * HeroCipiStage — The whimsical, lively casual game stage for Cipi in the Hero section.
 * Shows Cipi as the energetic companion surrounded by tactile coding blocks and stars.
 */
export function HeroCipiStage() {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center select-none">
      {/* Decorative ambient background glows */}
      <div className="absolute inset-4 rounded-full bg-linear-to-tr from-emerald-200/50 via-sky-200/40 to-amber-200/50 blur-2xl -z-10 animate-pulse duration-1000" />
      
      {/* The floating candy platform / island */}
      <div className="relative w-72 h-72 sm:w-84 sm:h-84 rounded-full bg-white/90 p-4 shadow-2xl shadow-emerald-900/10 border-4 border-white flex items-center justify-center backdrop-blur-xs">
        {/* Inner concentric ring */}
        <div className="w-full h-full rounded-full border-2 border-dashed border-emerald-200/80 flex items-center justify-center bg-linear-to-b from-[#F0FDF4]/60 to-[#F7FEE7]/40 relative">
          
          {/* Main Cipi character */}
          <div className="relative z-10 transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer">
            <CipiAvatarIcon avatarId="boti_explorer" className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-md" />
            
            {/* Mascot shadow on platform */}
            <div className="w-28 h-4 mx-auto -mt-2 bg-emerald-950/15 rounded-full blur-[2px]" />
          </div>

          {/* Floating Widget 1: Coding Block "MAJU" (Top-Left) */}
          <div className="absolute -top-3 -left-4 sm:-left-6 bg-white rounded-2xl px-3.5 py-2 border-2 border-emerald-400 shadow-lg shadow-emerald-500/15 flex items-center gap-2 rotate-[-6deg] animate-bounce [animation-duration:3.2s]">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-600">Balok Kode</span>
              <span className="block text-xs font-black text-slate-800">MAJU 1 Langkah</span>
            </div>
          </div>

          {/* Floating Widget 2: Star Reward (Top-Right) */}
          <div className="absolute -top-2 -right-3 sm:-right-5 bg-white rounded-2xl px-3.5 py-2 border-2 border-amber-300 shadow-lg shadow-amber-500/15 flex items-center gap-1.5 rotate-[8deg] animate-bounce [animation-duration:4s]">
            <div className="flex gap-0.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
            <span className="text-xs font-black text-amber-900 ml-0.5">3 Bintang!</span>
          </div>

          {/* Floating Widget 3: Turn Right Coding Block (Bottom-Right) */}
          <div className="absolute -bottom-3 -right-2 sm:-right-4 bg-white rounded-2xl px-3.5 py-2 border-2 border-sky-400 shadow-lg shadow-sky-500/15 flex items-center gap-2 rotate-[-4deg] animate-bounce [animation-duration:3.6s]">
            <div className="w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <CornerDownRight className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-black uppercase tracking-wider text-sky-600">Arah</span>
              <span className="block text-xs font-black text-slate-800">Belok Kanan</span>
            </div>
          </div>

          {/* Floating Widget 4: Destination Badge (Bottom-Left) */}
          <div className="absolute -bottom-2 -left-3 sm:-left-5 bg-white rounded-2xl px-3 py-1.5 border-2 border-rose-300 shadow-lg shadow-rose-500/15 flex items-center gap-1.5 rotate-[5deg] animate-bounce [animation-duration:4.5s]">
            <span className="text-sm">🏝️</span>
            <span className="text-xs font-extrabold text-slate-800">Pulau Cipi</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const HeroBotiStage = HeroCipiStage;

/**
 * Custom illustrations for the 3 Learning Benefits
 */
export function BenefitBlockIllustration() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 border-2 border-emerald-300 flex items-center justify-center text-emerald-700 shadow-inner">
      <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
        {/* Block 1 */}
        <path
          d="M8 14 C8 11 10 9 13 9 L22 9 C23 9 24 10 24 11 C24 12 25 13 26 13 L30 13 C31 13 32 12 32 11 C32 10 33 9 34 9 L35 9 C38 9 40 11 40 14 L40 22 C40 25 38 27 35 27 L34 27 C33 27 32 28 32 29 C32 30 31 31 30 31 L26 31 C25 31 24 30 24 29 C24 28 23 27 22 27 L13 27 C10 27 8 25 8 22 Z"
          fill="#12B886"
        />
        {/* Arrow on block */}
        <path
          d="M20 18 L28 18 M25 14 L29 18 L25 22"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Block 2 (underneath) */}
        <path
          d="M8 29 C8 28 9 27 10 27 L22 27 C23 27 24 28 24 29 C24 30 25 31 26 31 L30 31 C31 31 32 30 32 29 C32 28 33 27 34 27 L38 27 C39 27 40 28 40 29 L40 37 C40 40 38 42 35 42 L13 42 C10 42 8 40 8 37 Z"
          fill="#6EE7B7"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}

export function BenefitWorldIllustration() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-sky-100/80 border-2 border-sky-300 flex items-center justify-center text-sky-700 shadow-inner">
      <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
        {/* Island Base */}
        <path
          d="M6 34 C12 28 20 29 26 31 C32 33 40 31 44 34 C44 37 40 41 24 41 C8 41 6 37 6 34 Z"
          fill="#38BDF8"
        />
        {/* Island Terrain */}
        <path
          d="M10 32 C15 26 22 27 27 29 C33 30 38 28 41 32 C38 35 30 37 25 37 C18 37 12 35 10 32 Z"
          fill="#4ADE80"
        />
        {/* Palm Tree */}
        <path d="M22 31 Q23 22 26 15" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M26 15 Q32 12 34 16 M26 15 Q29 9 32 10 M26 15 Q21 11 18 14 M26 15 Q20 17 21 21"
          stroke="#16A34A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Adventure Compass Star */}
        <polygon points="16,10 18,14 22,16 18,18 16,22 14,18 10,16 14,14" fill="#FBBF24" />
      </svg>
    </div>
  );
}

export function BenefitRetryIllustration() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-rose-100/80 border-2 border-rose-300 flex items-center justify-center text-rose-700 shadow-inner">
      <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none">
        {/* Circular retry arrow */}
        <path
          d="M14 24 C14 18.5 18.5 14 24 14 C28.5 14 32.3 17 33.5 21"
          stroke="#F43F5E"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M34 24 C34 29.5 29.5 34 24 34 C19.5 34 15.7 31 14.5 27"
          stroke="#F43F5E"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Arrow heads */}
        <polygon points="34,16 35,23 28,21" fill="#F43F5E" />
        <polygon points="14,32 13,25 20,27" fill="#F43F5E" />
        {/* Sparkling Center Lightbulb */}
        <circle cx="24" cy="24" r="5" fill="#FBBF24" />
        <line x1="24" y1="16" x2="24" y2="18" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
