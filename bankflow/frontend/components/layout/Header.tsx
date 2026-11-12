"use client";

import { RefreshCw, ExternalLink, Activity, Database } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function Header({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
}: HeaderProps) {
  return (
    <header className="h-16 bg-navy-950/80 backdrop-blur border-b border-navy-800 px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Connection status pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-900 border border-navy-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-slate-400">DW:</span>
          <span className="font-medium text-slate-200">bankflow_dw</span>
        </div>

        {/* Airflow Link */}
        <a
          href="http://localhost:8080"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-850 border border-navy-800 text-xs font-medium text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <span>Airflow UI</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-cyan-400 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>
    </header>
  );
}

