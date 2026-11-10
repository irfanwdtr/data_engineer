'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Layers } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface SentimentDonutChartProps {
  data: {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }[];
  totalComments: number;
}

export function SentimentDonutChart({ data, totalComments }: SentimentDonutChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4 text-slate-700" />
        <h3 className="font-semibold text-slate-800 text-sm">Sentiment Distribution</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 flex-1">
        {/* Donut Chart with Centered Text */}
        <div className="md:col-span-7 relative h-52 flex items-center justify-center">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${formatNumber(value)} komentar`, 'Jumlah']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-36 h-36 rounded-full border-8 border-slate-100 flex items-center justify-center" />
          )}

          {/* Centered Stats in Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-800 leading-tight">
              {formatNumber(totalComments)}
            </span>
            <span className="text-xs text-slate-400 font-medium">Comments</span>
          </div>
        </div>

        {/* Legend on Right Side */}
        <div className="md:col-span-5 space-y-3.5 pr-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-700">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-800">
                {item.percentage}%{' '}
                <span className="text-slate-400 font-normal">({formatNumber(item.value)})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

