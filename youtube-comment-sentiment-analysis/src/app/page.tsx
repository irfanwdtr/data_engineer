'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Video,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Calendar,
  ChevronDown,
  Sparkles,
  Loader2,
  Search,
  ArrowRight,
  Play,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SentimentDonutChart } from '@/components/dashboard/SentimentDonutChart';
import { SentimentTrendChart } from '@/components/dashboard/SentimentTrendChart';
import { TopKeywordsBarChart } from '@/components/dashboard/TopKeywordsBarChart';
import { SentimentBar } from '@/components/ui/SentimentBar';
import { formatNumber } from '@/lib/utils';
import { SentimentTrendPoint } from '@/lib/types';

export default function OverviewPage() {
  const {
    currentKeyword,
    overviewData,
    videos,
    analyzedVideos,
    comments,
    trendData,
    topKeywords,
    dateRange,
    setDateRange,
    isAnalyzing,
  } = useApp();

  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const dateOptions = ['Semua Waktu', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'];

  // 1. Ambil daftar video yang benar-benar telah dianalisis dari AppContext
  const activeAnalyzedVideos = useMemo(() => {
    if (analyzedVideos && analyzedVideos.length > 0) return analyzedVideos;
    return (videos || []).filter(
      (v) =>
        (v.commentCount && v.commentCount > 0) ||
        (v.sentimentSummary &&
          (v.sentimentSummary.positive > 0 ||
            v.sentimentSummary.negative > 0 ||
            v.sentimentSummary.neutral > 0))
    );
  }, [analyzedVideos, videos]);

  // 2. Metrik riil yang dihitung dalam satu pass O(N) dan dimemoize
  const totalVideos = activeAnalyzedVideos.length > 0 ? activeAnalyzedVideos.length : overviewData.totalVideos;
  const totalComments = comments.length > 0 ? comments.length : overviewData.totalComments;

  const { positiveCount, negativeCount, neutralCount, positivePct, negativePct, neutralPct } = useMemo(() => {
    if (comments.length === 0) {
      const pos = overviewData.positiveCount;
      const neg = overviewData.negativeCount;
      const neu = overviewData.neutralCount;
      const tot = overviewData.totalComments;
      const pPct = tot > 0 ? Math.round((pos / tot) * 100) : 0;
      const nPct = tot > 0 ? Math.round((neg / tot) * 100) : 0;
      const neuPct = tot > 0 ? Math.max(0, 100 - pPct - nPct) : 0;
      return {
        positiveCount: pos,
        negativeCount: neg,
        neutralCount: neu,
        positivePct: pPct,
        negativePct: nPct,
        neutralPct: neuPct,
      };
    }

    let pos = 0;
    let neg = 0;
    let neu = 0;
    for (const c of comments) {
      if (c.sentiment === 'positive') pos++;
      else if (c.sentiment === 'negative') neg++;
      else neu++;
    }

    const tot = comments.length;
    const pPct = tot > 0 ? Math.round((pos / tot) * 100) : 0;
    const nPct = tot > 0 ? Math.round((neg / tot) * 100) : 0;
    const neuPct = tot > 0 ? Math.max(0, 100 - pPct - nPct) : 0;

    return {
      positiveCount: pos,
      negativeCount: neg,
      neutralCount: neu,
      positivePct: pPct,
      negativePct: nPct,
      neutralPct: neuPct,
    };
  }, [comments, overviewData]);

  // 3. Distribusi sentimen aktual untuk Donut Chart
  const currentSentimentDistribution = useMemo(() => {
    return [
      { name: 'Positive', value: positiveCount, percentage: positivePct, color: '#10b981' },
      { name: 'Negative', value: negativeCount, percentage: negativePct, color: '#ef4444' },
      { name: 'Neutral', value: neutralCount, percentage: neutralPct, color: '#8590a5' },
    ];
  }, [positiveCount, negativeCount, neutralCount, positivePct, negativePct, neutralPct]);

  // 4. Sentiment Trend Over Time: menyesuaikan bulan paling awal saat komentar pertama ada
  const dynamicTrendData: SentimentTrendPoint[] = useMemo(() => {
    if (!comments || comments.length === 0) {
      return trendData && trendData.length > 0 ? trendData : [];
    }

    const monthNamesId: Record<string, string> = {
      '01': 'Jan',
      '02': 'Feb',
      '03': 'Mar',
      '04': 'Apr',
      '05': 'Mei',
      '06': 'Jun',
      '07': 'Jul',
      '08': 'Agu',
      '09': 'Sep',
      '10': 'Okt',
      '11': 'Nov',
      '12': 'Des',
    };

    // Kelompokkan komentar per bulan (YYYY-MM)
    const monthCounts: Record<
      string,
      { positive: number; negative: number; neutral: number; total: number }
    > = {};

    for (const c of comments) {
      if (!c.publishedDate) continue;
      const match = c.publishedDate.match(/^(\d{4})-(\d{2})/);
      if (!match) continue;

      const key = `${match[1]}-${match[2]}`;
      if (!monthCounts[key]) {
        monthCounts[key] = { positive: 0, negative: 0, neutral: 0, total: 0 };
      }

      if (c.sentiment === 'positive') {
        monthCounts[key].positive += 1;
      } else if (c.sentiment === 'negative') {
        monthCounts[key].negative += 1;
      } else {
        monthCounts[key].neutral += 1;
      }
      monthCounts[key].total += 1;
    }

    const keys = Object.keys(monthCounts).sort();
    if (keys.length === 0) {
      return trendData && trendData.length > 0 ? trendData : [];
    }

    // Ambil bulan paling awal saat komentar pertama ada dan bulan terbaru
    const [startYear, startMonth] = keys[0].split('-').map(Number);
    const [endYear, endMonth] = keys[keys.length - 1].split('-').map(Number);

    // Buat rentang bulan berkesinambungan mulai dari bulan paling awal
    const continuousKeys: string[] = [];
    let y = startYear;
    let m = startMonth;

    while (y < endYear || (y === endYear && m <= endMonth)) {
      continuousKeys.push(`${y}-${String(m).padStart(2, '0')}`);
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }

    return continuousKeys.map((key) => {
      const [yearStr, monthStr] = key.split('-');
      const label = `${monthNamesId[monthStr] || monthStr} ${yearStr}`;
      const counts = monthCounts[key] || { positive: 0, negative: 0, neutral: 0, total: 0 };

      return {
        date: label,
        positive: counts.positive,
        negative: counts.negative,
        neutral: counts.neutral,
        total: counts.total,
      };
    });
  }, [comments, trendData]);

  // 5. Ekstraksi Top Keywords aktual dari komentar riil
  const dynamicTopKeywords = useMemo(() => {
    if (!comments || comments.length === 0) {
      return topKeywords;
    }

    const stopwords = new Set([
      'dan', 'di', 'yang', 'untuk', 'ini', 'itu', 'dengan', 'dari', 'ke', 'pada',
      'saya', 'ada', 'tidak', 'bisa', 'ya', 'bang', 'nya', 'hp', 'yg', 'uda',
      'sudah', 'mau', 'kalo', 'tapi', 'karena', 'jadi', 'cuma', 'ga', 'gak',
      'aja', 'apa', 'buat', 'lebih', 'atau', 'sih', 'aku', 'kan', 'juga',
      'biar', 'pas', 'saat', 'masih', 'kok', 'terus', 'emang', 'nih', 'kita',
      'dong', 'sama', 'review', 'the', 'and', 'for', 'with', 'this', 'that',
    ]);

    const counts: Record<string, { total: number; positive: number }> = {};

    for (const c of comments) {
      const text = (c.comment || '').toLowerCase();
      const words = text.match(/[a-z]{3,}/g) || [];
      const seenInComment = new Set<string>();

      for (const w of words) {
        if (stopwords.has(w) || w.length < 3 || seenInComment.has(w)) continue;
        seenInComment.add(w);

        if (!counts[w]) {
          counts[w] = { total: 0, positive: 0 };
        }
        counts[w].total += 1;
        if (c.sentiment === 'positive') {
          counts[w].positive += 1;
        }
      }
    }

    const sorted = Object.entries(counts)
      .filter(([_, v]) => v.total >= 3)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10);

    if (sorted.length === 0) return topKeywords;

    return sorted.map(([keyword, v]) => ({
      keyword,
      count: v.total,
      positiveRatio: Math.round((v.positive / v.total) * 100) / 100,
    }));
  }, [comments, topKeywords]);

  // Status apakah ada data analisis
  const hasAnalysisData = totalComments > 0 || activeAnalyzedVideos.length > 0;

  // 6. Tampilkan Empty State yang informatif jika belum ada data analisis
  if (!hasAnalysisData) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Overview</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Ringkasan hasil analisis komentar YouTube
            </p>
          </div>
        </div>

        {/* Empty State Banner */}
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/70 shadow-sm max-w-xl mx-auto my-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Belum Ada Data Hasil Analisis</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Halaman Overview akan menampilkan metrik aktual, grafik distribusi sentimen, tren waktu, serta ringkasan video setelah Anda menganalisis video YouTube.
          </p>
          <div className="pt-2">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition-all shadow-sm shadow-blue-600/20"
            >
              <Search className="w-4 h-4" />
              <span>Mulai Analisis di YouTube Search</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ringkasan hasil analisis aktual komentar YouTube
          </p>
        </div>

        {/* Date Filter Dropdown */}
        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dateDropdownOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 text-xs font-medium">
              {dateOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setDateRange(opt);
                    setDateDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors ${
                    dateRange === opt ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Notification Banner if running */}
      {isAnalyzing && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-blue-800 text-xs animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="font-medium">
            Sedang memuat data analisis terbaru dan menghitung sentimen NLP...
          </span>
        </div>
      )}

      {/* 5 Top Metric Cards Terhubung Langsung ke Data Aktual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Videos Analyzed */}
        <MetricCard
          title="Videos Analyzed"
          value={totalVideos}
          trend={`${totalVideos} Video`}
          trendType="positive"
          subtext="Hasil analisis aktual"
          icon={Video}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />

        {/* Comments Collected */}
        <MetricCard
          title="Comments Collected"
          value={formatNumber(totalComments)}
          trend={`${formatNumber(totalComments)} Total`}
          trendType="positive"
          subtext={`Dari ${totalVideos} video YouTube`}
          icon={MessageSquare}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        {/* Positive Sentiment */}
        <MetricCard
          title="Positive Sentiment"
          value={`${positivePct}%`}
          trend={`${positivePct}%`}
          trendType="positive"
          subtext={`${formatNumber(positiveCount)} komentar`}
          icon={ThumbsUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        {/* Negative Sentiment */}
        <MetricCard
          title="Negative Sentiment"
          value={`${negativePct}%`}
          trend={`${negativePct}%`}
          trendType="negative"
          subtext={`${formatNumber(negativeCount)} komentar`}
          icon={ThumbsDown}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />

        {/* Neutral Sentiment */}
        <MetricCard
          title="Neutral Sentiment"
          value={`${neutralPct}%`}
          trend={`${neutralPct}%`}
          trendType="neutral"
          subtext={`${formatNumber(neutralCount)} komentar`}
          icon={MinusCircle}
          iconColor="text-slate-600"
          iconBg="bg-slate-100"
        />
      </div>

      {/* Charts Row: Sentiment Distribution & Sentiment Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <SentimentDonutChart
            data={currentSentimentDistribution}
            totalComments={totalComments}
          />
        </div>
        <div className="lg:col-span-7">
          <SentimentTrendChart data={dynamicTrendData} />
        </div>
      </div>

      {/* Bottom Row: Top Keywords & Ringkasan Video Teranalisis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <TopKeywordsBarChart keywords={dynamicTopKeywords} />
        </div>

        {/* Ringkasan Video yang Sudah Dianalisis */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header Card */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-slate-700" />
                <h3 className="font-semibold text-slate-800 text-sm">
                  Ringkasan Video Teranalisis
                </h3>
              </div>

              <Link
                href="/search"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 group"
              >
                Analisis Video Lain
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Video Summary Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-100">
                    <th className="pb-3 font-medium">Video YouTube</th>
                    <th className="pb-3 font-medium">Channel</th>
                    <th className="pb-3 font-medium text-center">Komentar</th>
                    <th className="pb-3 font-medium min-w-[140px]">Sentimen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeAnalyzedVideos.slice(0, 5).map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Video Thumbnail & Title */}
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative flex items-center justify-center">
                            {v.thumbnailUrl ? (
                              <img
                                src={v.thumbnailUrl}
                                alt={v.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Play className="w-3 h-3 fill-slate-400 text-slate-400" />
                            )}
                          </div>
                          <span
                            className="font-semibold text-slate-800 line-clamp-1 max-w-[200px]"
                            title={v.title}
                          >
                            {v.title}
                          </span>
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="py-3 text-slate-500 pr-3 whitespace-nowrap">
                        {v.channelTitle}
                      </td>

                      {/* Komentar */}
                      <td className="py-3 text-center text-slate-700 font-medium pr-3">
                        {formatNumber(v.commentCount || 0)}
                      </td>

                      {/* Sentiment Bar */}
                      <td className="py-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="font-medium text-emerald-600">
                              {v.sentimentSummary?.positive || 0}% Positif
                            </span>
                          </div>
                          <SentimentBar
                            positive={v.sentimentSummary?.positive || 0}
                            negative={v.sentimentSummary?.negative || 0}
                            neutral={v.sentimentSummary?.neutral || 0}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
