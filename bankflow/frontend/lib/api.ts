import {
  OverviewResponse,
  KPIMetrics,
  DailyTrendItem,
  StatusDistributionItem,
  TypeAnalysisItem,
  ChannelPerformanceItem,
  BranchPerformanceItem,
  CustomerSegmentItem,
  PipelineStatusResponse,
  PipelineRun,
  DataQualityResponse,
  CheckItem,
  TablesListResponse,
  TableDataResponse,
} from "./types";

const getApiBase = () => {
  if (typeof window !== "undefined") {
    // In client browser, use relative path which hits Next.js rewrites or proxy
    return "";
  }
  // Server-side inside node
  return process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `API error: ${res.status} ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) errorMsg = errJson.detail;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function fetchOverview(startDate?: string, endDate?: string): Promise<OverviewResponse> {
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  const q = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${getApiBase()}/api/overview${q}`, { cache: "no-store" });
  return handleResponse<OverviewResponse>(res);
}

export async function fetchKPIs(): Promise<KPIMetrics> {
  const res = await fetch(`${getApiBase()}/api/overview/kpis`, { cache: "no-store" });
  return handleResponse<KPIMetrics>(res);
}

export async function fetchDailyTransactions(startDate?: string, endDate?: string, limit?: number) {
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  if (limit) params.append("limit", limit.toString());
  const q = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${getApiBase()}/api/analytics/daily-transactions${q}`, { cache: "no-store" });
  return handleResponse<{ total_records: number; start_date?: string; end_date?: string; items: DailyTrendItem[] }>(res);
}

export async function fetchTransactionStatus(): Promise<StatusDistributionItem[]> {
  const res = await fetch(`${getApiBase()}/api/analytics/transaction-status`, { cache: "no-store" });
  return handleResponse<StatusDistributionItem[]>(res);
}

export async function fetchTransactionTypes(): Promise<TypeAnalysisItem[]> {
  const res = await fetch(`${getApiBase()}/api/analytics/transaction-types`, { cache: "no-store" });
  return handleResponse<TypeAnalysisItem[]>(res);
}

export async function fetchChannels(): Promise<ChannelPerformanceItem[]> {
  const res = await fetch(`${getApiBase()}/api/analytics/channels`, { cache: "no-store" });
  return handleResponse<ChannelPerformanceItem[]>(res);
}

export async function fetchBranches(limit = 20): Promise<BranchPerformanceItem[]> {
  const res = await fetch(`${getApiBase()}/api/analytics/branches?limit=${limit}`, { cache: "no-store" });
  return handleResponse<BranchPerformanceItem[]>(res);
}

export async function fetchCustomerSegments(): Promise<CustomerSegmentItem[]> {
  const res = await fetch(`${getApiBase()}/api/analytics/customer-segments`, { cache: "no-store" });
  return handleResponse<CustomerSegmentItem[]>(res);
}

export async function fetchPipelineStatus(): Promise<PipelineStatusResponse> {
  const res = await fetch(`${getApiBase()}/api/pipeline/status`, { cache: "no-store" });
  return handleResponse<PipelineStatusResponse>(res);
}

export async function fetchPipelineRuns(): Promise<PipelineRun[]> {
  const res = await fetch(`${getApiBase()}/api/pipeline/runs`, { cache: "no-store" });
  return handleResponse<PipelineRun[]>(res);
}

export async function fetchQualitySummary(): Promise<DataQualityResponse> {
  const res = await fetch(`${getApiBase()}/api/data-quality/summary`, { cache: "no-store" });
  return handleResponse<DataQualityResponse>(res);
}

export async function fetchQualityChecks(): Promise<CheckItem[]> {
  const res = await fetch(`${getApiBase()}/api/data-quality/checks`, { cache: "no-store" });
  return handleResponse<CheckItem[]>(res);
}

export async function fetchTables(): Promise<TablesListResponse> {
  const res = await fetch(`${getApiBase()}/api/data-explorer/tables`, { cache: "no-store" });
  return handleResponse<TablesListResponse>(res);
}

export async function fetchTableData(
  tableName: string,
  page = 1,
  limit = 20,
  search = "",
  sortBy = "",
  sortOrder = "asc"
): Promise<TableDataResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort_order: sortOrder,
  });
  if (search) params.append("search", search);
  if (sortBy) params.append("sort_by", sortBy);

  const res = await fetch(`${getApiBase()}/api/data-explorer/${tableName}?${params.toString()}`, { cache: "no-store" });
  return handleResponse<TableDataResponse>(res);
}

// Utility Formatters
export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined) return "0";
  return new Intl.NumberFormat("en-US").format(val);
}

export function formatIDR(val: number | null | undefined): string {
  if (val === null || val === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatCompactIDR(val: number | null | undefined): string {
  if (val === null || val === undefined) return "Rp 0";
  if (val >= 1_000_000_000_000) {
    return `Rp ${(val / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (val >= 1_000_000_000) {
    return `Rp ${(val / 1_000_000_000).toFixed(2)}B`;
  }
  if (val >= 1_000_000) {
    return `Rp ${(val / 1_000_000).toFixed(1)}M`;
  }
  if (val >= 1_000) {
    return `Rp ${(val / 1_000).toFixed(0)}K`;
  }
  return `Rp ${val.toFixed(0)}`;
}

export function formatPercent(val: number | null | undefined): string {
  if (val === null || val === undefined) return "0.0%";
  return `${val.toFixed(2)}%`;
}

export function formatDate(val: string | null | undefined): string {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return val;
  }
}

