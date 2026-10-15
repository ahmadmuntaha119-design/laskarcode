import React from "react";

export interface AvatarOption {
  id: string;
  name: string;
  tagline: string;
  badgeColor: string;
  accentColor: string;
}

export const AVATAR_OPTIONS: readonly AvatarOption[] = [
  {
    id: "boti_explorer",
    name: "Boti Penjelajah",
    tagline: "Pemberani & siap menjelajah",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    accentColor: "#F0BE75",
  },
  {
    id: "boti_guardian",
    name: "Boti Pelindung",
    tagline: "Tangguh menjaga teman & alam",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    accentColor: "#9DCEBC",
  },
  {
    id: "boti_thinker",
    name: "Boti Pemikir",
    tagline: "Cerdas memecahkan teka-teki",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
    accentColor: "#A78BFA",
  },
  {
    id: "boti_star",
    name: "Boti Bintang",
    tagline: "Penuh semangat meraih bintang",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    accentColor: "#F59E0B",
  },
];

export interface AvatarTheme {
  headColor: string;
  faceColor: string;
  antennaColor: string;
  earColor: string;
  accentColor: string;
  eyeGlowColor: string;
  role: "explorer" | "guardian" | "thinker" | "star";
}

export function getAvatarTheme(avatarId?: string): AvatarTheme {
  const id = avatarId || "boti_explorer";

  if (id === "boti_guardian" || id === "boti_leaf") {
    return {
      headColor: "#3B7A57",
      faceColor: "#204632",
      antennaColor: "#9DCEBC",
      earColor: "#2D5E43",
      accentColor: "#D9EFE5",
      eyeGlowColor: "#A7F3D0",
      role: "guardian",
    };
  }

  if (id === "boti_thinker" || id === "boti_coder") {
    return {
      headColor: "#7C3AED",
      faceColor: "#4C1D95",
      antennaColor: "#38BDF8",
      earColor: "#5B21B6",
      accentColor: "#C4B5FD",
      eyeGlowColor: "#67E8F9",
      role: "thinker",
    };
  }

  if (id === "boti_star") {
    return {
      headColor: "#F59E0B",
      faceColor: "#92400E",
      antennaColor: "#FCD34D",
      earColor: "#B45309",
      accentColor: "#FDE68A",
      eyeGlowColor: "#FEF08A",
      role: "star",
    };
  }

  // Default: boti_explorer / boti_default / any other
  return {
    headColor: "#0284C7",
    faceColor: "#075985",
    antennaColor: "#F0BE75",
    earColor: "#0369A1",
    accentColor: "#FDE047",
    eyeGlowColor: "#38BDF8",
    role: "explorer",
  };
}

export function BotiAvatarIcon({
  avatarId,
  className = "w-16 h-16",
}: {
  avatarId?: string;
  className?: string;
}) {
  const theme = getAvatarTheme(avatarId);
  const normalizedId = avatarId || "boti_explorer";

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Avatar ${normalizedId}`}
    >
      {/* Background soft circle */}
      <circle cx="50" cy="50" r="47" fill="#F7F4E9" stroke="#E5DFD1" strokeWidth="2.5" />

      {/* Antenna Pole */}
      <line x1="50" y1="28" x2="50" y2="15" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />

      {/* Role-specific Antenna Tip */}
      {theme.role === "explorer" && (
        <g>
          <circle cx="50" cy="13" r="6" fill="#F0BE75" stroke="#D97706" strokeWidth="1.5" />
          <polygon points="50,9 52,13 50,17 48,13" fill="#FFFFFF" />
        </g>
      )}
      {theme.role === "guardian" && (
        <path
          d="M50 7 C44 11 46 17 50 17 C54 17 56 11 50 7 Z"
          fill="#9DCEBC"
          stroke="#3B7A57"
          strokeWidth="1.5"
        />
      )}
      {theme.role === "thinker" && (
        <g>
          <circle cx="50" cy="12" r="5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <circle cx="50" cy="12" r="2" fill="#FFFFFF" />
        </g>
      )}
      {theme.role === "star" && (
        <path
          d="M50 6 L52 11 L57 11 L53 14 L55 19 L50 16 L45 19 L47 14 L43 11 L48 11 Z"
          fill="#FCD34D"
          stroke="#D97706"
          strokeWidth="1"
        />
      )}

      {/* Robot Side Ears / Audio Pods */}
      <rect x="18" y="44" width="8" height="15" rx="4" fill={theme.earColor} />
      <rect x="74" y="44" width="8" height="15" rx="4" fill={theme.earColor} />

      {/* Robot Main Head Body */}
      <rect x="24" y="27" width="52" height="46" rx="14" fill={theme.headColor} />

      {/* Role-Specific Hat / Forehead Accent */}
      {theme.role === "explorer" && (
        <g>
          {/* Aviator Goggles strap & lenses on forehead */}
          <rect x="25" y="28" width="50" height="7" rx="3.5" fill="#78350F" opacity="0.8" />
          <circle cx="41" cy="31.5" r="5" fill="#F0BE75" stroke="#78350F" strokeWidth="1.5" />
          <circle cx="59" cy="31.5" r="5" fill="#F0BE75" stroke="#78350F" strokeWidth="1.5" />
          <circle cx="41" cy="31.5" r="2" fill="#FEF3C7" />
          <circle cx="59" cy="31.5" r="2" fill="#FEF3C7" />
        </g>
      )}

      {/* Dark Visor Face Screen */}
      <rect x="30" y="36" width="40" height="30" rx="8" fill={theme.faceColor} />

      {/* Thinker Glasses / Spectacles */}
      {theme.role === "thinker" && (
        <g stroke="#67E8F9" strokeWidth="1.8" fill="none">
          <rect x="34" y="42" width="13" height="11" rx="3" />
          <rect x="53" y="42" width="13" height="11" rx="3" />
          <line x1="47" y1="47" x2="53" y2="47" />
        </g>
      )}

      {/* Expressive Eyes */}
      <ellipse cx="40" cy="48" rx="4" ry="5.5" fill={theme.eyeGlowColor} />
      <ellipse cx="60" cy="48" rx="4" ry="5.5" fill={theme.eyeGlowColor} />

      {/* Eye Pupils / Depth */}
      <circle cx="41" cy="47" r="2" fill="#0F172A" />
      <circle cx="61" cy="47" r="2" fill="#0F172A" />

      {/* Eye Sparkle Highlights */}
      <circle cx="42" cy="45.5" r="1.2" fill="#FFFFFF" />
      <circle cx="62" cy="45.5" r="1.2" fill="#FFFFFF" />

      {/* Cheerful Friendly Smile */}
      <path
        d="M44 56.5 Q50 61.5 56 56.5"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Rosy Blush Cheeks */}
      <circle cx="34" cy="54" r="2.5" fill="#F87171" opacity="0.6" />
      <circle cx="66" cy="54" r="2.5" fill="#F87171" opacity="0.6" />

      {/* Guardian Shield Emblem on chest */}
      {theme.role === "guardian" && (
        <path
          d="M50 76 L55 79 L55 83 Q50 86 50 86 Q45 86 45 83 L45 79 Z"
          fill="#9DCEBC"
          stroke="#26443B"
          strokeWidth="1"
        />
      )}

      {/* Star Champion Emblem on chest */}
      {theme.role === "star" && (
        <path
          d="M50 77 L51.5 80 L55 80 L52 82 L53 85 L50 83 L47 85 L48 82 L45 80 L48.5 80 Z"
          fill="#FCD34D"
          stroke="#B45309"
          strokeWidth="0.8"
        />
      )}
    </svg>
  );
}
