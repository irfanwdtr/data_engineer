"use client";

import { useState } from "react";
import Link from "next/link";
import { StockOverview, TopMoversGroup } from "@/types";
import { formatNumber, formatPercent } from "@/lib/utils";

interface TopMoversTableProps {
  gainers: StockOverview[];
  losers: StockOverview[];
  topMoversByPeriod?: Record<string, TopMoversGroup>;
  initialPeriod?: "1D" | "5D" | "1M";
  onPeriodChange?: (period: "1D" | "5D" | "1M") => void;
}

export function TopMoversTable({
  gainers,
  losers,
  topMoversByPeriod,
  initialPeriod = "5D",
  onPeriodChange,
}: TopMoversTableProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"1D" | "5D" | "1M">(initialPeriod);
  const [activeTab, setActiveTab] = useState<"gainers" | "losers">("gainers");

  const handlePeriodChange = (period: "1D" | "5D" | "1M") => {
    setSelectedPeriod(period);
    if (onPeriodChange) {
      onPeriodChange(period);
    }
  };

  // Determine which list to display
  let currentGainers = gainers;
  let currentLosers = losers;

  if (topMoversByPeriod && topMoversByPeriod[selectedPeriod]) {
    currentGainers = topMoversByPeriod[selectedPeriod].gainers;
    currentLosers = topMoversByPeriod[selectedPeriod].losers;
  }

  const list = activeTab === "gainers" ? currentGainers : currentLosers;

  return (
    <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-6 h-full flex flex-col justify-between">
      <div>
        {/* Header Row: Title & Subtitle on left, Period Segmented Control on right */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Top Movers
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {selectedPeriod === "1D" && "1 Hari Perdagangan Terakhir"}
              {selectedPeriod === "5D" && "5 Sesi Perdagangan Terakhir"}
              {selectedPeriod === "1M" && "1 Bulan Perdagangan Terakhir"}
            </p>
          </div>

          {/* Period Segmented Control (1D, 5D, 1M) */}
          <div className="flex bg-[#0A0D17] p-1 rounded-xl border border-[#182036] shrink-0">
            {(["1D", "5D", "1M"] as const).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedPeriod === p
                    ? "bg-[#5B46E8] text-white shadow-sm shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Switch: Gainers / Losers as a full-width clean 2-tab bar */}
        <div className="grid grid-cols-2 bg-[#0A0D17] p-1 rounded-xl border border-[#182036] mb-4">
          <button
            onClick={() => setActiveTab("gainers")}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
              activeTab === "gainers"
                ? "bg-[#5B46E8] text-white shadow-sm shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Gainers
          </button>
          <button
            onClick={() => setActiveTab("losers")}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
              activeTab === "losers"
                ? "bg-[#5B46E8] text-white shadow-sm shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Losers
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-[#1A2238]">
                <th className="py-2.5 font-medium text-left">Ticker</th>
                <th className="py-2.5 font-medium text-center">Perubahan ({selectedPeriod})</th>
                <th className="py-2.5 font-medium text-right">Harga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171E33]">
              {list && list.length > 0 ? (
                list.map((stock) => {
                  const isPositive = stock.change_percent >= 0;
                  return (
                    <tr
                      key={stock.ticker}
                      className="hover:bg-[#141B2E] transition-colors group cursor-pointer"
                    >
                      <td className="py-3 font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        <Link href={`/stocks/${stock.ticker}`} className="block">
                          {stock.ticker}
                        </Link>
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md font-semibold text-[11px] border ${
                            isPositive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {formatPercent(stock.change_percent)}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium text-slate-200">
                        {formatNumber(stock.price)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-500">
                    Data tidak tersedia untuk periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-3 border-t border-[#182036] text-right mt-4">
        <Link
          href="/stocks"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Lihat semua saham &rarr;
        </Link>
      </div>
    </div>
  );
}

