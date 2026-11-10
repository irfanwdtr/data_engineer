'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  AlertCircle,
  TrendingUp,
  Tag,
  Hash,
  MessageSquareWarning,
  Flame,
  CheckCircle,
  Search,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { formatNumber } from '@/lib/utils';
import { extractWordCloud } from '@/lib/topicExtractor';

export default function TopicAnalysisPage() {
  const { currentKeyword, comments, topKeywords, painPoints } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const hasData = comments && comments.length > 0;

  // Dynamic Word Cloud generated from actual aggregated comments
  const wordCloudData = useMemo(() => {
    if (!comments || comments.length === 0) return [];
    return extractWordCloud(comments, 24);
  }, [comments]);

  const filteredPainPoints = useMemo(() => {
    if (!painPoints) return [];
    if (selectedCategory === 'all') return painPoints;
    return painPoints.filter((p) =>
      p.category.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [painPoints, selectedCategory]);

  // High-level topic insights
  const dominantPositive = useMemo(() => {
    const pos = (topKeywords || []).find((k) => k.positiveRatio >= 0.6);
    return pos ? `Aspek ${pos.keyword.toUpperCase()}` : 'Fitur & Kualitas Produk';
  }, [topKeywords]);

  const primaryPainPoint = useMemo(() => {
    if (painPoints && painPoints.length > 0) {
      return painPoints[0].title;
    }
    return 'Harga & Nilai Pemakaian';
  }, [painPoints]);

  if (!hasData) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Topic Analysis</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Analisis topik utama, keluhan konsumen (pain points), dan frekuensi kata kunci untuk &ldquo;
              <span className="font-semibold text-slate-800">{currentKeyword}</span>&rdquo;
            </p>
          </div>
        </div>

        {/* Empty State Banner */}
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/70 shadow-sm max-w-xl mx-auto my-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Belum Ada Analisis Topik</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Data topik, visual word cloud, dan pain points belum tersedia untuk keyword &ldquo;{currentKeyword}&rdquo;. Buka halaman YouTube Search dan klik &ldquo;Analyze Video Comments&rdquo; pada video yang ingin Anda teliti untuk mengagregasikan datanya.
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Topic Analysis</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Analisis topik utama, keluhan konsumen (pain points), dan frekuensi kata kunci untuk &ldquo;
            <span className="font-semibold text-slate-800">{currentKeyword}</span>&rdquo;
          </p>
        </div>

        {/* Real Data Tag */}
        <div className="flex items-center gap-2 text-xs bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 self-start sm:self-auto">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{comments.length} Komentar Teragregasi (IndoBERT NLP)</span>
        </div>
      </div>

      {/* Top 3 High Level Topic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Topik Dominan Positif</span>
              <p className="text-base font-bold text-slate-800 line-clamp-1">{dominantPositive}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sentimen positif paling banyak terkonsentrasi pada kepuasan terhadap fitur, impresi pemakaian, dan peningkatan performa.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Keluhan Utama (Pain Point)</span>
              <p className="text-base font-bold text-slate-800 line-clamp-1">{primaryPainPoint}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sorotan negatif audiens berpusat pada perbandingan harga, efisiensi baterai, dan kebutuhan pembaruan spesifikasi.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Topik Paling Ramai Didebatkan</span>
              <p className="text-base font-bold text-slate-800 line-clamp-1">Performa & Daya Tahan</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Performa penggunaan harian, game, serta suhu saat pemakaian intensif memicu diskusi aktif antar komentar.
          </p>
        </div>
      </div>

      {/* Row: Interactive Word Cloud & Keyword Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Word Cloud Card */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-700" />
                <h3 className="font-semibold text-slate-800 text-sm">Visual Word Cloud (Ekstraksi Kata Kunci Komentar)</h3>
              </div>
              <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">Real Data</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Ukuran teks merepresentasikan bobot frekuensi kemunculan kata dalam komentar aktual yang dianalisis.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 py-6 px-4 bg-slate-50/70 rounded-2xl border border-slate-100 min-h-[220px]">
              {wordCloudData.length > 0 ? (
                wordCloudData.map((tag) => {
                  const colorClass =
                    tag.sentiment === 'positive'
                      ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                      : tag.sentiment === 'negative'
                      ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200';

                  return (
                    <span
                      key={tag.text}
                      style={{ fontSize: `${Math.max(12, tag.weight * 0.85)}px` }}
                      className={`font-semibold cursor-pointer px-2.5 py-1 rounded-lg transition-all duration-200 select-none ${colorClass}`}
                      title={`${tag.text}: bobot ${tag.weight} (${tag.sentiment})`}
                    >
                      #{tag.text}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-slate-400">Kata kunci sedang dihitung...</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-4 mt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Asosiasi Positif
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Asosiasi Negatif
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Netral / Umum
            </span>
          </div>
        </div>

        {/* Keyword Frequency Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-700" />
                <h3 className="font-semibold text-slate-800 text-sm">Frekuensi Kata Kunci & Rasio Kepuasan</h3>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Top kata kunci dari data terpusat beserta proporsi sentimen positif.
            </p>

            <div className="space-y-3">
              {(topKeywords || []).slice(0, 8).map((k) => (
                <div key={k.keyword} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 capitalize">{k.keyword}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono">{formatNumber(k.count)} sebutan</span>
                      <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded text-[11px]">
                        {(k.positiveRatio * 100).toFixed(0)}% Positif
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${k.positiveRatio * 100}%` }}
                      className="bg-emerald-500 h-full rounded-l-full"
                    />
                    <div
                      style={{ width: `${(1 - k.positiveRatio) * 100}%` }}
                      className="bg-rose-500 h-full rounded-r-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-4 border-t border-slate-100">
            Ekstraksi topik berbasis frekuensi kemunculan kata pada {comments.length} komentar aktual.
          </div>
        </div>
      </div>

      {/* Customer Pain Points & Issues Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-rose-600" />
              <h2 className="text-base font-bold text-slate-900">
                Customer Pain Points & Frequently Discussed Issues
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Daftar keluhan audiens yang terdeteksi dalam dataset komentar YouTube aktual.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {['all', 'Harga', 'Baterai', 'Kamera', 'Performa'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Pain Point Cards */}
        {filteredPainPoints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPainPoints.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-white hover:shadow-sm transition-all space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                      <Badge
                        variant={
                          item.severity === 'high'
                            ? 'negative'
                            : item.severity === 'medium'
                            ? 'warning'
                            : 'gray'
                        }
                      >
                        {item.severity.toUpperCase()} IMPACT
                      </Badge>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-rose-600">{item.mentions}</span>
                    <p className="text-[10px] text-slate-400">sebutan</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                {/* Sample Comment Quotes */}
                {item.sampleComments && item.sampleComments.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500">Contoh Komentar Aktual:</span>
                    {item.sampleComments.map((quote, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-50 text-[11px] text-slate-700 italic border-l-2 border-rose-400 line-clamp-3"
                      >
                        &ldquo;{quote}&rdquo;
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            Tidak ada keluhan ditemukan untuk kategori ini.
          </div>
        )}
      </div>
    </div>
  );
}
