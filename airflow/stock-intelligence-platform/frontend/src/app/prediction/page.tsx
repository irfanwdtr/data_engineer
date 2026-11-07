"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Loader2,
  BrainCircuit,
  Info,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { PredictionResponse, StockOverview } from "@/types";

export default function PredictionPage() {
  const [stocks, setStocks] = useState<StockOverview[]>([]);
  const [selectedTicker, setSelectedTicker] = useState("BBCA.JK");
  const [horizon, setHorizon] = useState("5 Hari (T+5)");
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stocks list
  useEffect(() => {
    api
      .getStocks()
      .then((data) => {
        setStocks(data);
        if (data.length > 0 && !selectedTicker) {
          setSelectedTicker(data[0].ticker);
        }
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat daftar saham.");
      })
      .finally(() => setInitialLoading(false));
  }, []);

  // Fetch prediction function
  const runPrediction = (tickerToPredict: string) => {
    setLoading(true);
    api
      .getPrediction(tickerToPredict)
      .then((pred) => {
        setPrediction(pred);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Gagal memproses prediksi.");
      })
      .finally(() => setLoading(false));
  };

  // Run initial prediction for default ticker
  useEffect(() => {
    if (selectedTicker) {
      runPrediction(selectedTicker);
    }
  }, [selectedTicker]);

  const isUp = prediction?.result === "Naik";
  const prob = prediction?.probability_up ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Prediction
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Prediksi arah pergerakan saham menggunakan Logistic Regression baseline
        </p>
      </div>

      {/* Control Card */}
      <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Stock selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">
              Pilih Saham
            </label>
            <select
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}
              className="w-full bg-[#0D1220] border border-[#1C253D] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {stocks.map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.ticker} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Horizon selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">
              Horizon Prediksi
            </label>
            <select
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
              className="w-full bg-[#0D1220] border border-[#1C253D] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="5 Hari (T+5)">5 Hari (T+5) - Baseline Target</option>
              <option value="1 Hari (T+1)">1 Hari (T+1) - Indikatif</option>
            </select>
          </div>

          {/* Button */}
          <div>
            <button
              onClick={() => runPrediction(selectedTicker)}
              disabled={loading}
              className="w-full bg-[#5B46E8] hover:bg-[#4D39DB] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Jalankan Prediksi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-5 rounded-2xl text-sm">
          {error}
        </div>
      ) : !prediction || initialLoading ? (
        <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-16 flex flex-col items-center justify-center text-slate-400 text-sm">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
          <span>Memuat inferensi model baseline...</span>
        </div>
      ) : (
        <>
          {/* Main Prediction & Features Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Result Card */}
            <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-400">
                    Hasil Prediksi Arah Saham ({prediction.horizon})
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {prediction.prediction_date}
                  </span>
                </div>

                <div className="flex items-center gap-4 my-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                      isUp
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/10"
                        : "bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-rose-500/10"
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="w-8 h-8" />
                    ) : (
                      <TrendingDown className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Sinyal Prediksi</span>
                    <span
                      className={`text-3xl font-extrabold tracking-tight ${
                        isUp ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {prediction.result}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#182138]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Probabilitas Kenaikan</span>
                    <span className="text-lg font-bold text-white font-mono">
                      {prob.toFixed(1).replace(".", ",")}%
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-[#0D1220] rounded-full overflow-hidden border border-[#182138]">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isUp
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                          : "bg-gradient-to-r from-rose-600 to-rose-400"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, prob))}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#161D30] text-[11px] text-slate-400 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>
                  Threshold klasifikasi: 0.50 (probabilitas ≥ 50% diklasifikasikan sebagai Naik).
                </span>
              </div>
            </div>

            {/* Right Features Card */}
            <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">
                Fitur Utama (Terkini) Sebagai Input Model
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#161D30]">
                  <span className="text-slate-400">Daily Return</span>
                  <span className="font-semibold text-white font-mono">
                    {prediction.features.daily_return ?? "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#161D30]">
                  <span className="text-slate-400">RSI (14 Hari)</span>
                  <span className="font-semibold text-white font-mono">
                    {prediction.features.rsi_14 ?? "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#161D30]">
                  <span className="text-slate-400">Volatilitas (20 Hari)</span>
                  <span className="font-semibold text-white font-mono">
                    {prediction.features.volatility_20 ?? "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#161D30]">
                  <span className="text-slate-400">Volume Ratio (20 Hari)</span>
                  <span className="font-semibold text-white font-mono">
                    {prediction.features.volume_ratio_20 ?? "N/A"}x
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#161D30]">
                  <span className="text-slate-400">Price to SMA 5 & SMA 20</span>
                  <span className="font-semibold text-white font-mono">
                    {prediction.features.price_to_sma_5 ?? "0%"} / {prediction.features.price_to_sma_20 ?? "0%"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Momentum (5D & 10D)</span>
                  <span className="font-semibold text-white font-mono">
                    {prediction.features.momentum_5 ?? "0%"} / {prediction.features.momentum_10 ?? "0%"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Baseline Model Metrics Card */}
          {prediction.baseline_metrics && (
            <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">
                  Evaluasi Baseline Logistic Regression (Out-of-Sample Test)
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-[#0D1220] p-3.5 rounded-xl border border-[#182138] text-center">
                  <span className="text-[11px] text-slate-400 block">Accuracy</span>
                  <span className="text-lg font-bold text-white font-mono mt-1 block">
                    {prediction.baseline_metrics.accuracy}%
                  </span>
                </div>
                <div className="bg-[#0D1220] p-3.5 rounded-xl border border-[#182138] text-center">
                  <span className="text-[11px] text-slate-400 block">Precision</span>
                  <span className="text-lg font-bold text-white font-mono mt-1 block">
                    {prediction.baseline_metrics.precision_score}%
                  </span>
                </div>
                <div className="bg-[#0D1220] p-3.5 rounded-xl border border-[#182138] text-center">
                  <span className="text-[11px] text-slate-400 block">Recall</span>
                  <span className="text-lg font-bold text-white font-mono mt-1 block">
                    {prediction.baseline_metrics.recall_score}%
                  </span>
                </div>
                <div className="bg-[#0D1220] p-3.5 rounded-xl border border-[#182138] text-center">
                  <span className="text-[11px] text-slate-400 block">F1-Score</span>
                  <span className="text-lg font-bold text-white font-mono mt-1 block">
                    {prediction.baseline_metrics.f1_score}%
                  </span>
                </div>
                <div className="bg-[#0D1220] p-3.5 rounded-xl border border-[#182138] text-center">
                  <span className="text-[11px] text-slate-400 block">ROC-AUC</span>
                  <span className="text-lg font-bold text-indigo-400 font-mono mt-1 block">
                    {prediction.baseline_metrics.roc_auc}%
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-3">
                Model dilatih menggunakan pipeline scikit-learn Logistic Regression dengan SimpleImputer (median), StandardScaler, dan class_weight='balanced'.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

