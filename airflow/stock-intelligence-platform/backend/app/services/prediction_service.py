import os
import joblib
import pandas as pd
import numpy as np
import logging
from typing import Optional, Dict, Any
from app.repositories.stock_repository import StockRepository
from app.core.constants import TICKER_METADATA
from app.schemas.prediction import PredictionResponse, BaselineMetrics

logger = logging.getLogger(__name__)

FEATURE_COLUMNS = [
    "daily_return",
    "price_to_sma_5",
    "price_to_sma_10",
    "price_to_sma_20",
    "momentum_5",
    "momentum_10",
    "rsi_14",
    "volatility_20",
    "volume_ratio_20",
]

THRESHOLD = 0.50


class PredictionService:
    _model = None

    @classmethod
    def _load_or_init_model(cls):
        if cls._model is not None:
            return cls._model

        # Potential paths for saved model
        candidate_paths = [
            "/app/src/ml/models/logistic_regression_baseline.joblib",
            "src/ml/models/logistic_regression_baseline.joblib",
            os.path.join(os.path.dirname(__file__), "../../../src/ml/models/logistic_regression_baseline.joblib"),
        ]

        for path in candidate_paths:
            if os.path.exists(path):
                try:
                    cls._model = joblib.load(path)
                    logger.info(f"Loaded existing Logistic Regression baseline from {path}")
                    return cls._model
                except Exception as e:
                    logger.warning(f"Failed to load model from {path}: {e}")

        # If model file is not present, load and train using baseline logic
        try:
            from src.ml.train_model import load_dataset, split_dataset, build_model
            logger.info("Baseline model artifact not found on disk. Initializing and fitting baseline model...")
            df = load_dataset()
            if not df.empty:
                X_train, X_test, y_train, y_test, _, _ = split_dataset(df)
                model = build_model()
                model.fit(X_train, y_train)
                cls._model = model
                return cls._model
        except Exception as e:
            logger.error(f"Could not initialize Logistic Regression baseline: {e}")

        return None

    @classmethod
    def predict_stock(cls, ticker: str) -> PredictionResponse:
        ticker = ticker.upper()
        meta = TICKER_METADATA.get(ticker, {"name": ticker})
        company_name = meta.get("name", ticker)

        # Get latest features from PostgreSQL
        feat_row = StockRepository.get_latest_features(ticker)
        if not feat_row:
            return PredictionResponse(
                ticker=ticker,
                name=company_name,
                prediction_date="N/A",
                horizon="5 Hari (T+5)",
                result="Unavailable",
                probability_up=0.0,
                is_available=False,
                features={},
                message="Data fitur teknikal belum tersedia untuk ticker ini."
            )

        model = cls._load_or_init_model()
        if model is None:
            return PredictionResponse(
                ticker=ticker,
                name=company_name,
                prediction_date=str(feat_row["trade_date"]),
                horizon="5 Hari (T+5)",
                result="Unavailable",
                probability_up=0.0,
                is_available=False,
                features={},
                message="Model baseline Logistic Regression belum tersedia."
            )

        # Construct input DataFrame with exact columns
        feature_dict = {
            col: (float(feat_row[col]) if feat_row.get(col) is not None else np.nan)
            for col in FEATURE_COLUMNS
        }
        input_df = pd.DataFrame([feature_dict])

        try:
            # Predict probability of class 1 (upward movement)
            prob_up = float(model.predict_proba(input_df)[0][1])
            is_up = prob_up >= THRESHOLD
            result_label = "Naik" if is_up else "Turun"
            prob_percent = round(prob_up * 100, 1)

            # Get latest evaluation metrics
            eval_metrics = None
            raw_eval = StockRepository.get_latest_model_evaluation()
            if raw_eval:
                eval_metrics = BaselineMetrics(
                    model_name=raw_eval.get("model_name", "logistic_regression_baseline"),
                    accuracy=round(float(raw_eval.get("accuracy") or 0) * 100, 2),
                    precision_score=round(float(raw_eval.get("precision_score") or 0) * 100, 2),
                    recall_score=round(float(raw_eval.get("recall_score") or 0) * 100, 2),
                    f1_score=round(float(raw_eval.get("f1_score") or 0) * 100, 2),
                    roc_auc=round(float(raw_eval.get("roc_auc") or 0) * 100, 2),
                    train_end_date=str(raw_eval.get("train_end_date")),
                    test_end_date=str(raw_eval.get("test_end_date"))
                )

            # Clean features for display
            clean_features = {
                "daily_return": f"{float(feat_row.get('daily_return') or 0)*100:+.2f}%",
                "rsi_14": round(float(feat_row.get("rsi_14") or 0), 1),
                "volatility_20": f"{float(feat_row.get('volatility_20') or 0)*100:.2f}%",
                "volume_ratio_20": round(float(feat_row.get("volume_ratio_20") or 0), 2),
                "price_to_sma_5": f"{float(feat_row.get('price_to_sma_5') or 0)*100:+.2f}%",
                "price_to_sma_20": f"{float(feat_row.get('price_to_sma_20') or 0)*100:+.2f}%",
                "momentum_5": f"{float(feat_row.get('momentum_5') or 0)*100:+.2f}%",
                "momentum_10": f"{float(feat_row.get('momentum_10') or 0)*100:+.2f}%",
                "sma_5": float(feat_row.get("sma_5") or 0),
                "sma_20": float(feat_row.get("sma_20") or 0),
            }

            return PredictionResponse(
                ticker=ticker,
                name=company_name,
                prediction_date=str(feat_row["trade_date"]),
                horizon="5 Hari (T+5)",
                result=result_label,
                probability_up=prob_percent,
                is_available=True,
                features=clean_features,
                baseline_metrics=eval_metrics,
                message="Prediksi berhasil dihitung menggunakan Logistic Regression baseline."
            )

        except Exception as e:
            logger.exception(f"Inference failed for {ticker}: {e}")
            return PredictionResponse(
                ticker=ticker,
                name=company_name,
                prediction_date=str(feat_row["trade_date"]),
                horizon="5 Hari (T+5)",
                result="Unavailable",
                probability_up=0.0,
                is_available=False,
                features={},
                message=f"Inferensi gagal: {str(e)}"
            )

