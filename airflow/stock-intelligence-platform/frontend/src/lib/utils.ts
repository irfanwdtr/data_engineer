import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatNumber(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return "0";
  return new Intl.NumberFormat("id-ID").format(val);
}

export function formatPercent(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return "0.00%";
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(2).replace(".", ",")}%`;
}

export function formatVolume(val?: number | null): string {
  if (!val || isNaN(val)) return "0";
  if (val >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toFixed(1)}B`;
  }
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1)}M`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(1)}K`;
  }
  return val.toString();
}

