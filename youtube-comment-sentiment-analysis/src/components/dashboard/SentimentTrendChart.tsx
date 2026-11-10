'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { SentimentTrendPoint } from '@/lib/types';

interface SentimentTrendChartProps {
  data: SentimentTrendPoint[];
}

export function SentimentTrendChart({ data }: SentimentTrendChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
      {/* Header with Title and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-700" />
          <h3 className="font-semibold text-slate-800 text-sm">Sentiment Trend Over Time</h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Positive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Negative</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Neutral</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-52 w-full">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8590a5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8590a5" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                domain={[0, 250]}
                ticks={[0, 50, 100, 150, 200, 250]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="positive"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPositive)"
                dot={{ r: 2.5, fill: '#10b981' }}
              />
              <Area
                type="monotone"
                dataKey="negative"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNegative)"
                dot={{ r: 2.5, fill: '#ef4444' }}
              />
              <Area
                type="monotone"
                dataKey="neutral"
                stroke="#8590a5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNeutral)"
                dot={{ r: 2.5, fill: '#8590a5' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-300 text-xs">
            Memuat grafik tren...
          </div>
        )}
      </div>
    </div>
  );
}

