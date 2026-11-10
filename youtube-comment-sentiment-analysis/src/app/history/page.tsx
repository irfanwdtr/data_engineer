'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Search,
  Play,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  BarChart2,
  Trash2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SentimentBar } from '@/components/ui/SentimentBar';
import { Badge } from '@/components/ui/Badge';
import { formatNumber } from '@/lib/utils';
import { AnalysisSession } from '@/lib/types';

export default function AnalysisHistoryPage() {
  const router = useRouter();
  const { historyList, runAnalysisForKeyword, currentKeyword } = useApp();
  const [searchHistory, setSearchHistory] = useState('');
  const [selectedSession, setSelectedSession] = useState<AnalysisSession | null>(null);

  // Filter history
  const filteredHistory = historyList.filter((item) =>
    item.keyword.toLowerCase().includes(searchHistory.toLowerCase())
  );

  const totalRuns = historyList.length;
  const totalCommentsAll = historyList.reduce((acc, curr) => acc + curr.commentsCollected, 0);
  const avgPositive =
    historyList.length > 0
      ? Math.round(
          historyList.reduce((acc, curr) => acc + curr.positivePercentage, 0) / historyList.length
        )
      : 0;

  const handleOpenAnalysis = (session: AnalysisSession) => {
    runAnalysisForKeyword(session.keyword);
    router.push('/');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analysis History</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Riwayat eksekusi pipeline pengumpulan dan analisis sentimen komentar YouTube
          </p>
        </div>
      </div>

      {/* Historical Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Pipeline Runs</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalRuns} Sesi</div>
            <span className="text-[11px] text-emerald-600 font-medium">100% Berhasil</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Komentar Terarsip</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {formatNumber(totalCommentsAll)}
            </div>
            <span className="text-[11px] text-slate-400">Siap dieksploitasi NLP</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Rata-rata Sentimen Positif</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{avgPositive}%</div>
            <span className="text-[11px] text-slate-400">Rata-rata seluruh produk</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchHistory}
            onChange={(e) => setSearchHistory(e.target.value)}
            placeholder="Cari riwayat keyword..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="text-slate-500">
          Menampilkan <span className="font-semibold text-slate-800">{filteredHistory.length}</span>{' '}
          riwayat analisis
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                <th className="py-3.5 px-4 whitespace-nowrap">Keyword Pencarian</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Analysis Date</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Videos Collected</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Comments Collected</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Sentiment Breakdown</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((item) => {
                const isCurrent =
                  item.keyword.toLowerCase() === currentKeyword.toLowerCase();

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isCurrent ? 'bg-blue-50/30' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Keyword */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                          <Play className="w-3.5 h-3.5 fill-slate-500 text-slate-500" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">{item.keyword}</span>
                          {isCurrent && (
                            <span className="text-[10px] text-blue-600 font-medium">
                              (Sedang aktif di dashboard)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {item.analysisDate}
                    </td>

                    {/* Videos */}
                    <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                      {item.videosCollected}
                    </td>

                    {/* Comments */}
                    <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                      {formatNumber(item.commentsCollected)}
                    </td>

                    {/* Sentiment */}
                    <td className="py-3.5 px-4 min-w-[200px]">
                      <div className="space-y-1">
                        <SentimentBar
                          positive={item.positivePercentage}
                          negative={item.negativePercentage}
                          neutral={item.neutralPercentage}
                        />
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span className="text-emerald-600">{item.positivePercentage}% Pos</span>
                          <span className="text-rose-600">{item.negativePercentage}% Neg</span>
                          <span className="text-slate-500">{item.neutralPercentage}% Neu</span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="positive" className="gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{item.status}</span>
                      </Badge>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenAnalysis(item)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-600/20"
                          title="Buka hasil analisis ini di Overview"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Buka Hasil</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

