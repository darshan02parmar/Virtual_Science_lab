from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.sync_service import sync_offline_actions

router = APIRouter(prefix="/api/sync", tags=["sync"])

class SyncActionRequest(BaseModel):
    id: str = Field(..., description="Unique action ID generated on client")
    type: str = Field(..., description="Action type: notes, progress, or quiz")
    payload: Dict[str, Any] = Field(..., description="Payload payload contents")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp of action")

class SyncBatchRequest(BaseModel):
    actions: List[SyncActionRequest]

class SyncResponse(BaseModel):
    notes_synced: int
    progress_synced: int
    quizzes_synced: int
    failed_actions: int
    errors: List[str]

@router.post("", response_model=SyncResponse)
def sync_data(payload: SyncBatchRequest):
    """
    Synchronize a batch of client actions captured while offline.
    Applies timestamp-based LWW logic and chronological attempt execution.
    """
    try:
        actions_dict = [act.dict() for act in payload.actions]
        return sync_offline_actions(actions_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Synchronization failed: {str(e)}")
