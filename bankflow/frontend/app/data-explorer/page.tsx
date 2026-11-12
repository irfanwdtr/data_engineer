"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import {
  fetchTables,
  fetchTableData,
  formatNumber,
  formatIDR,
} from "@/lib/api";
import { TablesListResponse, TableDataResponse, TableInfo } from "@/lib/types";
import {
  Database,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Table as TableIcon,
  Download,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function DataExplorerPage() {
  const [tablesList, setTablesList] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("gold_transaction_summary");
  const [data, setData] = useState<TableDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & filter state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Load available tables
  useEffect(() => {
    async function init() {
      try {
        const res = await fetchTables();
        setTablesList(res.tables);
        if (res.tables.length > 0) {
          setSelectedTable(res.tables[0].table_name);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load tables list");
      }
    }
    init();
  }, []);

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load table data
  const loadTableData = async (
    tbl = selectedTable,
    p = page,
    lim = limit,
    s = debouncedSearch,
    sb = sortBy,
    so = sortOrder
  ) => {
    if (!tbl) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchTableData(tbl, p, lim, s, sb, so);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load table records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable, page, limit, debouncedSearch, sortBy, sortOrder);
    }
  }, [selectedTable, page, limit, debouncedSearch, sortBy, sortOrder]);

  const handleTableChange = (tbl: string) => {
    setSelectedTable(tbl);
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
    setSortBy("");
    setSortOrder("asc");
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const currentTableMeta = tablesList.find((t) => t.table_name === selectedTable);

  const formatCellValue = (colName: string, val: any) => {
    if (val === null || val === undefined) return <span className="text-slate-600">-</span>;
    if (typeof val === "number") {
      if (colName.includes("amount") || colName.includes("balance")) {
        return <span className="font-mono text-cyan-400">{formatIDR(val)}</span>;
      }
      return <span className="font-mono text-slate-200">{formatNumber(val)}</span>;
    }
    if (colName === "status" || colName === "account_status") {
      const isSuccess = val === "SUCCESS" || val === "ACTIVE";
      const isFailed = val === "FAILED" || val === "INACTIVE";
      return (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            isSuccess
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              : isFailed
              ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
          }`}
        >
          {val}
        </span>
      );
    }
    if (colName === "customer_segment") {
      const isPriority = val === "PRIORITY";
      const isPremium = val === "PREMIUM";
      return (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
            isPriority
              ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
              : isPremium
              ? "bg-blue-500/10 text-cyan-400 border border-blue-500/30"
              : "bg-navy-800 text-slate-300 border border-navy-700"
          }`}
        >
          {val}
        </span>
      );
    }
    return <span>{String(val)}</span>;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <Header
        title="PostgreSQL Data Warehouse Explorer"
        subtitle="Server-side browsing, filtering, and inspection of business Gold tables"
        onRefresh={() =>
          loadTableData(selectedTable, page, limit, debouncedSearch, sortBy, sortOrder)
        }
        isRefreshing={loading}
      />

      <main className="p-8 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Table Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {tablesList.map((tbl) => {
            const isSelected = tbl.table_name === selectedTable;
            return (
              <button
                key={tbl.table_name}
                onClick={() => handleTableChange(tbl.table_name)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 border border-blue-500"
                    : "bg-navy-900 text-slate-400 hover:text-slate-200 hover:bg-navy-850 border border-navy-800"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>{tbl.display_name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-blue-700 text-white" : "bg-navy-800 text-slate-500"
                  }`}
                >
                  {formatNumber(tbl.row_count)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Table Overview Header */}
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-mono">{selectedTable}</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                Gold Schema
              </span>
            </div>
            <p className="text-xs text-slate-400">{currentTableMeta?.description}</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500">Columns: </span>
              <strong className="text-slate-200">{currentTableMeta?.columns.length || 0}</strong>
            </div>
            <div>
              <span className="text-slate-500">Total Rows: </span>
              <strong className="text-cyan-400">
                {formatNumber(data?.total_records ?? currentTableMeta?.row_count ?? 0)}
              </strong>
            </div>
          </div>
        </div>

        {/* Search & Controls */}
        <div className="bg-navy-900/90 rounded-xl p-4 border border-navy-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={`Search across ${selectedTable} text fields...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-navy-950 border border-navy-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 text-xs font-mono"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-navy-900/90 rounded-xl border border-navy-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto min-h-[350px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <span className="text-xs">Querying PostgreSQL Data Warehouse...</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-navy-850 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-navy-800 select-none">
                  <tr>
                    {(data?.columns || []).map((col) => {
                      const isSorted = sortBy === col;
                      return (
                        <th
                          key={col}
                          onClick={() => handleSort(col)}
                          className="px-4 py-3 cursor-pointer hover:text-white transition group whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{col.replace(/_/g, " ")}</span>
                            {isSorted ? (
                              sortOrder === "asc" ? (
                                <ArrowUp className="w-3 h-3 text-cyan-400" />
                              ) : (
                                <ArrowDown className="w-3 h-3 text-cyan-400" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 font-sans text-xs">
                  {(data?.rows || []).map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-navy-850/50 transition">
                      {(data?.columns || []).map((col) => (
                        <td key={col} className="px-4 py-2.5 whitespace-nowrap">
                          {formatCellValue(col, row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {(!data?.rows || data.rows.length === 0) && (
                    <tr>
                      <td
                        colSpan={data?.columns.length || 1}
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        No records found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-navy-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              Showing{" "}
              <strong className="text-slate-200">
                {data?.total_records ? (page - 1) * limit + 1 : 0}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-200">
                {Math.min(page * limit, data?.total_records || 0)}
              </strong>{" "}
              of <strong className="text-cyan-400">{formatNumber(data?.total_records || 0)}</strong>{" "}
              records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-navy-700 flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <span className="font-mono text-slate-300 px-2">
                Page {page} of {data?.total_pages || 1}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(data?.total_pages || 1, p + 1))}
                disabled={page >= (data?.total_pages || 1) || loading}
                className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed border border-navy-700 flex items-center gap-1 transition"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

