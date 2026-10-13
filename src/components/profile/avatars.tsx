import React from "react";

export interface AvatarOption {
  id: string;
  name: string;
  tagline: string;
  badgeColor: string;
  bgGradient: string;
}

export const AVATAR_OPTIONS: readonly AvatarOption[] = [
  {
    id: "boti_default",
    name: "Boti Klasik",
    tagline: "Sahabat Ceria & Ramah",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    bgGradient: "from-emerald-400 to-teal-500",
  },
  {
    id: "boti_explorer",
    name: "Boti Petualang",
    tagline: "Penjelajah Pulau Seru",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
    bgGradient: "from-sky-400 to-blue-500",
  },
  {
    id: "boti_coder",
    name: "Boti Pemikir",
    tagline: "Jago Analisis Logika",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    bgGradient: "from-purple-400 to-indigo-500",
  },
  {
    id: "boti_star",
    name: "Boti Bintang",
    tagline: "Pemberani & Juara",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    bgGradient: "from-amber-400 to-orange-500",
  },
  {
    id: "boti_leaf",
    name: "Boti Rimba",
    tagline: "Pelindung Hutan Pola",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
    bgGradient: "from-teal-400 to-emerald-600",
  },
];

export function BotiAvatarIcon({
  avatarId,
  className = "w-16 h-16",
}: {
  avatarId?: string;
  className?: string;
}) {
  const normalizedId = avatarId || "boti_default";

  // Visual cues based on avatarId
  const getTheme = () => {
    switch (normalizedId) {
      case "boti_explorer":
        return {
          headColor: "#38bdf8",
          faceColor: "#0284c7",
          antennaColor: "#f59e0b",
          eyeColor: "#ffffff",
          earColor: "#0369a1",
          accessory: "explorer",
        };
      case "boti_coder":
        return {
          headColor: "#a855f7",
          faceColor: "#7e22ce",
          antennaColor: "#38bdf8",
          eyeColor: "#ffffff",
          earColor: "#6b21a8",
          accessory: "coder",
        };
      case "boti_star":
        return {
          headColor: "#f59e0b",
          faceColor: "#d97706",
          antennaColor: "#ef4444",
          eyeColor: "#ffffff",
          earColor: "#b45309",
          accessory: "star",
        };
      case "boti_leaf":
        return {
          headColor: "#10b981",
          faceColor: "#059669",
          antennaColor: "#84cc16",
          eyeColor: "#ffffff",
          earColor: "#047857",
          accessory: "leaf",
        };
      case "boti_default":
      default:
        return {
          headColor: "#10b981",
          faceColor: "#047857",
          antennaColor: "#facc15",
          eyeColor: "#ffffff",
          earColor: "#065f46",
          accessory: "default",
        };
    }
  };

  const theme = getTheme();

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Avatar ${normalizedId}`}
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="46" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="3" />

      {/* Antenna Pole & Ball */}
      <line x1="50" y1="28" x2="50" y2="15" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="13" r="6" fill={theme.antennaColor} />

      {/* Robot Ears */}
      <rect x="18" y="44" width="8" height="16" rx="4" fill={theme.earColor} />
      <rect x="74" y="44" width="8" height="16" rx="4" fill={theme.earColor} />

      {/* Robot Head Body */}
      <rect x="24" y="28" width="52" height="46" rx="14" fill={theme.headColor} />

      {/* Face Screen */}
      <rect x="30" y="34" width="40" height="32" rx="8" fill={theme.faceColor} />

      {/* Expressive Eyes */}
      <ellipse cx="40" cy="48" rx="4" ry="6" fill={theme.eyeColor} />
      <ellipse cx="60" cy="48" rx="4" ry="6" fill={theme.eyeColor} />
      {/* Eye Pupils */}
      <circle cx="41" cy="46" r="2" fill="#0f172a" />
      <circle cx="61" cy="46" r="2" fill="#0f172a" />

      {/* Cheerful Mouth / Smile */}
      <path
        d="M44 56 Q50 62 56 56"
        stroke={theme.eyeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Cheeks */}
      <circle cx="34" cy="54" r="2.5" fill="#f43f5e" opacity="0.6" />
      <circle cx="66" cy="54" r="2.5" fill="#f43f5e" opacity="0.6" />

      {/* Accessory Badges */}
      {theme.accessory === "explorer" && (
        <path d="M50 78 L53 84 L47 84 Z" fill="#f59e0b" />
      )}
      {theme.accessory === "star" && (
        <path
          d="M50 75 L52 80 L57 80 L53 83 L55 88 L50 85 L45 88 L47 83 L43 80 L48 80 Z"
          fill="#facc15"
          stroke="#b45309"
          strokeWidth="0.8"
        />
      )}
      {theme.accessory === "leaf" && (
        <path
          d="M47 85 C45 80 50 76 53 77 C55 81 52 85 47 85 Z"
          fill="#84cc16"
        />
      )}
      {theme.accessory === "coder" && (
        <line x1="33" y1="48" x2="67" y2="48" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
      )}
    </svg>
  );
}
