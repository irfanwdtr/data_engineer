"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Database,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";
import { PipelineStatus, PipelineRun } from "@/types";

export default function PipelineMonitoringPage() {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    Promise.all([api.getPipelineStatus(), api.getPipelineRuns(10)])
      .then(([statusData, runsData]) => {
        setStatus(statusData);
        setRuns(runsData);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat status pipeline.");
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
            Pipeline Monitoring
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pantau status dan kinerja pipeline data (Apache Airflow)
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 self-start sm:self-auto bg-[#101524] border border-[#1C253D] hover:border-indigo-500/40 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-indigo-400 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          <span>Refresh Status</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-16 flex flex-col items-center justify-center text-slate-400 text-sm">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
          <span>Memuat data monitoring Apache Airflow...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-5 rounded-2xl text-sm">
          {error}
        </div>
      ) : (
        <>
          {/* Healthy / Degraded Banner */}
          <div
            className={`rounded-2xl p-6 border shadow-xl flex items-center gap-4 ${
              status?.is_healthy
                ? "bg-emerald-950/20 border-emerald-500/30"
                : "bg-amber-950/20 border-amber-500/30"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                status?.is_healthy
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}
            >
              {status?.is_healthy ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {status?.is_healthy ? "Pipeline Healthy" : "Pipeline Degraded"}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {status?.message || "Semua proses data engineering berjalan normal"}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-5">
              <span className="text-xs text-slate-400 block mb-1">Last Run</span>
              <span className="text-lg font-bold text-white tracking-tight">
                {status?.last_run_time || "N/A"}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                DAG: market_ingestion
              </span>
            </div>

            <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-5">
              <span className="text-xs text-slate-400 block mb-1">Execution Duration</span>
              <span className="text-lg font-bold text-white tracking-tight font-mono">
                {status?.duration ? `${status.duration} s` : "N/A"}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Total pipeline runtime
              </span>
            </div>

            <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-5">
              <span className="text-xs text-slate-400 block mb-1">DAG Status</span>
              <span
                className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold mt-1 ${
                  status?.status === "Success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {status?.status || "Unknown"}
              </span>
              <span className="text-[11px] text-slate-500 mt-1.5 block">
                Apache Airflow 2.10.5
              </span>
            </div>
          </div>

          {/* Pipeline Tasks Breakdown */}
          <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">
              Pipeline Tasks (market_ingestion)
            </h3>

            <div className="space-y-3">
              {status?.tasks && status.tasks.length > 0 ? (
                status.tasks.map((task) => {
                  const isTaskSuccess = task.state === "success";
                  return (
                    <div
                      key={task.task_id}
                      className="bg-[#0C111E] border border-[#182138] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isTaskSuccess
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-mono text-xs font-bold text-white block">
                            {task.task_id}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Mulai: {task.start_date || "-"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        <span className="text-xs font-mono text-slate-300">
                          {task.duration ? `${task.duration} s` : "-"}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                            isTaskSuccess
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {task.state.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-400 text-xs py-4 text-center">
                  Tidak ada task instance untuk DAG run ini.
                </div>
              )}
            </div>
          </div>

          {/* Pipeline Run History */}
          <div className="bg-[#101524] border border-[#1B233A] rounded-2xl overflow-hidden p-6">
            <h3 className="text-base font-semibold text-white mb-4">
              Riwayat Eksekusi Pipeline Terakhir
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1A2238] text-slate-400 font-medium">
                    <th className="py-2.5 px-3">Run ID</th>
                    <th className="py-2.5 px-3">Waktu Eksekusi</th>
                    <th className="py-2.5 px-3 text-right">Durasi</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161D30]">
                  {runs.map((run) => (
                    <tr key={run.run_id} className="hover:bg-[#13192B]">
                      <td className="py-3 px-3 font-mono text-slate-300 truncate max-w-xs">
                        {run.run_id}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {run.start_date || run.execution_date || "-"}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        {run.duration ? `${run.duration} s` : "-"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            run.state === "success"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          {run.state.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

