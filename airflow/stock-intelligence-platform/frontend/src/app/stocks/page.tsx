"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { StockOverview } from "@/types";
import { SectorFilter } from "@/components/stocks/SectorFilter";
import { StockTable } from "@/components/stocks/StockTable";

export default function StockExplorerPage() {
  const [stocks, setStocks] = useState<StockOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeSector, setActiveSector] = useState("Semua");
  const [sortField, setSortField] = useState<string>("ticker");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setLoading(true);
    api
      .getStocks()
      .then((data) => {
        setStocks(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat daftar saham.");
      })
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      semua: stocks.length,
    };
    for (const s of stocks) {
      const sec = s.sector.toLowerCase();
      c[sec] = (c[sec] || 0) + 1;
    }
    return c;
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks
      .filter((s) => {
        const matchesSearch =
          s.ticker.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase());

        const matchesSector =
          activeSector === "Semua" ||
          s.sector.toLowerCase() === activeSector.toLowerCase();

        return matchesSearch && matchesSector;
      })
      .sort((a, b) => {
        let valA: any = (a as any)[sortField];
        let valB: any = (b as any)[sortField];

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [stocks, search, activeSector, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Stock Explorer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Jelajahi dan bandingkan performa saham
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ticker atau nama perusahaan..."
            className="w-full bg-[#101524] border border-[#1C253D] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Sector Pills */}
      <SectorFilter
        activeSector={activeSector}
        onSelectSector={setActiveSector}
        counts={counts}
      />

      {/* Table Content */}
      {loading ? (
        <div className="bg-[#101524] border border-[#1B233A] rounded-2xl p-16 flex flex-col items-center justify-center text-slate-400 text-sm">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
          <span>Memuat data pasar saham...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl text-sm">
          {error}
        </div>
      ) : (
        <StockTable
          stocks={filteredStocks}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}
    </div>
  );
}

