"use client";

import React from "react";
import {
  AlertTriangle,
  Info,
  Sparkles,
  Lightbulb,
  Loader2,
  XCircle,
} from "lucide-react";

export type FeedbackVariant =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "learning"
  | "loading";

export interface FeedbackCardProps {
  variant?: FeedbackVariant;
  title?: string;
  message?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<
  FeedbackVariant,
  {
    container: string;
    iconBg: string;
    iconColor: string;
    titleColor: string;
    textColor: string;
    DefaultIcon: React.ComponentType<{ className?: string }>;
  }
> = {
  info: {
    container: "bg-[#4DABF7]/10 border-2 border-[#4DABF7]/30",
    iconBg: "bg-[#4DABF7] text-white",
    iconColor: "text-white",
    titleColor: "text-[#1971C2]",
    textColor: "text-[#1864AB]",
    DefaultIcon: Info,
  },
  success: {
    container: "bg-[#12B886]/10 border-2 border-[#12B886]/30",
    iconBg: "bg-[#12B886] text-white",
    iconColor: "text-white",
    titleColor: "text-[#087F5B]",
    textColor: "text-[#099268]",
    DefaultIcon: Sparkles,
  },
  learning: {
    container: "bg-[#FFD43B]/15 border-2 border-[#FFD43B]/40",
    iconBg: "bg-[#FFD43B] text-[#78350F]",
    iconColor: "text-[#78350F]",
    titleColor: "text-[#78350F]",
    textColor: "text-[#92400E]",
    DefaultIcon: Lightbulb,
  },
  warning: {
    container: "bg-[#FFF4E5] border-2 border-[#F59F00]/40",
    iconBg: "bg-[#F59F00] text-white",
    iconColor: "text-white",
    titleColor: "text-[#B45309]",
    textColor: "text-[#92400E]",
    DefaultIcon: AlertTriangle,
  },
  error: {
    container: "bg-[#FF8787]/12 border-2 border-[#FF8787]/35",
    iconBg: "bg-[#FA5252] text-white",
    iconColor: "text-white",
    titleColor: "text-[#C92A2A]",
    textColor: "text-[#E03131]",
    DefaultIcon: XCircle,
  },
  loading: {
    container: "bg-[#12B886]/10 border-2 border-[#12B886]/25",
    iconBg: "bg-[#12B886] text-white",
    iconColor: "text-white",
    titleColor: "text-[#087F5B]",
    textColor: "text-[#099268]",
    DefaultIcon: Loader2,
  },
};

export function FeedbackCard({
  variant = "info",
  title,
  message,
  action,
  className = "",
}: FeedbackCardProps) {
  const config = variantStyles[variant];
  const IconComponent = config.DefaultIcon;
  const isAlert = variant === "error" || variant === "warning";

  return (
    <div
      role={isAlert ? "alert" : "status"}
      className={`flex items-start gap-3.5 p-4 rounded-2xl shadow-xs transition-all ${config.container} ${className}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-xs ${config.iconBg}`}
      >
        <IconComponent
          className={`h-5 w-5 ${variant === "loading" ? "animate-spin" : ""}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`text-sm font-extrabold leading-snug ${config.titleColor}`}>
            {title}
          </h4>
        )}
        {message && (
          <div className={`text-xs sm:text-sm font-medium mt-0.5 leading-relaxed ${config.textColor}`}>
            {message}
          </div>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default FeedbackCard;
