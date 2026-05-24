from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import recommendation_service

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

class RecommendationResponse(BaseModel):
    experiment_id: str
    title: str
    subject: str
    difficulty: str
    reason: str
    description: str
    priority: int

@router.get("/{user_id}", response_model=List[RecommendationResponse])
def get_user_recommendations(user_id: str):
    """
    Get personalized experiment recommendations for a user based on progress and quiz scores.
    """
    try:
        recommendations = recommendation_service.get_recommendations(user_id)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")
