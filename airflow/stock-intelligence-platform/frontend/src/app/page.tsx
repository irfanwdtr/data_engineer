"use client";

import { useEffect, useState } from "react";
import { Calendar, RefreshCw, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { DashboardSummary } from "@/types";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { MarketMovementChart } from "@/components/dashboard/MarketMovementChart";
import { TopMoversTable } from "@/components/dashboard/TopMoversTable";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    api
      .getDashboardSummary()
      .then((data) => {
        setSummary(data);
        setErrorMsg(null);
      })
      .catch((err: any) => {
        setErrorMsg(err.message || "Gagal memuat data dashboard");
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ringkasan pasar dan performa saham Indonesia
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-[#101524] border border-[#1C243C] hover:border-indigo-500/40 px-3 py-1.5 rounded-xl text-xs text-slate-300 font-medium transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-indigo-400 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
          <div className="flex items-center gap-2 bg-[#101524] border border-[#1C243C] px-3.5 py-1.5 rounded-xl text-xs text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{summary?.latest_update ? `Update: ${summary.latest_update}` : "6 Nov 2026"}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-16 flex flex-col items-center justify-center text-slate-400 text-sm">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
          <span>Memuat data dashboard...</span>
        </div>
      ) : errorMsg ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-5 rounded-2xl text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => loadData()}
            className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-200 text-xs font-semibold hover:bg-rose-500/30"
          >
            Coba Lagi
          </button>
        </div>
      ) : summary ? (
        <>
          {/* KPI Cards */}
          <KpiCards
            totalStocks={summary.total_stocks}
            avgReturn5d={summary.avg_return_5d}
            risingStocks={summary.rising_stocks}
            fallingStocks={summary.falling_stocks}
            risingPercent={summary.rising_percent}
            fallingPercent={summary.falling_percent}
          />

          {/* Charts & Movers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MarketMovementChart
                data={summary.market_movement}
                avgReturn5d={summary.avg_return_5d}
              />
            </div>
            <div>
              <TopMoversTable
                gainers={summary.top_gainers}
                losers={summary.top_losers}
                topMoversByPeriod={summary.top_movers_by_period}
                initialPeriod="5D"
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

