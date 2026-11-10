'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-900">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Terjadi Kesalahan Sistem</h2>
          <p className="text-sm text-slate-500">{error?.message || 'Gagal memuat aplikasi.'}</p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}

