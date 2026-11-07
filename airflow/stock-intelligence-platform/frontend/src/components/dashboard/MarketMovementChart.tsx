"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { MarketIndexPoint } from "@/types";
import { formatPercent } from "@/lib/utils";

interface MarketMovementChartProps {
  data: MarketIndexPoint[];
  avgReturn5d: number;
}

export function MarketMovementChart({ data, avgReturn5d }: MarketMovementChartProps) {
  return (
    <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-6 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-white">
            Pergerakan Indeks (Rata-rata)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tren pergerakan agregat 20 saham terpantau
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            avgReturn5d >= 0
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          {formatPercent(avgReturn5d)} (5D)
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A2238" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#1E2740" }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as MarketIndexPoint;
                  return (
                    <div className="bg-[#161D32] border border-[#232F52] rounded-xl p-3 shadow-xl text-xs">
                      <p className="text-slate-400 mb-1">{pt.date}</p>
                      <p className="font-bold text-white text-sm">
                        Indeks: {pt.index_value.toFixed(2)}
                      </p>
                      <p
                        className={`font-semibold mt-0.5 ${
                          pt.change_percent >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        Harian: {formatPercent(pt.change_percent)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="index_value"
              stroke="#818CF8"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#purpleGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

