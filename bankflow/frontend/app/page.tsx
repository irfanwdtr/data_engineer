"use client";

import { useEffect, useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import MetricCard from "@/components/layout/MetricCard";
import {
  fetchOverview,
  formatNumber,
  formatCompactIDR,
  formatPercent,
  formatIDR,
} from "@/lib/api";
import { OverviewResponse } from "@/lib/types";
import {
  CreditCard,
  Users,
  Wallet,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  TrendingUp,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: "#10b981", // emerald
  FAILED: "#f43f5e",  // rose
  PENDING: "#f59e0b", // amber
};

const CHANNEL_COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899"];
const TYPE_COLORS = ["#0284c7", "#0ea5e9", "#38bdf8", "#6366f1", "#a855f7"];

export default function OverviewPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [quickFilter, setQuickFilter] = useState<string>("ALL");

  const loadData = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchOverview(start, end);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickFilter = (type: string) => {
    setQuickFilter(type);
    if (type === "ALL") {
      setStartDate("");
      setEndDate("");
      loadData();
    } else if (type === "Q1") {
      setStartDate("2025-01-01");
      setEndDate("2025-03-31");
      loadData("2025-01-01", "2025-03-31");
    } else if (type === "Q2") {
      setStartDate("2025-04-01");
      setEndDate("2025-06-30");
      loadData("2025-04-01", "2025-06-30");
    } else if (type === "Q3") {
      setStartDate("2025-07-01");
      setEndDate("2025-09-30");
      loadData("2025-07-01", "2025-09-30");
    } else if (type === "Q4") {
      setStartDate("2025-10-01");
      setEndDate("2025-12-31");
      loadData("2025-10-01", "2025-12-31");
    }
  };

  // Sample daily trends for chart performance (every 3rd or 4th day if large)
  const sampledDailyTrends = useMemo(() => {
    if (!data?.daily_trends) return [];
    if (data.daily_trends.length <= 60) return data.daily_trends;
    return data.daily_trends.filter((_, idx) => idx % 2 === 0);
  }, [data?.daily_trends]);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <Header
        title="Banking Data Intelligence Overview"
        subtitle="Real-time analytics and monitoring across Bronze, Silver, and Gold Data Warehouse layers"
        onRefresh={() => loadData(startDate, endDate)}
        isRefreshing={loading}
      />

      <main className="p-8 space-y-8 max-w-[1600px] w-full mx-auto">
        {/* Architecture Pill Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 via-navy-900 to-navy-900 border border-blue-500/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                Medallion Architecture Pipeline
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Operational
                </span>
              </div>
              <p className="text-xs text-slate-400">
                SeaweedFS S3 (Bronze & Silver) → Apache Airflow Orchestration → PostgreSQL Gold Data Warehouse
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <Link
              href="/pipeline"
              className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 transition flex items-center gap-1.5"
            >
              Monitor Pipeline <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/data-explorer"
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-cyan-400 border border-blue-500/30 transition flex items-center gap-1.5"
            >
              Explore Gold Tables <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-navy-900/60 p-3.5 rounded-xl border border-navy-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium text-slate-300">Period Filter:</span>
            {["ALL", "Q1", "Q2", "Q3", "Q4"].map((filter) => (
              <button
                key={filter}
                onClick={() => handleQuickFilter(filter)}
                className={`px-3 py-1 rounded-md transition font-medium ${
                  quickFilter === filter
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-navy-800 text-slate-400 hover:text-slate-200 hover:bg-navy-700"
                }`}
              >
                {filter === "ALL" ? "Full Year 2025" : `2025 ${filter}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setQuickFilter("CUSTOM");
              }}
              className="bg-navy-800 border border-navy-700 rounded-md px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setQuickFilter("CUSTOM");
              }}
              className="bg-navy-800 border border-navy-700 rounded-md px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
            />
            <button
              onClick={() => loadData(startDate, endDate)}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-md transition text-xs"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center justify-between">
            <div>
              <strong>Error loading overview metrics:</strong> {error}
            </div>
            <button
              onClick={() => loadData(startDate, endDate)}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded border border-rose-500/40 text-xs text-rose-300"
            >
              Retry
            </button>
          </div>
        )}

        {/* 8 KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Transactions"
            value={formatNumber(data?.kpis.total_transactions)}
            subtitle="Synthetic dataset total"
            icon={CreditCard}
            variant="default"
            badge="100K Rows"
          />
          <MetricCard
            title="Total Customers"
            value={formatNumber(data?.kpis.total_customers)}
            subtitle="Registered active clients"
            icon={Users}
            variant="cyan"
            badge="Customer Gold"
          />
          <MetricCard
            title="Total Accounts"
            value={formatNumber(data?.kpis.total_accounts)}
            subtitle="Savings, current & payroll"
            icon={Wallet}
            variant="indigo"
            badge="Account Gold"
          />
          <MetricCard
            title="Total Branches"
            value={formatNumber(data?.kpis.total_branches)}
            subtitle="Nationwide branch network"
            icon={Building2}
            variant="default"
            badge="20 Units"
          />
          <MetricCard
            title="Successful Volume"
            value={formatNumber(data?.kpis.successful_transactions)}
            subtitle={`Success rate: ${formatPercent(data?.kpis.success_rate)}`}
            icon={CheckCircle2}
            variant="success"
            badge="91.93%"
          />
          <MetricCard
            title="Failed Volume"
            value={formatNumber(data?.kpis.failed_transactions)}
            subtitle={`Fail rate: ${formatPercent(data?.kpis.fail_rate)}`}
            icon={XCircle}
            variant="danger"
            badge="6.06%"
          />
          <MetricCard
            title="Pending Volume"
            value={formatNumber(data?.kpis.pending_transactions)}
            subtitle={`Pending rate: ${formatPercent(data?.kpis.pending_rate)}`}
            icon={Clock}
            variant="warning"
            badge="2.01%"
          />
          <MetricCard
            title="Successful Turnover"
            value={formatCompactIDR(data?.kpis.successful_amount)}
            subtitle={`Total: ${formatCompactIDR(data?.kpis.total_amount)}`}
            icon={Banknote}
            variant="success"
            badge="IDR Net"
          />
        </div>

        {/* Charts Section 1: Daily Trend & Status Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Transaction Trend */}
          <div className="lg:col-span-2 bg-navy-900/90 rounded-xl p-6 border border-navy-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Daily Transaction Volume Trend (2025)
                </h3>
                <p className="text-xs text-slate-400">
                  Aggregated daily transaction volume and successful executions from gold_daily_summary
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-navy-800 px-2 py-0.5 rounded border border-navy-700">
                {data?.daily_trends.length || 0} Days
              </span>
            </div>

            <div className="h-[280px] w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  Loading trend data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={sampledDailyTrends}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
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
                      labelStyle={{ color: "#94a3b8", fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Area
                      type="monotone"
                      dataKey="total_transactions"
                      name="Total Volume"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                    />
                    <Area
                      type="monotone"
                      dataKey="successful_transactions"
                      name="Successful"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSuccess)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Transaction Status Distribution */}
          <div className="bg-navy-900/90 rounded-xl p-6 border border-navy-800 shadow-sm flex flex-col justify-between">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                Transaction Status Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Breakdown of 100K transactions by status
              </p>
            </div>

            <div className="h-[220px] w-full flex items-center justify-center">
              {loading ? (
                <div className="text-slate-500 text-xs">Loading status data...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.status_distribution || []}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {(data?.status_distribution || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[entry.status] || "#64748b"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${formatNumber(Number(val))} (${item.payload.percentage}%)`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Status Legend Stats */}
            <div className="space-y-2 pt-2 border-t border-navy-800 text-xs">
              {(data?.status_distribution || []).map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[item.status] }}
                    />
                    <span className="font-medium">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-white">
                      {formatNumber(item.count)}
                    </span>
                    <span className="font-mono text-slate-400 w-12 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section 2: Type Analysis, Channel Performance & Branch Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction Type Analysis */}
          <div className="bg-navy-900/90 rounded-xl p-6 border border-navy-800 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Transaction Type Analysis
              </h3>
              <p className="text-xs text-slate-400">
                Volume and success rate by banking transaction type
              </p>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.type_analysis || []}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="transaction_type"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${formatNumber(Number(val))} txs (${item.payload.success_rate}% success)`,
                      "Volume",
                    ]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="total_transactions" fill="#0ea5e9" radius={[0, 4, 4, 0]}>
                    {(data?.type_analysis || []).map((_, idx) => (
                      <Cell key={idx} fill={TYPE_COLORS[idx % TYPE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-navy-800 text-[11px] text-slate-400">
              <div>Top: <span className="text-cyan-400 font-medium">TRANSFER</span></div>
              <div className="text-right">Avg Turnover: <span className="text-white font-mono">Rp 10.2M</span></div>
            </div>
          </div>

          {/* Channel Performance */}
          <div className="bg-navy-900/90 rounded-xl p-6 border border-navy-800 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Channel Performance
              </h3>
              <p className="text-xs text-slate-400">
                Volume & financial turnover across delivery channels
              </p>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.channel_performance || []}
                  margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="channel"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    interval={0}
                    tickFormatter={(val) => val.replace("_BANKING", "").replace("_", " ")}
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`${formatNumber(Number(val))} txs`, "Volume"]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="total_transactions" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {(data?.channel_performance || []).map((_, idx) => (
                      <Cell key={idx} fill={CHANNEL_COLORS[idx % CHANNEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-navy-800 text-xs">
              {(data?.channel_performance || []).slice(0, 2).map((ch) => (
                <div key={ch.channel} className="flex justify-between text-slate-300">
                  <span className="text-slate-400">{ch.channel}:</span>
                  <span className="font-mono text-cyan-400 font-medium">
                    {formatCompactIDR(ch.successful_amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Branch Performance */}
          <div className="bg-navy-900/90 rounded-xl p-6 border border-navy-800 shadow-sm flex flex-col justify-between">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Top Branch Performance
              </h3>
              <p className="text-xs text-slate-400">
                Top branches ranked by processed transaction volume
              </p>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[260px] pr-1">
              {(data?.top_branches || []).slice(0, 5).map((branch, idx) => (
                <div
                  key={branch.branch_id}
                  className="p-2.5 rounded-lg bg-navy-850/80 border border-navy-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/10 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-white">{branch.branch_name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pl-7">
                      {branch.city} • {branch.branch_type}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white">
                      {formatNumber(branch.total_transactions)}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono">
                      {branch.success_rate}% succ.
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-navy-800 text-center">
              <Link
                href="/analytics"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center justify-center gap-1"
              >
                View all 20 branches in Analytics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

