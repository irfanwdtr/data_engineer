'use client';

import React from 'react';
import { BarChart2 } from 'lucide-react';
import { KeywordFrequency } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

interface TopKeywordsBarChartProps {
  keywords: KeywordFrequency[];
}

export function TopKeywordsBarChart({ keywords }: TopKeywordsBarChartProps) {
  const maxCount = Math.max(...keywords.map((k) => k.count), 500);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-4 h-4 text-slate-700" />
        <h3 className="font-semibold text-slate-800 text-sm">Top Keywords</h3>
      </div>

      {/* Horizontal Bar List */}
      <div className="space-y-2.5">
        {keywords.slice(0, 10).map((item) => {
          const widthPct = (item.count / maxCount) * 100;

          return (
            <div key={item.keyword} className="flex items-center text-xs gap-3">
              {/* Keyword Name */}
              <div className="w-24 shrink-0 text-slate-700 font-medium truncate capitalize">
                {item.keyword}
              </div>

              {/* Progress Bar Container */}
              <div className="flex-1 bg-slate-50 h-3 rounded-full overflow-hidden flex items-center">
                <div
                  style={{ width: `${widthPct}%` }}
                  className="h-full bg-blue-500 rounded-full transition-all duration-700 hover:bg-blue-600"
                />
              </div>

              {/* Number Count */}
              <div className="w-8 shrink-0 text-right text-slate-600 font-semibold">
                {formatNumber(item.count)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

