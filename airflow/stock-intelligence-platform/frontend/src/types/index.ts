export interface StockOverview {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap: string;
  trade_date: string;
}

export interface StockDetail extends StockOverview {
  open: number;
  high: number;
  low: number;
  pe_ratio?: number | null;
  pbv?: number | null;
  description?: string | null;
}

export interface StockHistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi_14?: number | null;
  rsi_status?: string;
  sma_5?: number | null;
  sma_10?: number | null;
  sma_20?: number | null;
  price_vs_sma_5?: string;
  price_vs_sma_20?: string;
  volatility_20?: number | null;
  volume_ratio_20?: number | null;
  momentum_5?: number | null;
  momentum_10?: number | null;
}

export interface MarketIndexPoint {
  date: string;
  index_value: number;
  change_percent: number;
}

export interface TopMoversGroup {
  gainers: StockOverview[];
  losers: StockOverview[];
}

export interface DashboardSummary {
  total_stocks: number;
  avg_return_5d: number;
  rising_stocks: number;
  falling_stocks: number;
  rising_percent: number;
  falling_percent: number;
  market_movement: MarketIndexPoint[];
  top_gainers: StockOverview[];
  top_losers: StockOverview[];
  selected_period?: string;
  top_movers_by_period?: Record<string, TopMoversGroup>;
  latest_update: string;
  pipeline_healthy: boolean;
  pipeline_last_run?: string | null;
}

export interface BaselineMetrics {
  model_name: string;
  accuracy: number;
  precision_score: number;
  recall_score: number;
  f1_score: number;
  roc_auc: number;
  train_end_date?: string | null;
  test_end_date?: string | null;
}

export interface PredictionResponse {
  ticker: string;
  name: string;
  prediction_date: string;
  horizon: string;
  result: "Naik" | "Turun" | "Unavailable";
  probability_up: number;
  is_available: boolean;
  features: Record<string, any>;
  baseline_metrics?: BaselineMetrics | null;
  message?: string | null;
}

export interface PipelineTask {
  task_id: string;
  state: string;
  start_date?: string | null;
  end_date?: string | null;
  duration?: number | null;
}

export interface PipelineRun {
  run_id: string;
  state: string;
  execution_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  duration?: number | null;
}

export interface PipelineStatus {
  is_healthy: boolean;
  status: string;
  last_run_time?: string | null;
  duration?: number | null;
  tasks: PipelineTask[];
  message: string;
  latest_ingestion_date?: string | null;
  feature_engineering_status: string;
  data_quality_status: string;
}

