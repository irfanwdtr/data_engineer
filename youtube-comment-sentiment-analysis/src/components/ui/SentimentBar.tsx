import React from 'react';

interface SentimentBarProps {
  positive: number;
  negative: number;
  neutral: number;
  showLabels?: boolean;
  className?: string;
}

export function SentimentBar({
  positive,
  negative,
  neutral,
  showLabels = false,
  className = '',
}: SentimentBarProps) {
  const total = positive + negative + neutral || 100;
  const posWidth = (positive / total) * 100;
  const negWidth = (negative / total) * 100;
  const neuWidth = (neutral / total) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 gap-0.5">
        <div
          style={{ width: `${posWidth}%` }}
          className="bg-emerald-500 rounded-l-full transition-all duration-500"
          title={`Positive: ${positive}%`}
        />
        <div
          style={{ width: `${negWidth}%` }}
          className="bg-rose-500 transition-all duration-500"
          title={`Negative: ${negative}%`}
        />
        <div
          style={{ width: `${neuWidth}%` }}
          className="bg-slate-400 rounded-r-full transition-all duration-500"
          title={`Neutral: ${neutral}%`}
        />
      </div>
      {showLabels && (
        <div className="flex items-center justify-between text-xs mt-1 text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {positive}% Positif
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> {negative}% Negatif
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span> {neutral}% Netral
          </span>
        </div>
      )}
    </div>
  );
}

