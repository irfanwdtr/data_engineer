'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Eye,
  MessageSquare,
  Sparkles,
  Play,
  CheckCircle2,
  Loader2,
  Video,
  AlertCircle,
  X,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCompactNumber, formatNumber } from '@/lib/utils';
import { SentimentBar } from '@/components/ui/SentimentBar';
import { CommentItem, VideoItem } from '@/lib/types';
import {
  ApiClientError,
  analyzeSingleVideo,
  searchYouTubeVideos,
} from '@/lib/api';

export default function YouTubeSearchPage() {
  const {
    currentKeyword,
    setCurrentKeyword,
    setVideos,
    analyzedVideos,
    comments,
    aggregateVideoAnalysis,
    resetSessionForKeyword,
  } = useApp();

  const [searchInput, setSearchInput] = useState<string>(currentKeyword);
  const [searchedKeyword, setSearchedKeyword] = useState<string>('');
  const [searchResults, setSearchResults] = useState<VideoItem[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [analyzingVideoId, setAnalyzingVideoId] = useState<string | null>(null);

  const [searchError, setSearchError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('Semua Waktu');
  const [selectedCountFilter, setSelectedCountFilter] = useState<string>('10');
  const [sortBy, setSortBy] = useState<'relevance' | 'views' | 'comments' | 'newest'>('relevance');

  const suggestedKeywords = [
    'Review iPhone 17',
    'Samsung Galaxy S25',
    'Review MacBook M4',
    'Laptop Gaming 2025',
    'HP Lipat Terbaru',
  ];

  const formatVideoDate = (dStr: string) => {
    if (!dStr) return '';
    const ts = Date.parse(dStr);
    if (!isNaN(ts)) {
      return new Date(ts).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return dStr;
  };

  const executeSearch = async (kw: string) => {
    const trimmed = (kw || '').trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchError('Keyword pencarian minimal 2 karakter.');
      return;
    }

    // Reset active analysis session if search keyword changes (e.g. from Review iPhone 17 to Samsung S25)
    if (trimmed.toLowerCase() !== (currentKeyword || '').toLowerCase()) {
      resetSessionForKeyword(trimmed);
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      console.log('[Search] Executing search for keyword:', trimmed);
      const count = parseInt(selectedCountFilter, 10) || 10;
      const safeCount = Math.min(50, Math.max(1, count));

      const response = await searchYouTubeVideos(trimmed, safeCount);
      console.log('[Search] API Response received:', response);

      if (response && response.videos) {
        setSearchResults(response.videos);
        setSearchedKeyword(response.keyword || trimmed);
        setHasSearched(true);
        setCurrentKeyword(response.keyword || trimmed);
        setVideos(response.videos);
      }
    } catch (err: unknown) {
      console.error('[Search] Error in executeSearch:', err);
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Gagal melakukan pencarian video YouTube.';
      setSearchError(message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    executeSearch(searchInput);
  };

  useEffect(() => {
    const initialKw = currentKeyword || 'Review iPhone 17';
    executeSearch(initialKw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickKeyword = (kw: string) => {
    setSearchInput(kw);
    executeSearch(kw);
  };

  const handleAnalyzeVideo = async (video: VideoItem) => {
    setAnalyzingVideoId(video.id);
    setSearchError(null);

    try {
      // 1. Analyze single video (uses processed backend cache if available, or runs comments->process->sentiment)
      const res = await analyzeSingleVideo(video);

      // 2. Incrementally aggregate this video and its comments into AppContext
      aggregateVideoAnalysis(video, res.comments, res.summary);

      // 3. Update the video card in search results with analyzed numbers
      const vidTotal = res.totalComments;
      const vidPos = res.summary.positive || 0;
      const vidNeg = res.summary.negative || 0;
      const vidNeu = res.summary.neutral || 0;
      const posPct = vidTotal > 0 ? Math.round((vidPos / vidTotal) * 100) : 0;
      const negPct = vidTotal > 0 ? Math.round((vidNeg / vidTotal) * 100) : 0;
      const neuPct = vidTotal > 0 ? Math.max(0, 100 - posPct - negPct) : 0;

      setSearchResults((prev) =>
        prev.map((v) =>
          v.id === video.id
            ? {
                ...v,
                commentCount: vidTotal,
                sentimentSummary: {
                  positive: posPct,
                  negative: negPct,
                  neutral: neuPct,
                },
              }
            : v
        )
      );

      setSuccessToast(
        `Sukses! ${vidTotal} komentar dari "${video.title.slice(0, 35)}..." berhasil dianalisis & ditambahkan ke agregasi Overview & Topics.`
      );
      setTimeout(() => setSuccessToast(null), 6000);
    } catch (err: unknown) {
      console.error('[Search] Error in handleAnalyzeVideo:', err);
      let message = 'Gagal melakukan analisis sentimen komentar.';
      if (err instanceof ApiClientError) {
        if (
          err.statusCode === 500 ||
          err.message.toLowerCase().includes('internal server error')
        ) {
          message =
            'Proses inferensi IndoBERT pada CPU membutuhkan waktu di backend. Silakan coba klik kembali beberapa saat lagi.';
        } else {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setSearchError(message);
    } finally {
      setAnalyzingVideoId(null);
    }
  };

  // 1. Date Filter
  let filteredByDate = [...searchResults];
  const now = Date.now();
  if (selectedDateFilter === '24 Jam Terakhir') {
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    filteredByDate = filteredByDate.filter((v) => {
      const ts = Date.parse(v.publishedAt);
      return !isNaN(ts) ? ts >= oneDayAgo : true;
    });
  } else if (selectedDateFilter === 'Minggu Ini') {
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    filteredByDate = filteredByDate.filter((v) => {
      const ts = Date.parse(v.publishedAt);
      return !isNaN(ts) ? ts >= sevenDaysAgo : true;
    });
  } else if (selectedDateFilter === 'Bulan Ini') {
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    filteredByDate = filteredByDate.filter((v) => {
      const ts = Date.parse(v.publishedAt);
      return !isNaN(ts) ? ts >= thirtyDaysAgo : true;
    });
  }

  // 2. Sort videos
  const sortedVideos = filteredByDate.sort((a, b) => {
    if (sortBy === 'views') return b.viewCount - a.viewCount;
    if (sortBy === 'comments') return b.commentCount - a.commentCount;
    if (sortBy === 'newest') {
      const tsA = Date.parse(a.publishedAt) || 0;
      const tsB = Date.parse(b.publishedAt) || 0;
      return tsB - tsA;
    }
    return 0; // default relevance
  });

  // 3. Slice by Count Filter
  const countLimit = parseInt(selectedCountFilter, 10) || 10;
  const displayedVideos = sortedVideos.slice(0, countLimit);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">YouTube Search</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cari video YouTube berdasarkan keyword dan ekstrak komentar publik untuk analisis sentimen
          </p>
        </div>

        {successToast && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}
      </div>

      {/* Error Alert Banner */}
      {searchError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800 flex items-start justify-between gap-3 animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Terjadi Kesalahan</p>
              <p className="text-red-700 mt-0.5 text-xs sm:text-sm leading-relaxed">{searchError}</p>
            </div>
          </div>
          <button
            onClick={() => setSearchError(null)}
            className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-100 transition-colors shrink-0"
            title="Tutup pesan error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  executeSearch(searchInput);
                }
              }}
              placeholder="Masukkan keyword pencarian YouTube (contoh: Review iPhone 17)"
              className="w-full pl-12 pr-4 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all placeholder:text-slate-400"
              disabled={isSearching}
            />
          </div>
          <button
            type="button"
            onClick={() => executeSearch(searchInput)}
            disabled={isSearching || analyzingVideoId !== null}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mencari...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>

        {/* Suggested Keywords */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Contoh Keyword:</span>
          {suggestedKeywords.map((kw) => (
            <button
              key={kw}
              type="button"
              disabled={isSearching}
              onClick={() => handleQuickKeyword(kw)}
              className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all disabled:opacity-50 ${
                (searchedKeyword || currentKeyword).toLowerCase() === kw.toLowerCase()
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Tanggal Publikasi:</span>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Semua Waktu">Semua Waktu</option>
              <option value="24 Jam Terakhir">24 Jam Terakhir</option>
              <option value="Minggu Ini">Minggu Ini</option>
              <option value="Bulan Ini">Bulan Ini</option>
            </select>
          </div>

          {/* Results Count Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Tampilkan:</span>
            <select
              value={selectedCountFilter}
              onChange={(e) => setSelectedCountFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="6">6 Video</option>
              <option value="10">10 Video</option>
              <option value="25">25 Video (Maksimal)</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'relevance' | 'views' | 'comments' | 'newest')}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="relevance">Relevansi</option>
              <option value="views">Paling Banyak Ditonton</option>
              <option value="comments">Komentar Terbanyak</option>
              <option value="newest">Terbaru</option>
            </select>
          </div>
        </div>

        {/* Informative Count / Status Banner */}
        <div className="text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
          {hasSearched ? (
            <>
              Menampilkan <span className="font-bold text-slate-900">{displayedVideos.length}</span> dari{' '}
              <span className="font-bold text-slate-900">{searchResults.length}</span> video hasil pencarian untuk &ldquo;
              <span className="font-semibold text-blue-600">{searchedKeyword}</span>&rdquo;
            </>
          ) : (
            <span>Siap melakukan pencarian video YouTube melalui FastAPI backend</span>
          )}
        </div>
      </div>

      {/* Loading State for Search */}
      {isSearching && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/70 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="font-semibold text-slate-800 text-base">Mencari Video YouTube...</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Sedang menghubungi backend FastAPI untuk mencari video YouTube aktual berdasarkan keyword.
          </p>
        </div>
      )}

      {/* Initial Empty State Before Search */}
      {!hasSearched && !isSearching && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/70 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800 text-base">Mulai Pencarian Video YouTube</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Masukkan keyword pencarian di atas atau pilih salah satu contoh keyword untuk mendapatkan daftar video YouTube aktual dari API.
          </p>
        </div>
      )}

      {/* No Results Found State */}
      {hasSearched && !isSearching && displayedVideos.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/70 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-xs">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800 text-base">Tidak Ada Video Ditemukan</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Tidak ditemukan video untuk kata kunci &ldquo;{searchedKeyword}&rdquo;. Silakan coba dengan kata kunci pencarian yang lain.
          </p>
        </div>
      )}

      {/* Active Aggregation Banner */}
      {analyzedVideos.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {analyzedVideos.length}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {analyzedVideos.length} Video telah dianalisis untuk keyword &ldquo;{currentKeyword}&rdquo;
              </p>
              <p className="text-[11px] text-slate-500">
                Total {formatNumber(comments.length)} komentar berhasil diagregasikan ke Overview & Topic Analysis.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              Lihat di Overview <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/topics"
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
            >
              Topic Analysis <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Video Results List */}
      {!isSearching && displayedVideos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedVideos.map((video) => {
            const isProcessingThis = analyzingVideoId === video.id;
            const hasImageError = imgErrors[video.id];
            const analyzedItem = analyzedVideos.find((v) => v.id === video.id);
            const isAnalyzed = Boolean(analyzedItem);
            const currentVideo = analyzedItem || video;

            return (
              <div
                key={video.id}
                className={`bg-white rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col justify-between group ${
                  isAnalyzed
                    ? 'border-emerald-200/90 shadow-sm ring-1 ring-emerald-500/10'
                    : 'border-slate-200/70 shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  {/* Thumbnail Container with Fallback */}
                  <div className="relative aspect-video w-full bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 overflow-hidden flex items-center justify-center">
                    {!hasImageError ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        loading="lazy"
                        decoding="async"
                        onError={() =>
                          setImgErrors((prev) => ({ ...prev, [video.id]: true }))
                        }
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      /* Fallback High-Quality Placeholder if image fails */
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950">
                        <div className="w-10 h-10 rounded-xl bg-red-600/90 text-white flex items-center justify-center mb-2 shadow-md">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-200 line-clamp-1 max-w-[90%]">
                          {video.channelTitle}
                        </span>
                        <span className="text-[10px] text-slate-400">YouTube Video</span>
                      </div>
                    )}

                    {isAnalyzed && (
                      <span className="absolute top-2.5 left-2.5 bg-emerald-600/95 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-white" /> Teranalisis
                      </span>
                    )}

                    {video.duration && (
                      <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-xs text-white font-mono text-[11px] px-2 py-0.5 rounded-md font-semibold">
                        {video.duration}
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2.5">
                    <h3
                      className="font-semibold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors"
                      title={video.title}
                    >
                      {video.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{video.channelTitle}</span>
                      <span>{formatVideoDate(video.publishedAt)}</span>
                    </div>

                    {/* Metadata Stats */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {video.viewCount > 0
                            ? `${formatCompactNumber(video.viewCount)} views`
                            : 'YouTube Video'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {currentVideo.commentCount > 0
                            ? `${formatNumber(currentVideo.commentCount)} komentar`
                            : 'Komentar publik'}
                        </span>
                      </div>
                    </div>

                    {/* Sentiment Bar Preview */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] mb-1 text-slate-500">
                        <span>Estimasi Sentimen</span>
                        <span className="font-semibold text-slate-700">
                          {currentVideo.sentimentSummary.positive > 0 ||
                          currentVideo.sentimentSummary.negative > 0 ||
                          currentVideo.sentimentSummary.neutral > 0
                            ? `${currentVideo.sentimentSummary.positive}% Positif`
                            : 'Belum dianalisis'}
                        </span>
                      </div>
                      <SentimentBar
                        positive={currentVideo.sentimentSummary.positive}
                        negative={currentVideo.sentimentSummary.negative}
                        neutral={currentVideo.sentimentSummary.neutral}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleAnalyzeVideo(video)}
                    disabled={isProcessingThis || isSearching || analyzingVideoId !== null}
                    className={`w-full py-2.5 font-semibold text-xs rounded-xl border transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                      isAnalyzed
                        ? 'bg-emerald-50/80 hover:bg-emerald-600 hover:text-white text-emerald-800 border-emerald-200 hover:border-transparent'
                        : 'bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 border-slate-200/80 hover:border-transparent group-hover:shadow-sm'
                    }`}
                  >
                    {isProcessingThis ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menganalisis...</span>
                      </>
                    ) : isAnalyzed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                        <span>Teranalisis (Analisis Ulang)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 group-hover:text-white" />
                        <span>Analyze Video Comments</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
