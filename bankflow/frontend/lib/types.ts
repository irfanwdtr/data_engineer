export interface KPIMetrics {
  total_transactions: number;
  total_customers: number;
  total_accounts: number;
  total_branches: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  successful_amount: number;
  total_amount: number;
  success_rate: number;
  fail_rate: number;
  pending_rate: number;
}

export interface DailyTrendItem {
  date: string;
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  total_amount: number;
  successful_amount: number;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
  percentage: number;
  total_amount: number;
}

export interface TypeAnalysisItem {
  transaction_type: string;
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  total_amount: number;
  successful_amount: number;
  average_amount: number;
  success_rate: number;
}

export interface ChannelPerformanceItem {
  channel: string;
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  total_amount: number;
  successful_amount: number;
  success_rate: number;
}

export interface BranchPerformanceItem {
  branch_id: string;
  branch_name: string;
  city: string;
  branch_type: string;
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  total_amount: number;
  successful_amount: number;
  success_rate: number;
}

export interface CustomerSegmentItem {
  segment: string;
  total_customers: number;
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  total_amount: number;
  successful_amount: number;
  avg_amount_per_customer: number;
  avg_transactions_per_customer: number;
  success_rate: number;
}

export interface OverviewResponse {
  kpis: KPIMetrics;
  daily_trends: DailyTrendItem[];
  status_distribution: StatusDistributionItem[];
  type_analysis: TypeAnalysisItem[];
  channel_performance: ChannelPerformanceItem[];
  top_branches: BranchPerformanceItem[];
}

export interface PipelineTaskStatus {
  task_id: string;
  task_name: string;
  order: number;
  state: string;
  start_date?: string | null;
  end_date?: string | null;
  duration?: number | null;
}

export interface PipelineRun {
  run_id: string;
  execution_date: string;
  state: string;
  run_type: string;
  start_date?: string | null;
  end_date?: string | null;
  duration?: number | null;
}

export interface PipelineStatusResponse {
  dag_id: string;
  description: string;
  is_paused: boolean;
  status: string;
  last_run_state?: string | null;
  last_execution_date?: string | null;
  last_duration_seconds?: number | null;
  tasks: PipelineTaskStatus[];
  recent_runs: PipelineRun[];
  airflow_url: string;
  source: string;
}

export interface CheckItem {
  check_name: string;
  status: string;
  failed_records: number;
  details: string;
  dataset: string;
  category: string;
}

export interface QualitySummary {
  total_checks: number;
  passed: number;
  failed: number;
  pass_rate: number;
}

export interface DataQualityResponse {
  has_report: boolean;
  generated_at?: string | null;
  overall_status: string;
  summary: QualitySummary;
  checks: CheckItem[];
}

export interface TableInfo {
  table_name: string;
  display_name: string;
  description: string;
  row_count: number;
  columns: string[];
}

export interface TablesListResponse {
  tables: TableInfo[];
}

export interface TableDataResponse {
  table_name: string;
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
  columns: string[];
  rows: Record<string, any>[];
  search?: string | null;
  sort_by?: string | null;
  sort_order: string;
}

