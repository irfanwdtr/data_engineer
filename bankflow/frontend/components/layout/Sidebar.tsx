"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  ShieldCheck,
  Database,
  BarChart3,
  Server,
  Layers,
  ExternalLink,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
    badge: "Live",
  },
  {
    name: "Pipeline Monitor",
    href: "/pipeline",
    icon: GitBranch,
  },
  {
    name: "Data Quality",
    href: "/data-quality",
    icon: ShieldCheck,
  },
  {
    name: "Data Explorer",
    href: "/data-explorer",
    icon: Database,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-navy-950 border-r border-navy-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-navy-800/80 gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold tracking-wider">
          BF
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-base tracking-tight">BANKFLOW</span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              DW
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Banking Data Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
          Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? "bg-blue-600/15 text-cyan-400 border border-blue-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-navy-850"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-300"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
          Infrastructure
        </div>
        <div className="px-3.5 py-3 rounded-lg bg-navy-900 border border-navy-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Server className="w-3.5 h-3.5 text-blue-400" /> PostgreSQL 16
            </span>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> SeaweedFS Lake
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">8333</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <GitBranch className="w-3.5 h-3.5 text-amber-400" /> Airflow 2.10
            </span>
            <a
              href="http://localhost:8080"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-0.5"
            >
              8080 <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-navy-800 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <span>Medallion Architecture</span>
          <span className="font-mono text-slate-400">v1.0.0</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-600">Bronze → Silver → Gold DW</div>
      </div>
    </aside>
  );
}

