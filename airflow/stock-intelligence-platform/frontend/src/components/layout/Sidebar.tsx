"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Compass,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { PipelineStatus } from "@/types";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Stock Explorer",
    href: "/stocks",
    icon: Compass,
  },
  {
    name: "Prediction",
    href: "/prediction",
    icon: TrendingUp,
  },
  {
    name: "Pipeline Monitoring",
    href: "/pipeline",
    icon: Activity,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null);

  useEffect(() => {
    api
      .getPipelineStatus()
      .then((data) => setPipelineStatus(data))
      .catch(() => setPipelineStatus(null));
  }, []);

  return (
    <aside className="w-64 bg-[#0A0D17] border-r border-[#171E30] flex flex-col justify-between shrink-0 h-screen sticky top-0 p-5 select-none">
      <div>
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-[15px] tracking-tight text-white block leading-tight">
              Stock Intelligence
            </span>
            <span className="text-[12px] text-purple-400 font-medium block">
              Platform
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-[#5B46E8] text-white shadow-md shadow-indigo-600/30 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-[#121829]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-slate-400"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <Link
        href="/pipeline"
        className="p-3.5 rounded-xl bg-[#0E1424] border border-[#1C253D] hover:border-indigo-500/40 transition-colors block"
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              pipelineStatus?.is_healthy
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"
                : "bg-amber-500"
            }`}
          />
          <span className="text-xs font-semibold text-white">
            {pipelineStatus?.is_healthy ? "Pipeline Healthy" : "Pipeline Status"}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-mono pl-4">
          {pipelineStatus?.last_run_time
            ? `Last run: ${pipelineStatus.last_run_time}`
            : "Airflow Active"}
        </p>
      </Link>
    </aside>
  );
}

