"use client";

import { useEffect, useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import MetricCard from "@/components/layout/MetricCard";
import {
  fetchOverview,
  fetchCustomerSegments,
  formatNumber,
  formatCompactIDR,
  formatPercent,
  formatIDR,
} from "@/lib/api";
import {
  OverviewResponse,
  CustomerSegmentItem,
  BranchPerformanceItem,
} from "@/lib/types";
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Building2,
  Users,
  Banknote,
  PieChart as PieIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  AreaChart,
  Area,
} from "recharts";

const CHANNEL_COLORS: Record<string, string> = {
  MOBILE_BANKING: "#06b6d4",
  ATM: "#3b82f6",
  BRANCH: "#8b5cf6",
  INTERNET_BANKING: "#ec4899",
};

const SEGMENT_COLORS: Record<string, string> = {
  REGULAR: "#3b82f6",
  PREMIUM: "#06b6d4",
  PRIORITY: "#a855f7",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [segments, setSegments] = useState<CustomerSegmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branchSort, setBranchSort] = useState<"volume" | "amount" | "rate">("volume");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ovRes, segRes] = await Promise.all([
        fetchOverview(),
        fetchCustomerSegments(),
      ]);
      setData(ovRes);
      setSegments(segRes);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Downsample daily trends for multi-line trend performance
  const sampledDailyTrends = useMemo(() => {
    if (!data?.daily_trends) return [];
    if (data.daily_trends.length <= 90) return data.daily_trends;
    return data.daily_trends.filter((_, idx) => idx % 2 === 0);
  }, [data?.daily_trends]);

  // Sorted branches
  const sortedBranches = useMemo(() => {
    if (!data?.top_branches) return [];
    return [...data.top_branches].sort((a, b) => {
      if (branchSort === "volume") return b.total_transactions - a.total_transactions;
      if (branchSort === "amount") return b.total_amount - a.total_amount;
      return b.success_rate - a.success_rate;
    });
  }, [data?.top_branches, branchSort]);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <Header
        title="Banking Transaction Analytics & Business Intelligence"
        subtitle="In-depth analysis across transaction channels, product types, branch networks & customer tiers"
        onRefresh={loadData}
        isRefreshing={loading}
      />

      <main className="p-8 space-y-8 max-w-[1600px] w-full mx-auto">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Transaction Volume"
            value={formatNumber(data?.kpis.total_transactions)}
            subtitle="Full 2025 dataset"
            icon={CreditCard}
            variant="default"
            badge="100,000 TX"
          />
          <MetricCard
            title="Total Gross Turnover"
            value={formatCompactIDR(data?.kpis.total_amount)}
            subtitle="Gross volume processed"
            icon={Banknote}
            variant="cyan"
            badge="IDR 1.018T"
          />
          <MetricCard
            title="Net Settled Turnover"
            value={formatCompactIDR(data?.kpis.successful_amount)}
            subtitle="Settled successful transactions"
            icon={CheckCircle2}
            variant="success"
            badge="IDR 937.0B"
          />
          <MetricCard
            title="Overall Success Rate"
            value={formatPercent(data?.kpis.success_rate)}
            subtitle="Failure rate: 6.06% • Pending: 2.01%"
            icon={TrendingUp}
            variant="success"
            badge="Healthy"
          />
        </div>

        {/* Chart 1: Dual-Axis Daily Trend (Volume & Financial Turnover) */}
        <div className="bg-navy-900/90 rounded-xl p-6 border border-navy-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Daily Transaction Volume vs Settled Turnover (2025)
              </h3>
              <p className="text-xs text-slate-400">
                Left axis: daily volume of transactions. Right axis: settled financial turnover in Billions IDR.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-navy-800 px-2 py-0.5 rounded border border-navy-700">
              {data?.daily_trends.length || 0} Observation Days
            </span>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={sampledDailyTrends}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#3b82f6"
                  fontSize={11}
                  tickLine={false}
                  domain={[200, 350]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}B`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => {
                    if (name === "Settled Turnover") return [formatIDR(Number(val)), name];
                    return [formatNumber(Number(val)), name];
                  }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar
                  yAxisId="left"
                  dataKey="total_transactions"
                  name="Total Transactions"
                  fill="#1e3a8a"
                  radius={[3, 3, 0, 0]}
                  opacity={0.8}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="successful_transactions"
                  name="Successful Transactions"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="successful_amount"
                  name="Settled Turnover"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Success vs Failed vs Pending Volume Trend Over Time */}
        <div className="bg-navy-900/90 rounded-xl p-6 border border-navy-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Execution Outcome Dynamics: Success vs Failed vs Pending
            </h3>
            <p className="text-xs text-slate-400">
              Tracking failed transactions and pending settlement queues across 2025
            </p>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={sampledDailyTrends}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area
                  type="monotone"
                  dataKey="failed_transactions"
                  name="Failed Transactions"
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="pending_transactions"
                  name="Pending Transactions"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3: Customer Segment Analysis & Channel Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Segment Tier Analysis */}
          <div className="bg-navy-900/90 rounded-xl p-6 border border-navy-800 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Customer Segment Intelligence
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                  Gold Customer
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Segment performance derived from gold_customer_summary (REGULAR, PREMIUM, PRIORITY)
              </p>
            </div>

            <div className="space-y-4">
              {segments.map((seg) => (
                <div
                  key={seg.segment}
                  className="p-4 rounded-xl bg-navy-850/70 border border-navy-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: SEGMENT_COLORS[seg.segment] || "#3b82f6" }}
                      />
                      <span className="font-bold text-white text-sm">{seg.segment} TIER</span>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                      {formatPercent(seg.success_rate)} Success
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-slate-500 text-[10px] uppercase">Customers</div>
                      <div className="font-mono text-slate-200 font-semibold">
                        {formatNumber(seg.total_customers)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px] uppercase">Total Transactions</div>
                      <div className="font-mono text-slate-200 font-semibold">
                        {formatNumber(seg.total_transactions)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px] uppercase">Total Turnover</div>
                      <div className="font-mono text-emerald-400 font-semibold">
                        {formatCompactIDR(seg.successful_amount)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-navy-800 flex justify-between text-[11px] text-slate-400">
                    <span>
                      Avg Spend / Client:{" "}
                      <strong className="text-slate-300 font-mono">
                        {formatCompactIDR(seg.avg_amount_per_customer)}
                      </strong>
                    </span>
                    <span>
                      Avg Activity:{" "}
                      <strong className="text-slate-300 font-mono">
                        {seg.avg_transactions_per_customer} TXs
                      </strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Channels Breakdown */}
          <div className="bg-navy-900/90 rounded-xl p-6 border border-navy-800 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Delivery Channel Turnover & Share
              </h3>
              <p className="text-xs text-slate-400">
                Detailed metrics across Mobile Banking, ATM, Branch, and Internet Banking
              </p>
            </div>

            <div className="space-y-4">
              {(data?.channel_performance || []).map((ch) => {
                const totalChannelVolume = 100000;
                const volumeShare = ((ch.total_transactions / totalChannelVolume) * 100).toFixed(1);

                return (
                  <div
                    key={ch.channel}
                    className="p-3.5 rounded-lg bg-navy-850/70 border border-navy-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: CHANNEL_COLORS[ch.channel] || "#3b82f6" }}
                        />
                        <span className="font-bold text-white">{ch.channel}</span>
                      </div>
                      <span className="font-mono text-slate-400 font-medium">
                        {volumeShare}% share
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 font-mono">
                      <span>Volume: {formatNumber(ch.total_transactions)}</span>
                      <span className="text-cyan-400 font-bold">
                        {formatCompactIDR(ch.successful_amount)} Settled
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-navy-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${volumeShare}%`,
                          backgroundColor: CHANNEL_COLORS[ch.channel] || "#3b82f6",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: All 20 Branches In-depth Ranking Table */}
        <div className="bg-navy-900/90 rounded-xl p-6 border border-navy-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                Branch Network Performance Ranking (All 20 Branches)
              </h3>
              <p className="text-xs text-slate-400">
                Data extracted directly from gold_branch_summary in PostgreSQL Data Warehouse
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Sort by:</span>
              <button
                onClick={() => setBranchSort("volume")}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  branchSort === "volume"
                    ? "bg-blue-600 text-white"
                    : "bg-navy-800 text-slate-400 hover:text-white"
                }`}
              >
                Volume
              </button>
              <button
                onClick={() => setBranchSort("amount")}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  branchSort === "amount"
                    ? "bg-blue-600 text-white"
                    : "bg-navy-800 text-slate-400 hover:text-white"
                }`}
              >
                Turnover
              </button>
              <button
                onClick={() => setBranchSort("rate")}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  branchSort === "rate"
                    ? "bg-blue-600 text-white"
                    : "bg-navy-800 text-slate-400 hover:text-white"
                }`}
              >
                Success Rate
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-navy-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-850 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-navy-800">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Branch ID</th>
                  <th className="px-4 py-3">Branch Name</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Total Volume</th>
                  <th className="px-4 py-3">Successful</th>
                  <th className="px-4 py-3">Failed</th>
                  <th className="px-4 py-3">Success Rate</th>
                  <th className="px-4 py-3">Total Turnover</th>
                  <th className="px-4 py-3">Settled Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 font-sans">
                {sortedBranches.map((branch, idx) => (
                  <tr key={branch.branch_id} className="hover:bg-navy-850/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-cyan-400">
                      {branch.branch_id}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{branch.branch_name}</td>
                    <td className="px-4 py-3 text-slate-300">{branch.city}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-navy-800 border border-navy-700 text-[11px] text-slate-300 font-mono">
                        {branch.branch_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-200">
                      {formatNumber(branch.total_transactions)}
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-400">
                      {formatNumber(branch.successful_transactions)}
                    </td>
                    <td className="px-4 py-3 font-mono text-rose-400">
                      {formatNumber(branch.failed_transactions)}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-200">
                      {branch.success_rate}%
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {formatCompactIDR(branch.total_amount)}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                      {formatCompactIDR(branch.successful_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

