'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm max-w-md w-full space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-lg font-bold text-slate-900">Terjadi Kendala pada Halaman</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          {error.message || 'Halaman mengalami kesalahan saat memuat komponen.'}
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
        >
          Coba Muat Ulang
        </button>
      </div>
    </div>
  );
}

