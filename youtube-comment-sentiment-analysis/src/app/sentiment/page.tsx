'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  MessageSquare,
  Search,
  Heart,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Video,
  Play,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatNumber, formatCompactNumber } from '@/lib/utils';
import { SentimentBadge } from '@/components/ui/Badge';
import { SentimentBar } from '@/components/ui/SentimentBar';
import { SentimentCategory } from '@/lib/types';

export default function SentimentAnalysisPage() {
  const { currentKeyword, overviewData, comments, analyzedVideos, videos } = useApp();

  const [selectedTab, setSelectedTab] = useState<'all' | SentimentCategory>('all');
  const [searchComment, setSearchComment] = useState('');
  const [selectedVideoFilter, setSelectedVideoFilter] = useState<string>('all');

  // List of analyzed videos (fall back to videos with sentiment if analyzedVideos is empty)
  const activeVideos = useMemo(() => {
    if (analyzedVideos && analyzedVideos.length > 0) return analyzedVideos;
    return (videos || []).filter(
      (v) =>
        v.commentCount > 0 &&
        (v.sentimentSummary?.positive > 0 ||
          v.sentimentSummary?.negative > 0 ||
          v.sentimentSummary?.neutral > 0)
    );
  }, [analyzedVideos, videos]);

  // Derive robust metrics in a single O(N) pass, memoized for performance
  const totalCommentsCount = comments.length > 0 ? comments.length : overviewData.totalComments;

  const { posCount, negCount, neuCount, positivePct, negativePct, neutralPct } = useMemo(() => {
    if (comments.length === 0) {
      return {
        posCount: overviewData.positiveCount,
        negCount: overviewData.negativeCount,
        neuCount: overviewData.neutralCount,
        positivePct: overviewData.positivePct,
        negativePct: overviewData.negativePct,
        neutralPct: overviewData.neutralPct,
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
      posCount: pos,
      negCount: neg,
      neuCount: neu,
      positivePct: pPct,
      negativePct: nPct,
      neutralPct: neuPct,
    };
  }, [comments, overviewData]);

  // 1. Calculate Net Sentiment Score (NSS = % Positive - % Negative)
  const nssScore = useMemo(() => {
    return positivePct - negativePct;
  }, [positivePct, negativePct]);

  const nssStatus = useMemo(() => {
    if (nssScore >= 20) {
      return {
        label: 'Apresiasi Sangat Kuat',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        textColor: 'text-emerald-600',
        description: 'Opini audiens sangat positif, kepuasan melampaui keluhan secara signifikan.',
        icon: TrendingUp,
      };
    }
    if (nssScore >= 0) {
      return {
        label: 'Positif Terkendali',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        textColor: 'text-blue-600',
        description: 'Sentimen positif masih unggul, namun kritik dari pengguna tetap terdeteksi.',
        icon: TrendingUp,
      };
    }
    if (nssScore >= -15) {
      return {
        label: 'Sentimen Kritis (Mixed)',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        textColor: 'text-amber-600',
        description: 'Opini audiens terbelah, keluhan mulai mendominasi kolom komentar.',
        icon: AlertTriangle,
      };
    }
    return {
      label: 'Zona Peringatan (Kritik Dominan)',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      textColor: 'text-rose-600',
      description: 'Volume kritik dan ketidakpuasan konsumen jauh melampaui respon positif.',
      icon: TrendingDown,
    };
  }, [nssScore]);

  // 2. Calculate Like Resonance / Opinion Weight
  const likeResonance = useMemo(() => {
    if (!comments || comments.length === 0) {
      return {
        avgPosLikes: '0',
        avgNegLikes: '0',
        totalPosLikes: 0,
        totalNegLikes: 0,
        ratioText: 'Belum ada data interaksi like',
        dominantLiker: 'neutral' as const,
      };
    }

    const posComms = comments.filter((c) => c.sentiment === 'positive');
    const negComms = comments.filter((c) => c.sentiment === 'negative');

    const totalPosLikes = posComms.reduce((sum, c) => sum + (c.likeCount || 0), 0);
    const totalNegLikes = negComms.reduce((sum, c) => sum + (c.likeCount || 0), 0);

    const avgPos = posComms.length > 0 ? totalPosLikes / posComms.length : 0;
    const avgNeg = negComms.length > 0 ? totalNegLikes / negComms.length : 0;

    const avgPosFormatted = avgPos >= 10 ? Math.round(avgPos).toString() : avgPos.toFixed(1);
    const avgNegFormatted = avgNeg >= 10 ? Math.round(avgNeg).toString() : avgNeg.toFixed(1);

    let ratioText = 'Resonansi like seimbang antar sentimen';
    let dominantLiker: 'positive' | 'negative' | 'neutral' = 'neutral';

    if (totalNegLikes > totalPosLikes && totalPosLikes > 0) {
      const mult = (totalNegLikes / totalPosLikes).toFixed(1);
      ratioText = `Kritik memperoleh ${formatNumber(totalNegLikes)} total likes (${mult}x lipat dari apresiasi)`;
      dominantLiker = 'negative';
    } else if (totalPosLikes > totalNegLikes && totalNegLikes > 0) {
      const mult = (totalPosLikes / totalNegLikes).toFixed(1);
      ratioText = `Apresiasi memperoleh ${formatNumber(totalPosLikes)} total likes (${mult}x lipat dari kritik)`;
      dominantLiker = 'positive';
    } else if (totalNegLikes > 0 || totalPosLikes > 0) {
      ratioText = `Kritik: ${formatNumber(totalNegLikes)} likes vs Apresiasi: ${formatNumber(totalPosLikes)} likes`;
    }

    return {
      avgPosLikes: avgPosFormatted,
      avgNegLikes: avgNegFormatted,
      totalPosLikes,
      totalNegLikes,
      ratioText,
      dominantLiker,
    };
  }, [comments]);

  // 3. Polarization & Strong Opinion Index
  const polarizationIndex = useMemo(() => {
    return Math.min(100, positivePct + negativePct);
  }, [positivePct, negativePct]);

  // 4. NLP Model Confidence & Calibration
  const nlpStats = useMemo(() => {
    if (!comments || comments.length === 0) {
      return { avgConf: '0.0', highConfPct: 0, modConfPct: 0, posAvg: '0', negAvg: '0', neuAvg: '0' };
    }

    const total = comments.length;
    const avg = ((comments.reduce((sum, c) => sum + (c.confidenceScore || 0), 0) / total) * 100).toFixed(1);

    const high = comments.filter((c) => (c.confidenceScore || 0) >= 0.85).length;
    const highPct = Math.round((high / total) * 100);

    const pos = comments.filter((c) => c.sentiment === 'positive');
    const neg = comments.filter((c) => c.sentiment === 'negative');
    const neu = comments.filter((c) => c.sentiment === 'neutral');

    const posAvg = pos.length > 0 ? ((pos.reduce((s, c) => s + c.confidenceScore, 0) / pos.length) * 100).toFixed(1) : '0';
    const negAvg = neg.length > 0 ? ((neg.reduce((s, c) => s + c.confidenceScore, 0) / neg.length) * 100).toFixed(1) : '0';
    const neuAvg = neu.length > 0 ? ((neu.reduce((s, c) => s + c.confidenceScore, 0) / neu.length) * 100).toFixed(1) : '0';

    return {
      avgConf: avg,
      highConfPct: highPct,
      modConfPct: 100 - highPct,
      posAvg,
      negAvg,
      neuAvg,
    };
  }, [comments]);

  // 5. Per-Video Sentiment Breakdown & Ranking
  const videoRankings = useMemo(() => {
    return activeVideos.map((v) => {
      const pos = v.sentimentSummary?.positive || 0;
      const neg = v.sentimentSummary?.negative || 0;
      const nss = pos - neg;
      return {
        ...v,
        videoNss: nss,
      };
    }).sort((a, b) => b.videoNss - a.videoNss);
  }, [activeVideos]);

  // 6. Resonant Comments Feed (Sorted by Likes Descending)
  const filteredResonantComments = useMemo(() => {
    let list = [...comments];

    // Filter by Tab
    if (selectedTab !== 'all') {
      list = list.filter((c) => c.sentiment === selectedTab);
    }

    // Filter by Video
    if (selectedVideoFilter !== 'all') {
      list = list.filter((c) => c.videoId === selectedVideoFilter);
    }

    // Filter by Search Query
    if (searchComment.trim()) {
      const q = searchComment.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.comment.toLowerCase().includes(q) ||
          c.author.toLowerCase().includes(q) ||
          c.videoTitle.toLowerCase().includes(q)
      );
    }

    // Sort by likes descending for resonant voice discovery
    return list.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
  }, [comments, selectedTab, selectedVideoFilter, searchComment]);

  // Empty State if no comments analyzed yet
  if (!comments || comments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sentiment Deep-Dive</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Analisis sentimen mendalam, bobot resonansi likes, dan komparasi antar video untuk &ldquo;
              <span className="font-semibold text-slate-800">{currentKeyword}</span>&rdquo;
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/70 shadow-sm max-w-xl mx-auto my-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Belum Ada Analisis Sentimen Mendalam</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Data resonansi sentimen dan benchmark video belum tersedia untuk keyword &ldquo;{currentKeyword}&rdquo;. Buka halaman YouTube Search dan klik &ldquo;Analyze Video Comments&rdquo; untuk memulai ekstraksi opini netizen.
          </p>
          <div className="pt-2">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition-all shadow-sm shadow-blue-600/20"
            >
              <Search className="w-4 h-4" />
              <span>Mulai di YouTube Search</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const NssIcon = nssStatus.icon;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sentiment Deep-Dive & Resonance</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Analisis kekuatan opini, Net Sentiment Score (NSS), bobot like netizen, dan perbandingan antar video untuk &ldquo;
            <span className="font-semibold text-slate-800">{currentKeyword}</span>&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200/80 text-slate-600 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Sampel Teranalisis: <strong className="text-slate-900">{formatNumber(comments.length)}</strong> komentar dari{' '}
            <strong className="text-slate-900">{activeVideos.length}</strong> video
          </span>
        </div>
      </div>

      {/* ROW 1: DEEP ANALYTICS METRICS (NON-REDUNDANT INSIGHTS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Net Sentiment Score (NSS) Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Net Sentiment Score (NSS)
              </span>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className={`text-3xl font-extrabold ${nssScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {nssScore > 0 ? `+${nssScore}` : nssScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">skala -100 s/d +100</span>
              </div>
            </div>
            <div className={`p-2.5 rounded-xl border ${nssStatus.badgeColor}`}>
              <NssIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${nssStatus.badgeColor}`}>
              {nssStatus.label}
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              {nssStatus.description}
            </p>
          </div>
        </div>

        {/* 2. Opinion Resonance & Likes Disparity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Resonansi Dukungan Netizen (Likes)
              </span>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1.5 text-rose-600 font-bold text-sm bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Ø {likeResonance.avgNegLikes} like</span>
                </div>
                <span className="text-xs text-slate-300 font-semibold">vs</span>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Ø {likeResonance.avgPosLikes} like</span>
                </div>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-pink-50 text-rose-600 border border-rose-100">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
              {likeResonance.ratioText}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Total like: {formatNumber(likeResonance.totalNegLikes)} pada kritik vs {formatNumber(likeResonance.totalPosLikes)} pada apresiasi.
            </p>
          </div>
        </div>

        {/* 3. Polarization & Model Confidence Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Tingkat Polarisasi Opini
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-indigo-600">
                  {polarizationIndex}%
                </span>
                <span className="text-xs text-slate-400">Opini Tajam</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Keyakinan IndoBERT NLP:</span>
              <span className="font-bold font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {nlpStats.avgConf}% Avg
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {polarizationIndex}% audiens memiliki opini tegas (positif/negatif), sementara {100 - polarizationIndex}% bersikap netral atau bertanya.
            </p>
          </div>
        </div>
      </div>

      {/* ROW 2: CROSS-VIDEO SENTIMENT BENCHMARK (BENCHMARK ANTAR VIDEO) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Cross-Video Sentiment Benchmark (Komparasi Antar Kreator)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Perbandingan distribusi sentimen dari masing-masing video yang telah dianalisis pada keyword ini.
            </p>
          </div>

          {activeVideos.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Paling Positif: {videoRankings[0]?.channelTitle} (+{videoRankings[0]?.videoNss})
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                Paling Kritis: {videoRankings[videoRankings.length - 1]?.channelTitle} ({videoRankings[videoRankings.length - 1]?.videoNss})
              </span>
            </div>
          )}
        </div>

        {/* Video Comparison Cards Table */}
        <div className="space-y-3">
          {videoRankings.map((v, idx) => {
            const pos = v.sentimentSummary?.positive || 0;
            const neg = v.sentimentSummary?.negative || 0;
            const neu = v.sentimentSummary?.neutral || 0;

            return (
              <div
                key={v.id}
                className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1" title={v.title}>
                        {v.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {v.channelTitle} • {formatNumber(v.commentCount)} komentar dianalisis
                      </p>
                    </div>
                  </div>

                  {/* Net Sentiment Pill for this Video */}
                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <span className="text-[11px] text-slate-500">
                      NSS Video:{' '}
                      <strong className={v.videoNss >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {v.videoNss > 0 ? `+${v.videoNss}` : v.videoNss}
                      </strong>
                    </span>
                    <span className="text-xs font-bold text-emerald-600">{pos}% Positif</span>
                    <span className="text-xs font-bold text-rose-600">{neg}% Negatif</span>
                    <span className="text-xs font-bold text-slate-500">{neu}% Netral</span>
                  </div>
                </div>

                {/* Progress bar comparison */}
                <div className="w-full">
                  <SentimentBar positive={pos} negative={neg} neutral={neu} />
                </div>
              </div>
            );
          })}
        </div>

        {activeVideos.length === 1 && (
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-800 flex items-center justify-between gap-3">
            <span>
              💡 <strong>Tips Analitik:</strong> Baru 1 video yang dianalisis. Anda dapat menganalisis video kedua di YouTube Search untuk melihat komparasi otomatis respon penonton antar kreator.
            </span>
            <Link
              href="/search"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shrink-0 transition-all text-xs"
            >
              Tambah Video di Search →
            </Link>
          </div>
        )}
      </div>

      {/* ROW 3: NLP MODEL CONFIDENCE CALIBRATION */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              IndoBERT NLP Model Confidence & Quality Calibration
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Overall Model Confidence: <strong className="text-slate-900">{nlpStats.avgConf}%</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
            <span className="text-emerald-700 font-semibold">Tingkat Keyakinan Positif</span>
            <div className="text-2xl font-bold text-emerald-800 font-mono">{nlpStats.posAvg}%</div>
            <p className="text-[11px] text-emerald-600 leading-tight">
              Akurasi inferensi model dalam mendeteksi apresiasi, kepuasan, dan rekomendasi produk.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 space-y-1">
            <span className="text-rose-700 font-semibold">Tingkat Keyakinan Negatif</span>
            <div className="text-2xl font-bold text-rose-800 font-mono">{nlpStats.negAvg}%</div>
            <p className="text-[11px] text-rose-600 leading-tight">
              Akurasi inferensi model dalam mendeteksi keluhan, sarkasme, dan kritik pedas konsumen.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-600 font-semibold">Tingkat Keyakinan Netral</span>
            <div className="text-2xl font-bold text-slate-800 font-mono">{nlpStats.neuAvg}%</div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Akurasi inferensi model dalam mendeteksi pertanyaan spesifikasi dan pernyataan objektif.
            </p>
          </div>
        </div>
      </div>

      {/* ROW 4: MOST RESONANT VOICES (SORTED BY LIKES FOR AUTHENTIC AUDIENCE VOICE) */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        {/* Header & Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">
                Most Resonant Audience Feedback (Komentar Paling Diamini Netizen)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar komentar diurutkan berdasarkan jumlah likes tertinggi untuk menemukan suara publik yang paling disepakati.
            </p>
          </div>

          {/* Search comments */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchComment}
                onChange={(e) => setSearchComment(e.target.value)}
                placeholder="Cari dalam komentar resonan..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 w-52 sm:w-64 transition-all"
              />
            </div>

            {/* Video Selector Dropdown if multiple videos */}
            {activeVideos.length > 1 && (
              <select
                value={selectedVideoFilter}
                onChange={(e) => setSelectedVideoFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Semua Video ({comments.length})</option>
                {activeVideos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.channelTitle} ({v.commentCount})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Filter Sentimen:</span>
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              selectedTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Semua Resonansi ({comments.length})
          </button>
          <button
            onClick={() => setSelectedTab('negative')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              selectedTab === 'negative'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <ThumbsDown className="w-3 h-3" />
            <span>Kritik Terkuat ({negCount})</span>
          </button>
          <button
            onClick={() => setSelectedTab('positive')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              selectedTab === 'positive'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>Apresiasi Tertinggi ({posCount})</span>
          </button>
          <button
            onClick={() => setSelectedTab('neutral')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              selectedTab === 'neutral'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MinusCircle className="w-3 h-3" />
            <span>Diskusi Netral ({neuCount})</span>
          </button>
        </div>

        {/* Comment List */}
        <div className="divide-y divide-slate-100">
          {filteredResonantComments.length > 0 ? (
            filteredResonantComments.slice(0, 30).map((c, idx) => {
              const isTopLiked = idx < 3 && (c.likeCount || 0) > 50;

              return (
                <div
                  key={c.id}
                  className={`p-5 transition-colors space-y-2.5 ${
                    isTopLiked ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                        {c.author.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-900">{c.author}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{c.publishedDate}</span>
                          <span>•</span>
                          <span className="truncate max-w-[280px]" title={c.videoTitle}>
                            {c.videoTitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Prominent Likes Pill */}
                      {(c.likeCount || 0) > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-50 border border-pink-200 text-rose-700 font-bold text-xs">
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          <span>{formatNumber(c.likeCount)} likes</span>
                        </div>
                      )}
                      <SentimentBadge sentiment={c.sentiment} score={c.confidenceScore} />
                    </div>
                  </div>

                  {/* Comment Body */}
                  <p className="text-sm text-slate-800 leading-relaxed pl-10 border-l-2 border-slate-200 ml-4 my-1">
                    &ldquo;{c.comment}&rdquo;
                  </p>

                  {/* Footer metadata */}
                  <div className="pl-10 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">
                      NLP Confidence: {((c.confidenceScore || 0) * 100).toFixed(1)}%
                    </span>
                    {isTopLiked && (
                      <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        ⭐ Top Most Resonated Comment
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ada komentar yang cocok dengan filter atau kata kunci pencarian.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
