"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import MetricCard from "@/components/layout/MetricCard";
import { fetchPipelineStatus, formatDate } from "@/lib/api";
import { PipelineStatusResponse } from "@/lib/types";
import {
  GitBranch,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Layers,
  ArrowRight,
  Database,
  ShieldCheck,
  Server,
  RefreshCw,
} from "lucide-react";

export default function PipelinePage() {
  const [data, setData] = useState<PipelineStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPipeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPipelineStatus();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load pipeline status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipeline();
  }, []);

  const getStatusBadge = (state: string) => {
    const s = state.toUpperCase();
    if (s === "SUCCESS") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
        </span>
      );
    }
    if (s === "FAILED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" /> FAILED
        </span>
      );
    }
    if (s === "RUNNING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5 animate-spin" /> RUNNING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
        <Clock className="w-3.5 h-3.5" /> {s || "QUEUED"}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <Header
        title="Airflow Pipeline Monitoring"
        subtitle="End-to-End Orchestration of BankFlow Medallion Data Engineering Pipeline"
        onRefresh={loadPipeline}
        isRefreshing={loading}
      />

      <main className="p-8 space-y-8 max-w-[1600px] w-full mx-auto">
        {/* Airflow Connection & Hero Banner */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-blue-950/80 via-navy-900 to-navy-900 border border-blue-500/20 flex flex-wrap items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 font-bold">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-mono">bankflow_pipeline</h2>
                  {data && getStatusBadge(data.status)}
                </div>
                <p className="text-xs text-slate-400">{data?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span>Schedule: <strong className="text-slate-300">Manual / On-Demand</strong></span>
              <span>•</span>
              <span>Airflow Version: <strong className="text-slate-300">2.10.5 LocalExecutor</strong></span>
              <span>•</span>
              <span>Source: <strong className="text-cyan-400 font-mono">{data?.source}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://localhost:8080"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition"
            >
              <span>Open Airflow Web UI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Pipeline KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Pipeline Status"
            value={data?.status || "UNKNOWN"}
            subtitle="Current DAG execution status"
            icon={PlayCircle}
            variant={data?.status === "SUCCESS" ? "success" : data?.status === "FAILED" ? "danger" : "warning"}
            badge={data?.is_paused ? "Paused" : "Active"}
          />
          <MetricCard
            title="Last Run Date"
            value={data?.last_execution_date ? formatDate(data.last_execution_date).split(",")[0] : "-"}
            subtitle={data?.last_execution_date ? formatDate(data.last_execution_date).split(",")[1] : "No executions"}
            icon={Clock}
            variant="default"
            badge="Execution Date"
          />
          <MetricCard
            title="Last Run Duration"
            value={data?.last_duration_seconds !== null && data?.last_duration_seconds !== undefined ? `${data.last_duration_seconds}s` : "-"}
            subtitle="Total pipeline elapsed time"
            icon={Clock}
            variant="cyan"
            badge="End-to-End"
          />
          <MetricCard
            title="Total Tasks"
            value="5 / 5"
            subtitle="All sequential DAG tasks"
            icon={Layers}
            variant="indigo"
            badge="Medallion"
          />
        </div>

        {/* Visual Medallion Flow & Individual Task Status */}
        <div className="bg-navy-900/90 rounded-xl p-6 border border-navy-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Pipeline Execution Sequence & Task Statuses
              </h3>
              <p className="text-xs text-slate-400">
                Five-stage sequential processing flow from raw synthetic data to PostgreSQL Data Warehouse
              </p>
            </div>
            <button
              onClick={loadPipeline}
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {/* Sequential Task Cards Flow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {(data?.tasks || []).map((task, idx) => {
              const isSuccess = task.state === "SUCCESS";
              const isFailed = task.state === "FAILED";
              const isRunning = task.state === "RUNNING";

              return (
                <div
                  key={task.task_id}
                  className={`p-4 rounded-xl border flex flex-col justify-between relative transition-all ${
                    isSuccess
                      ? "bg-navy-850 border-emerald-500/30"
                      : isFailed
                      ? "bg-rose-950/20 border-rose-500/30"
                      : isRunning
                      ? "bg-amber-950/20 border-amber-500/30"
                      : "bg-navy-850/60 border-navy-800"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-navy-800 border border-navy-700 text-cyan-400 font-bold flex items-center justify-center text-xs">
                        {task.order}
                      </span>
                      {getStatusBadge(task.state)}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white font-mono break-words">
                        {task.task_id}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{task.task_name}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-navy-800/80 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Duration:</span>
                      <span className="font-mono text-slate-200 font-medium">
                        {task.duration !== null && task.duration !== undefined ? `${task.duration}s` : "-"}
                      </span>
                    </div>
                    {task.end_date && (
                      <div className="text-[10px] text-slate-500 truncate" title={task.end_date}>
                        {formatDate(task.end_date)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Medallion Architecture Reference Diagram */}
          <div className="p-4 rounded-lg bg-navy-950 border border-navy-800 text-xs">
            <div className="text-slate-400 font-medium mb-3 uppercase tracking-wider text-[10px]">
              Medallion Architectural Flow
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-slate-300">
              <div className="p-2.5 rounded-md bg-navy-900 border border-navy-800 flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-semibold text-white">Bronze Layer</div>
                  <div className="text-[10px] text-slate-400">SeaweedFS S3 raw CSVs</div>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />

              <div className="p-2.5 rounded-md bg-navy-900 border border-navy-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-semibold text-white">Silver Layer</div>
                  <div className="text-[10px] text-slate-400">Cleaned & standard types</div>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />

              <div className="p-2.5 rounded-md bg-navy-900 border border-navy-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-white">Data Quality</div>
                  <div className="text-[10px] text-slate-400">28 Validation rules</div>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />

              <div className="p-2.5 rounded-md bg-navy-900 border border-navy-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-yellow-400" />
                <div>
                  <div className="font-semibold text-white">Gold Aggregations</div>
                  <div className="text-[10px] text-slate-400">6 Business metrics</div>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />

              <div className="p-2.5 rounded-md bg-navy-900 border border-blue-500/30 flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-semibold text-white">PostgreSQL DW</div>
                  <div className="text-[10px] text-cyan-400 font-mono">bankflow_dw:5432</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Execution History Table */}
        <div className="bg-navy-900/90 rounded-xl p-6 border border-navy-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Pipeline Execution History
            </h3>
            <p className="text-xs text-slate-400">
              Audit log of past DAG runs recorded in Airflow metadata database
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-navy-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-850 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-navy-800">
                <tr>
                  <th className="px-4 py-3">Run ID</th>
                  <th className="px-4 py-3">Run Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Execution Time</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Airflow State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 font-mono">
                {(data?.recent_runs || []).map((run) => (
                  <tr key={run.run_id} className="hover:bg-navy-850/50 transition">
                    <td className="px-4 py-3 font-semibold text-white truncate max-w-xs" title={run.run_id}>
                      {run.run_id}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-sans">{run.run_type}</td>
                    <td className="px-4 py-3">{getStatusBadge(run.state)}</td>
                    <td className="px-4 py-3 text-slate-400 font-sans">
                      {formatDate(run.execution_date)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {run.duration !== null && run.duration !== undefined ? `${run.duration}s` : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{run.state}</td>
                  </tr>
                ))}
                {(!data?.recent_runs || data.recent_runs.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500 font-sans">
                      No DAG run history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

