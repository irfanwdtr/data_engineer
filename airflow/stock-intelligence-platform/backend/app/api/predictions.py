from fastapi import APIRouter, HTTPException
from app.services.prediction_service import PredictionService
from app.schemas.prediction import PredictionResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.get("/{ticker}", response_model=PredictionResponse)
def get_stock_prediction(ticker: str):
    try:
        prediction = PredictionService.predict_stock(ticker)
        return prediction
    except Exception as e:
        logger.exception(f"Error making prediction for {ticker}: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

