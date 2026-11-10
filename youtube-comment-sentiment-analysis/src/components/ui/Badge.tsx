import React from 'react';
import { cn } from '@/lib/utils';
import { SentimentCategory } from '@/lib/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'positive' | 'negative' | 'neutral' | 'blue' | 'gray' | 'warning' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'gray', size = 'sm', className }: BadgeProps) {
  const variantStyles = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    negative: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-slate-100 text-slate-600 border-slate-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SentimentBadge({
  sentiment,
  score,
}: {
  sentiment: SentimentCategory;
  score?: number;
}) {
  const config = {
    positive: {
      label: 'Positive',
      variant: 'positive' as const,
      dot: 'bg-emerald-500',
    },
    negative: {
      label: 'Negative',
      variant: 'negative' as const,
      dot: 'bg-rose-500',
    },
    neutral: {
      label: 'Neutral',
      variant: 'neutral' as const,
      dot: 'bg-slate-400',
    },
  }[sentiment];

  return (
    <Badge variant={config.variant} className="gap-1.5 py-0.5">
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="text-[10px] opacity-75 font-mono">({(score * 100).toFixed(0)}%)</span>
      )}
    </Badge>
  );
}

