import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger" | "cyan" | "indigo";
  badge?: string;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  badge,
  className = "",
}: MetricCardProps) {
  const variantStyles = {
    default: {
      border: "border-navy-800",
      iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      accent: "from-blue-500/20 to-transparent",
    },
    success: {
      border: "border-emerald-500/30",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      accent: "from-emerald-500/20 to-transparent",
    },
    warning: {
      border: "border-amber-500/30",
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      accent: "from-amber-500/20 to-transparent",
    },
    danger: {
      border: "border-rose-500/30",
      iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      accent: "from-rose-500/20 to-transparent",
    },
    cyan: {
      border: "border-cyan-500/30",
      iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      accent: "from-cyan-500/20 to-transparent",
    },
    indigo: {
      border: "border-indigo-500/30",
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      accent: "from-indigo-500/20 to-transparent",
    },
  }[variant];

  return (
    <div
      className={`relative bg-navy-900/90 rounded-xl p-5 border ${variantStyles.border} shadow-sm overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Subtle top accent gradient */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${variantStyles.accent}`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {value}
          </div>
        </div>

        {Icon && (
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${variantStyles.iconBg}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || badge) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {badge && (
            <span className="font-semibold text-[11px] px-2 py-0.5 rounded-full bg-navy-800 border border-navy-700 text-slate-300">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

