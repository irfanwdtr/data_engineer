'use client';

import React from 'react';
import {
  CheckCircle2,
  Loader2,
  Server,
  Cpu,
  Database,
  Search,
  Sparkles,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function PipelineVisualizerModal() {
  const { pipelineModalOpen, setPipelineModalOpen, pipelineStep, currentKeyword } = useApp();

  if (!pipelineModalOpen) return null;

  const steps = [
    {
      num: 1,
      title: 'YouTube Ingestion & Comment Extraction',
      desc: `Mengambil komentar publik dari video terkait "${currentKeyword}"...`,
      stat: '2,450 komentar mentah diekstrak',
      icon: Search,
    },
    {
      num: 2,
      title: 'Indonesian Text Preprocessing',
      desc: 'Tokenisasi, slang normalization (bahasa gaul), filter spam, & pembersihan karakter...',
      stat: 'Pembersihan teks 100% selesai',
      icon: Layers,
    },
    {
      num: 3,
      title: 'IndoBERT NLP Sentiment Inference',
      desc: 'Batch transformer evaluation untuk Positive, Negative, dan Neutral classification...',
      stat: 'Akurasi model 94.2% (Confidence 0.91)',
      icon: Cpu,
    },
    {
      num: 4,
      title: 'TF-IDF & Topic Modeling',
      desc: 'Pengelompokan klaster topik pembicaraan dan identifikasi customer pain points...',
      stat: '10 klaster topik & 5 pain points terdeteksi',
      icon: Sparkles,
    },
    {
      num: 5,
      title: 'Analytical Data Warehouse Ready',
      desc: 'Sinkronisasi hasil agregasi ke schema database PostgreSQL & OLAP table...',
      stat: 'Data siap dieksplorasi di Dashboard',
      icon: Database,
    },
  ];

  const isCompleted = pipelineStep >= 5;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Data Engineering ETL Pipeline
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Pipeline Analisis Komentar: &ldquo;{currentKeyword}&rdquo;
            </h2>
          </div>
          {isCompleted && (
            <button
              onClick={() => setPipelineModalOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Pipeline Step List */}
        <div className="space-y-3.5">
          {steps.map((st) => {
            const isDone = pipelineStep > st.num || (pipelineStep === 5 && st.num === 5);
            const isCurrent = pipelineStep === st.num;
            const isPending = pipelineStep < st.num;
            const Icon = st.icon;

            return (
              <div
                key={st.num}
                className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${
                  isCurrent
                    ? 'bg-blue-50/60 border-blue-200 ring-2 ring-blue-100 shadow-sm'
                    : isDone
                    ? 'bg-slate-50/60 border-slate-200/80 opacity-90'
                    : 'bg-white border-slate-100 opacity-40'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>{st.num}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-xs text-slate-900">{st.title}</h3>
                    {isDone && (
                      <span className="text-[10px] font-semibold text-emerald-600">SELESAI</span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] font-semibold text-blue-600 animate-pulse">
                        MEMPROSES...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{st.desc}</p>
                  {(isDone || isCurrent) && (
                    <p className="text-[11px] font-mono font-medium text-slate-700 mt-1">
                      → {st.stat}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <span className="text-xs text-slate-400">
            {isCompleted ? 'Pipeline tereksekusi dengan sukses!' : 'Mohon tunggu proses selesai...'}
          </span>
          {isCompleted ? (
            <button
              onClick={() => setPipelineModalOpen(false)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <span>Lihat Hasil di Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Pipeline aktif</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
