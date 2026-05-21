from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services import progress_service

progress_service.init_db()

router = APIRouter(prefix="/api/progress", tags=["progress"])


class ExperimentProgressRequest(BaseModel):
    user_id: str = Field(default="default-student")
    experiment_id: str
    subject: str
    title: str
    completed: bool = True
    score: Optional[int] = Field(default=None, ge=0)


class ExperimentProgressRecord(BaseModel):
    user_id: str
    experiment_id: str
    subject: str
    title: str
    completed: bool
    completion_date: Optional[str] = None
    score: Optional[int] = None


@router.get("/{user_id}", response_model=List[ExperimentProgressRecord])
def get_progress(user_id: str):
    try:
        return progress_service.get_user_experiment_progress(user_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Progress load error: {str(exc)}")


@router.post("/complete", response_model=List[ExperimentProgressRecord])
def save_progress(payload: ExperimentProgressRequest):
    try:
        return progress_service.upsert_experiment_progress(
            user_id=payload.user_id,
            experiment_id=payload.experiment_id,
            subject=payload.subject.lower(),
            title=payload.title,
            completed=payload.completed,
            score=payload.score,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Progress save error: {str(exc)}")
