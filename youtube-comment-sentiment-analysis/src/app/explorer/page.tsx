'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Database,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  ExternalLink,
  X,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SentimentBadge } from '@/components/ui/Badge';
import { formatNumber, exportToCSV } from '@/lib/utils';
import { CommentItem, SentimentCategory } from '@/lib/types';

export default function DataExplorerPage() {
  const { currentKeyword, comments, overviewData, videos } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | SentimentCategory>('all');
  const [videoFilter, setVideoFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedComment, setSelectedComment] = useState<CommentItem | null>(null);

  // Filter dataset based on search, sentiment, and video selection (Memoized for high performance)
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return comments.filter((item) => {
      if (sentimentFilter !== 'all' && item.sentiment !== sentimentFilter) {
        return false;
      }
      if (videoFilter !== 'all' && item.videoId !== videoFilter) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        item.comment.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.videoTitle.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    });
  }, [comments, sentimentFilter, videoFilter, searchQuery]);

  // Pagination calculation (Memoized)
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredData.length / rowsPerPage)),
    [filteredData.length, rowsPerPage]
  );
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, startIndex, rowsPerPage]);

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const exportData = filteredData.map((c) => ({
      'Comment ID': c.id,
      'Video ID': c.videoId,
      'Video Title': c.videoTitle,
      'Author': c.author,
      'Comment': c.comment,
      'Published Date': c.publishedDate,
      'Like Count': c.likeCount,
      'Sentiment': c.sentiment,
      'Confidence Score': `${(c.confidenceScore * 100).toFixed(1)}%`,
      'Topic': c.topic || '',
    }));
    exportToCSV(exportData, `youtube_comments_${currentKeyword.replace(/\s+/g, '_')}_filtered_${filteredData.length}_rows`);
  };

  if (comments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Explorer</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Eksplorasi dataset mentah komentar, filter sentimen, dan export data
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/70 shadow-sm max-w-xl mx-auto my-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Database className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Belum Ada Data Tersedia</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Belum ada komentar yang dianalisis untuk keyword &ldquo;{currentKeyword}&rdquo;. Buka halaman YouTube Search lalu klik &ldquo;Analyze Video Comments&rdquo; pada video yang ingin Anda teliti untuk mengisinya ke Data Explorer.
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Explorer</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Eksplorasi dataset mentah komentar, filter sentimen, dan export data untuk pipeline analitik
          </p>
        </div>

        {/* Export CSV Button (Accurately reflecting filtered count) */}
        <button
          onClick={handleExportCSV}
          disabled={filteredData.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-emerald-600/20 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export CSV ({filteredData.length} Baris)</span>
        </button>
      </div>

      {/* Explanatory Data Architecture Notice Banner */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Arsitektur Data:</strong> Total agregat tersimpan di warehouse adalah{' '}
            <strong>{formatNumber(overviewData.totalComments)} komentar</strong> (dari {overviewData.totalVideos} video).
            Tabel di bawah memuat <strong>{comments.length} sampel record terindeks</strong> untuk eksplorasi UI.
          </span>
        </div>
        <div className="font-semibold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shrink-0 self-start sm:self-auto">
          {filteredData.length} record cocok
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari ID, komentar, author..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
          {/* Video Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Video:</span>
            <select
              value={videoFilter}
              onChange={(e) => {
                setVideoFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium outline-none focus:border-blue-500 max-w-[160px] truncate cursor-pointer"
            >
              <option value="all">Semua Video ({videos.length})</option>
              {videos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.channelTitle} - {v.title.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Sentimen:</span>
            <select
              value={sentimentFilter}
              onChange={(e) => {
                setSentimentFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Semua Sentimen</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          {/* Rows Per Page */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Baris:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                <th className="py-3.5 px-4 whitespace-nowrap">Comment ID</th>
                <th className="py-3.5 px-4 min-w-[200px]">Video Title</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Author</th>
                <th className="py-3.5 px-4 min-w-[320px]">Comment</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Published</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Likes</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Sentiment</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedComment(row)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    {/* Comment ID */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] font-semibold">
                      {row.id}
                    </td>

                    {/* Video Title */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 line-clamp-1" title={row.videoTitle}>
                        {row.videoTitle}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700 flex items-center justify-center">
                          {row.author.slice(0, 1)}
                        </div>
                        <span className="font-medium text-slate-800">{row.author}</span>
                      </div>
                    </td>

                    {/* Comment snippet */}
                    <td className="py-3.5 px-4">
                      <p className="text-slate-700 line-clamp-2 leading-relaxed" title={row.comment}>
                        {row.comment}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {row.publishedDate}
                    </td>

                    {/* Like Count */}
                    <td className="py-3.5 px-4 text-center text-slate-700 font-mono font-medium">
                      {row.likeCount}
                    </td>

                    {/* Sentiment */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SentimentBadge sentiment={row.sentiment} />
                    </td>

                    {/* Confidence Score */}
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700">
                      {(row.confidenceScore * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada data komentar yang cocok dengan kriteria filter saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan baris{' '}
            <span className="font-semibold text-slate-800">
              {filteredData.length > 0 ? startIndex + 1 : 0}
            </span>{' '}
            sampai{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(startIndex + rowsPerPage, filteredData.length)}
            </span>{' '}
            dari total <span className="font-semibold text-slate-800">{filteredData.length}</span>{' '}
            record yang difilter
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || filteredData.length === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || filteredData.length === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Comment Detail Modal */}
      {selectedComment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                  {selectedComment.id}
                </span>
                <span className="text-xs text-slate-400">Detail Komentar Terpilih</span>
              </div>
              <button
                onClick={() => setSelectedComment(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Judul Video:</span>
                <p className="font-semibold text-slate-900 text-sm mt-0.5">
                  {selectedComment.videoTitle}
                </p>
              </div>

              <div className="flex items-center justify-between py-2 border-y border-slate-100">
                <div>
                  <span className="text-slate-400">Penulis:</span>
                  <p className="font-semibold text-slate-800">{selectedComment.author}</p>
                </div>
                <div>
                  <span className="text-slate-400">Tanggal:</span>
                  <p className="font-semibold text-slate-800">{selectedComment.publishedDate}</p>
                </div>
                <div>
                  <span className="text-slate-400">Jumlah Likes:</span>
                  <p className="font-semibold text-rose-600 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-600" />
                    {selectedComment.likeCount}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-400">Isi Komentar Lengkap:</span>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-sm leading-relaxed mt-1">
                  &ldquo;{selectedComment.comment}&rdquo;
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400">Prediksi Sentimen:</span>
                  <div className="mt-1">
                    <SentimentBadge sentiment={selectedComment.sentiment} />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400">Tingkat Keyakinan (Score):</span>
                  <div className="text-sm font-bold text-slate-800 font-mono mt-1">
                    {(selectedComment.confidenceScore * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {selectedComment.keywords && selectedComment.keywords.length > 0 && (
                <div>
                  <span className="text-slate-400">Kata Kunci Terdeteksi:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedComment.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedComment(null)}
                className="w-full py-2 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
