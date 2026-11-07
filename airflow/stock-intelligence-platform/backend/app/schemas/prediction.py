from pydantic import BaseModel
from typing import Optional, Dict, Any


class BaselineMetrics(BaseModel):
    model_name: str
    accuracy: float
    precision_score: float
    recall_score: float
    f1_score: float
    roc_auc: float
    train_end_date: Optional[str] = None
    test_end_date: Optional[str] = None


class PredictionResponse(BaseModel):
    ticker: str
    name: str
    prediction_date: str
    horizon: str
    result: str  # "Naik" or "Turun"
    probability_up: float  # e.g. 72.6
    is_available: bool
    features: Dict[str, Any]
    baseline_metrics: Optional[BaselineMetrics] = None
    message: Optional[str] = None

