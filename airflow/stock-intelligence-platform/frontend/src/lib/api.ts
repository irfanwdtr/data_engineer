import {
  DashboardSummary,
  StockOverview,
  StockDetail,
  StockHistoryPoint,
  TechnicalIndicators,
  PredictionResponse,
  PipelineStatus,
  PipelineRun,
} from "@/types";

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  }
  return process.env.INTERNAL_API_URL || "http://backend:8000/api";
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  getDashboardSummary: (period: string = "5D") =>
    fetchJson<DashboardSummary>(`${getBaseUrl()}/dashboard/summary?period=${period}`),

  getStocks: (params?: {
    search?: string;
    sector?: string;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.sector) searchParams.append("sector", params.sector);
    if (params?.sort_by) searchParams.append("sort_by", params.sort_by);
    if (params?.sort_order) searchParams.append("sort_order", params.sort_order);

    const query = searchParams.toString();
    return fetchJson<StockOverview[]>(`${getBaseUrl()}/stocks${query ? `?${query}` : ""}`);
  },

  getStockDetail: (ticker: string) =>
    fetchJson<StockDetail>(`${getBaseUrl()}/stocks/${encodeURIComponent(ticker)}`),

  getStockHistory: (ticker: string, timeframe: string = "1M") =>
    fetchJson<StockHistoryPoint[]>(
      `${getBaseUrl()}/stocks/${encodeURIComponent(ticker)}/history?timeframe=${timeframe}`
    ),

  getStockFeatures: (ticker: string) =>
    fetchJson<TechnicalIndicators>(
      `${getBaseUrl()}/stocks/${encodeURIComponent(ticker)}/features`
    ),

  getPrediction: (ticker: string) =>
    fetchJson<PredictionResponse>(
      `${getBaseUrl()}/predictions/${encodeURIComponent(ticker)}`
    ),

  getPipelineStatus: () => fetchJson<PipelineStatus>(`${getBaseUrl()}/pipeline/status`),

  getPipelineRuns: (limit: number = 15) =>
    fetchJson<PipelineRun[]>(`${getBaseUrl()}/pipeline/runs?limit=${limit}`),
};

