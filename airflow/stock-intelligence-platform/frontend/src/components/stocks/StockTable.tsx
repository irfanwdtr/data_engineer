import Link from "next/link";
import { StockOverview } from "@/types";
import { formatNumber, formatPercent, formatVolume } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";

interface StockTableProps {
  stocks: StockOverview[];
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
}

export function StockTable({
  stocks,
  sortField,
  sortOrder,
  onSort,
}: StockTableProps) {
  return (
    <div className="bg-[#101524] border border-[#1B233A] rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-[#1B233A] bg-[#0E1320] text-xs font-medium">
              <th
                onClick={() => onSort?.("ticker")}
                className="py-3.5 px-5 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Ticker</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3.5 px-5">Nama Perusahaan</th>
              <th
                onClick={() => onSort?.("price")}
                className="py-3.5 px-5 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Harga</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => onSort?.("change_percent")}
                className="py-3.5 px-5 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Perubahan (%)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => onSort?.("volume")}
                className="py-3.5 px-5 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Volume</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3.5 px-5 text-right">Market Cap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#161D30]">
            {stocks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                  Tidak ada saham yang sesuai dengan pencarian atau filter.
                </td>
              </tr>
            ) : (
              stocks.map((stock) => {
                const isPositive = stock.change_percent >= 0;
                return (
                  <tr
                    key={stock.ticker}
                    className="hover:bg-[#151C2F] transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-5 font-bold text-white group-hover:text-indigo-400 transition-colors">
                      <Link href={`/stocks/${stock.ticker}`} className="block">
                        {stock.ticker}
                      </Link>
                    </td>
                    <td className="py-4 px-5 text-slate-300 font-medium">
                      <Link href={`/stocks/${stock.ticker}`} className="block">
                        {stock.name}
                      </Link>
                    </td>
                    <td className="py-4 px-5 text-right font-semibold text-slate-100">
                      {formatNumber(stock.price)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md font-semibold text-xs ${
                          isPositive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {formatPercent(stock.change_percent)}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right text-slate-300 font-mono text-xs">
                      {formatVolume(stock.volume)}
                    </td>
                    <td className="py-4 px-5 text-right text-slate-300 font-mono text-xs font-semibold">
                      {stock.market_cap}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

