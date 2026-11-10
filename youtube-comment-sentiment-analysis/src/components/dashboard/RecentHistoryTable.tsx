'use client';

import React from 'react';
import Link from 'next/link';
import { History, Play, ArrowRight } from 'lucide-react';
import { SentimentBar } from '@/components/ui/SentimentBar';
import { AnalysisSession } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

interface RecentHistoryTableProps {
  history: AnalysisSession[];
}

export function RecentHistoryTable({ history }: RecentHistoryTableProps) {
  const { runAnalysisForKeyword, currentKeyword } = useApp();

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-700" />
          <h3 className="font-semibold text-slate-800 text-sm">Recent Analysis History</h3>
        </div>

        <Link
          href="/history"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 group"
        >
          Lihat Semua
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 font-medium border-b border-slate-100">
              <th className="pb-3 font-medium">Keyword</th>
              <th className="pb-3 font-medium">Analysis Date</th>
              <th className="pb-3 font-medium text-center">Videos</th>
              <th className="pb-3 font-medium text-center">Comments</th>
              <th className="pb-3 font-medium">Sentiment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {history.slice(0, 5).map((session) => {
              const isActive =
                session.keyword.toLowerCase() === currentKeyword.toLowerCase();

              return (
                <tr
                  key={session.id}
                  onClick={() => runAnalysisForKeyword(session.keyword)}
                  className={`group cursor-pointer transition-colors ${
                    isActive ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Keyword */}
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-slate-200/80 flex items-center justify-center shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <Play className="w-3 h-3 fill-slate-500 text-slate-500 group-hover:fill-blue-600 group-hover:text-blue-600" />
                      </div>
                      <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {session.keyword}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3 text-slate-500 pr-3 whitespace-nowrap">
                    {session.analysisDate}
                  </td>

                  {/* Videos */}
                  <td className="py-3 text-center text-slate-700 font-medium pr-3">
                    {session.videosCollected}
                  </td>

                  {/* Comments */}
                  <td className="py-3 text-center text-slate-700 font-medium pr-3">
                    {formatNumber(session.commentsCollected)}
                  </td>

                  {/* Sentiment Bar + Text */}
                  <td className="py-3 min-w-[150px]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-24">
                        <SentimentBar
                          positive={session.positivePercentage}
                          negative={session.negativePercentage}
                          neutral={session.neutralPercentage}
                        />
                      </div>
                      <span className="text-[11px] text-slate-600 font-mono whitespace-nowrap">
                        {session.positivePercentage}% / {session.negativePercentage}% /{' '}
                        {session.neutralPercentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

