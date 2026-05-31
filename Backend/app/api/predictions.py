from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import PredictionResponse
from app.services import prediction_service

router = APIRouter(prefix="/api/predictions", tags=["predictions"])

@router.get("/{user_id}", response_model=List[PredictionResponse])
def get_all_predictions(user_id: str):
    try:
        return prediction_service.get_all_predictions(user_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.get("/{user_id}/{experiment_id}", response_model=PredictionResponse)
def get_prediction(user_id: str, experiment_id: str):
    try:
        return prediction_service.generate_prediction(user_id, experiment_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
