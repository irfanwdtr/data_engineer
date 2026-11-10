import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  subtext: string;
  icon: LucideIcon;
  iconColor: string; // e.g. 'text-blue-600'
  iconBg: string; // e.g. 'bg-blue-50'
}

export function MetricCard({
  title,
  value,
  trend,
  trendType = 'positive',
  subtext,
  icon: Icon,
  iconColor,
  iconBg,
}: MetricCardProps) {
  const isUp = trend.startsWith('+') || trend.startsWith('↑');
  const isNeutral = trendType === 'neutral';

  const trendColorClass =
    trendType === 'positive'
      ? 'text-emerald-600'
      : trendType === 'negative'
      ? 'text-rose-600'
      : 'text-slate-500';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Top Header: Icon & Title */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        <span className="text-xs font-medium text-slate-500 leading-tight">{title}</span>
      </div>

      {/* Middle: Value & Trend */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        <span className={cn('text-xs font-semibold flex items-center', trendColorClass)}>
          {trend.startsWith('↑') || trend.startsWith('↓') ? (
            trend
          ) : (
            <>
              {isUp ? '↑' : '↓'} {trend}
            </>
          )}
        </span>
      </div>

      {/* Bottom: Subtext */}
      <div className="text-[11px] text-slate-400 font-normal">
        {subtext}
      </div>
    </div>
  );
}

