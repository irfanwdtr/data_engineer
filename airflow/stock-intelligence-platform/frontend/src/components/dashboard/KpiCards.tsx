import { Layers, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatPercent } from "@/lib/utils";

interface KpiCardsProps {
  totalStocks: number;
  avgReturn5d: number;
  risingStocks: number;
  fallingStocks: number;
  risingPercent: number;
  fallingPercent: number;
}

export function KpiCards({
  totalStocks,
  avgReturn5d,
  risingStocks,
  fallingStocks,
  risingPercent,
  fallingPercent,
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Saham */}
      <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 block mb-1">
            Total Saham
          </span>
          <div className="text-3xl font-bold text-white tracking-tight">
            {totalStocks}
          </div>
          <span className="text-[12px] text-slate-500 mt-1 block">
            Ticker dipantau
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Layers className="w-6 h-6 text-purple-400" />
        </div>
      </div>

      {/* Rata-rata Return (5D) */}
      <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 block mb-1">
            Rata-rata Return (5D)
          </span>
          <div
            className={`text-3xl font-bold tracking-tight ${
              avgReturn5d >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {formatPercent(avgReturn5d)}
          </div>
          <span className="text-[12px] text-slate-500 mt-1 block">
            Performa agregat
          </span>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            avgReturn5d >= 0
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
          }`}
        >
          {avgReturn5d >= 0 ? (
            <TrendingUp className="w-6 h-6" />
          ) : (
            <TrendingDown className="w-6 h-6" />
          )}
        </div>
      </div>

      {/* Saham Naik */}
      <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 block mb-1">
            Saham Naik
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {risingStocks}
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              ({risingPercent}%)
            </span>
          </div>
          <span className="text-[12px] text-slate-500 mt-1 block">
            Tren positif harian
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <ArrowUpRight className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      {/* Saham Turun */}
      <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 block mb-1">
            Saham Turun
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {fallingStocks}
            </span>
            <span className="text-xs font-semibold text-rose-400">
              ({fallingPercent}%)
            </span>
          </div>
          <span className="text-[12px] text-slate-500 mt-1 block">
            Koreksi harian
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <ArrowDownRight className="w-6 h-6 text-rose-400" />
        </div>
      </div>
    </div>
  );
}

