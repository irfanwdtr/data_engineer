"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  Loader2,
  Activity,
  Layers,
  BarChart2,
  Table,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { api } from "@/lib/api";
import { StockDetail, StockHistoryPoint, TechnicalIndicators } from "@/types";
import { formatNumber, formatPercent, formatVolume } from "@/lib/utils";

const TIMEFRAMES = ["1D", "5D", "1M", "3M", "6M", "1Y", "ALL"];
const TABS = ["Grafik", "Indikator", "Data Historis", "Fitur"];

export default function StockDetailPage() {
  const params = useParams();
  const rawTicker = params?.ticker as string;
  const ticker = decodeURIComponent(rawTicker || "").toUpperCase();

  const [detail, setDetail] = useState<StockDetail | null>(null);
  const [history, setHistory] = useState<StockHistoryPoint[]>([]);
  const [features, setFeatures] = useState<TechnicalIndicators | null>(null);
  const [timeframe, setTimeframe] = useState("1M");
  const [activeTab, setActiveTab] = useState("Grafik");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load basic details & features
  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    Promise.all([
      api.getStockDetail(ticker),
      api.getStockFeatures(ticker),
    ])
      .then(([stockData, featData]) => {
        setDetail(stockData);
        setFeatures(featData);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat detail saham.");
      })
      .finally(() => setLoading(false));
  }, [ticker]);

  // Load history when timeframe changes
  useEffect(() => {
    if (!ticker) return;
    setChartLoading(true);
    api
      .getStockHistory(ticker, timeframe)
      .then((data) => setHistory(data))
      .catch(() => setHistory([]))
      .finally(() => setChartLoading(false));
  }, [ticker, timeframe]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm">Memuat analisis saham {ticker}...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <Link
          href="/stocks"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Stock Explorer
        </Link>
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-6 rounded-2xl">
          {error || `Data saham ${ticker} tidak ditemukan.`}
        </div>
      </div>
    );
  }

  const isPositive = detail.change >= 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/stocks"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Stock Explorer
        </Link>
      </div>

      {/* Main Stock Header Card */}
      <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#1A2238]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {detail.ticker}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {detail.sector}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{detail.name}</p>
          </div>

          <button
            onClick={() => setIsWatchlisted(!isWatchlisted)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isWatchlisted
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-[#161D30] border-[#222E4E] text-slate-300 hover:text-white"
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                isWatchlisted ? "fill-amber-400 text-amber-400" : ""
              }`}
            />
            <span>{isWatchlisted ? "Di Watchlist" : "Tambah ke Watchlist"}</span>
          </button>
        </div>

        {/* Price & Quote Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 items-center">
          <div className="col-span-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {formatNumber(detail.price)}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {formatPercent(detail.change_percent)} ({detail.change > 0 ? `+${detail.change}` : detail.change})
              </span>
              <span className="text-[11px] text-slate-400">
                Penutupan: {detail.trade_date}
              </span>
            </div>
          </div>

          <div className="bg-[#0D1220] p-3 rounded-xl border border-[#182138]">
            <span className="text-[11px] text-slate-400 block">Open</span>
            <span className="text-sm font-semibold text-slate-200">
              {formatNumber(detail.open)}
            </span>
          </div>

          <div className="bg-[#0D1220] p-3 rounded-xl border border-[#182138]">
            <span className="text-[11px] text-slate-400 block">High</span>
            <span className="text-sm font-semibold text-emerald-400">
              {formatNumber(detail.high)}
            </span>
          </div>

          <div className="bg-[#0D1220] p-3 rounded-xl border border-[#182138]">
            <span className="text-[11px] text-slate-400 block">Low</span>
            <span className="text-sm font-semibold text-rose-400">
              {formatNumber(detail.low)}
            </span>
          </div>

          <div className="bg-[#0D1220] p-3 rounded-xl border border-[#182138]">
            <span className="text-[11px] text-slate-400 block">Volume</span>
            <span className="text-sm font-semibold text-slate-200 font-mono">
              {formatVolume(detail.volume)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-[#101524] p-1.5 rounded-xl border border-[#1B233A] w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab
                ? "bg-[#5B46E8] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content depending on Tab */}
      {activeTab === "Grafik" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 bg-[#101524] border border-[#1B233A] rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-semibold text-white">
                Grafik Harga & Volume ({timeframe})
              </h3>

              {/* Timeframe pills */}
              <div className="flex bg-[#0C101C] p-1 rounded-xl border border-[#182036]">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      timeframe === tf
                        ? "bg-[#5B46E8] text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="w-full h-80">
              {chartLoading ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memuat grafik...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={history}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#818CF8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1A2238"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: "#1E2740" }}
                    />
                    <YAxis
                      yAxisId="price"
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={["auto", "auto"]}
                    />
                    <YAxis
                      yAxisId="volume"
                      orientation="right"
                      domain={[0, "auto"]}
                      hide
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const pt = payload[0].payload as StockHistoryPoint;
                          return (
                            <div className="bg-[#161D32] border border-[#232F52] rounded-xl p-3 shadow-xl text-xs space-y-1">
                              <p className="text-slate-400">{pt.date}</p>
                              <p className="font-bold text-white text-sm">
                                Close: {formatNumber(pt.close)}
                              </p>
                              <div className="text-slate-300 text-[11px] grid grid-cols-2 gap-2 pt-1 border-t border-[#222E4E]">
                                <span>O: {formatNumber(pt.open)}</span>
                                <span>H: {formatNumber(pt.high)}</span>
                                <span>L: {formatNumber(pt.low)}</span>
                                <span>Vol: {formatVolume(pt.volume)}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      yAxisId="volume"
                      dataKey="volume"
                      fill="#2C3B5E"
                      opacity={0.4}
                      barSize={12}
                    />
                    <Area
                      yAxisId="price"
                      type="monotone"
                      dataKey="close"
                      stroke="#818CF8"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#stockAreaGrad)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Right Indicator and Summary Panel */}
          <div className="space-y-6">
            {/* Technical Indicators Box */}
            <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">
                Indikator Teknikal
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-[#161D30]">
                  <span className="text-slate-400">RSI (14)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {features?.rsi_14 ?? "N/A"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        features?.rsi_status === "Overbought"
                          ? "bg-rose-500/10 text-rose-400"
                          : features?.rsi_status === "Oversold"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {features?.rsi_status ?? "Neutral"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#161D30]">
                  <span className="text-slate-400">SMA (5)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {formatNumber(features?.sma_5)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        features?.price_vs_sma_5 === "Above"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {features?.price_vs_sma_5 ?? "Neutral"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#161D30]">
                  <span className="text-slate-400">SMA (20)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {formatNumber(features?.sma_20)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        features?.price_vs_sma_20 === "Above"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {features?.price_vs_sma_20 ?? "Neutral"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#161D30]">
                  <span className="text-slate-400">Volatilitas (20D)</span>
                  <span className="font-semibold text-white font-mono">
                    {features?.volatility_20 ? `${features.volatility_20}%` : "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Volume Ratio (20)</span>
                  <span className="font-semibold text-white font-mono">
                    {features?.volume_ratio_20 ?? "N/A"}x
                  </span>
                </div>
              </div>
            </div>

            {/* Company Summary Box */}
            <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">
                Ringkasan Fundamental
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#161D30]">
                  <span className="text-slate-400">Sektor</span>
                  <span className="font-semibold text-white">{detail.sector}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#161D30]">
                  <span className="text-slate-400">Market Cap</span>
                  <span className="font-semibold text-white">{detail.market_cap}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#161D30]">
                  <span className="text-slate-400">P/E Ratio</span>
                  <span className="font-semibold text-white">
                    {detail.pe_ratio ? `${detail.pe_ratio}x` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">PBV</span>
                  <span className="font-semibold text-white">
                    {detail.pbv ? `${detail.pbv}x` : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Data Table Tab */}
      {activeTab === "Data Historis" && (
        <div className="bg-[#101524] border border-[#1B233A] rounded-2xl overflow-hidden p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            Riwayat Transaksi Harian ({history.length} Hari)
          </h3>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D1220] text-slate-400 sticky top-0">
                <tr className="border-b border-[#1B233A]">
                  <th className="py-2.5 px-4">Tanggal</th>
                  <th className="py-2.5 px-4 text-right">Open</th>
                  <th className="py-2.5 px-4 text-right">High</th>
                  <th className="py-2.5 px-4 text-right">Low</th>
                  <th className="py-2.5 px-4 text-right">Close</th>
                  <th className="py-2.5 px-4 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161D30]">
                {[...history].reverse().map((row) => (
                  <tr key={row.date} className="hover:bg-[#151C2F]">
                    <td className="py-2.5 px-4 font-medium text-slate-300">
                      {row.date}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-200">
                      {formatNumber(row.open)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-400">
                      {formatNumber(row.high)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-400">
                      {formatNumber(row.low)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-white">
                      {formatNumber(row.close)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400 font-mono">
                      {formatNumber(row.volume)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Technical Indicators & Features Tab */}
      {(activeTab === "Indikator" || activeTab === "Fitur") && (
        <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            Fitur & Indikator Teknikal Terkalkulasi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[#0C111E] p-4 rounded-xl border border-[#182138]">
              <span className="text-xs text-slate-400 block mb-1">RSI (14 Hari)</span>
              <span className="text-xl font-bold text-white">{features?.rsi_14 ?? "N/A"}</span>
              <span className="text-[11px] text-slate-500 block mt-1">Status: {features?.rsi_status}</span>
            </div>
            <div className="bg-[#0C111E] p-4 rounded-xl border border-[#182138]">
              <span className="text-xs text-slate-400 block mb-1">SMA 5 Hari</span>
              <span className="text-xl font-bold text-white">{formatNumber(features?.sma_5)}</span>
              <span className="text-[11px] text-slate-500 block mt-1">Posisi: {features?.price_vs_sma_5}</span>
            </div>
            <div className="bg-[#0C111E] p-4 rounded-xl border border-[#182138]">
              <span className="text-xs text-slate-400 block mb-1">SMA 20 Hari</span>
              <span className="text-xl font-bold text-white">{formatNumber(features?.sma_20)}</span>
              <span className="text-[11px] text-slate-500 block mt-1">Posisi: {features?.price_vs_sma_20}</span>
            </div>
            <div className="bg-[#0C111E] p-4 rounded-xl border border-[#182138]">
              <span className="text-xs text-slate-400 block mb-1">Volatilitas (20D)</span>
              <span className="text-xl font-bold text-white font-mono">{features?.volatility_20 ? `${features.volatility_20}%` : "N/A"}</span>
              <span className="text-[11px] text-slate-500 block mt-1">Standar deviasi return</span>
            </div>
            <div className="bg-[#0C111E] p-4 rounded-xl border border-[#182138]">
              <span className="text-xs text-slate-400 block mb-1">Volume Ratio (20D)</span>
              <span className="text-xl font-bold text-white font-mono">{features?.volume_ratio_20 ?? "N/A"}x</span>
              <span className="text-[11px] text-slate-500 block mt-1">Rasio volume harian vs rata-rata</span>
            </div>
            <div className="bg-[#0C111E] p-4 rounded-xl border border-[#182138]">
              <span className="text-xs text-slate-400 block mb-1">Momentum (5D & 10D)</span>
              <span className="text-xl font-bold text-white font-mono">
                {features?.momentum_5 ? `${features.momentum_5}%` : "0%"} / {features?.momentum_10 ? `${features.momentum_10}%` : "0%"}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Perubahan harga relatif</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

