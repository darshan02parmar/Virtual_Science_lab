from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from app.services.sync_service import process_single_sync_action

router = APIRouter(prefix="/api/sync", tags=["sync"])

class SyncActionRequest(BaseModel):
    action: str = Field(..., description="Action type: notes, progress, quiz")
    version: int = Field(..., description="Local version track number")
    data: Dict[str, Any] = Field(..., description="Actual data payload attributes")

@router.post("")
def sync_data(
    request: SyncActionRequest,
    x_idempotency_key: Optional[str] = Header(None)
):
    """
    Endpoint mapping client side single requests to isolated processing contexts.
    """
    if not x_idempotency_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required validation header: 'X-Idempotency-Key'"
        )

    result = process_single_sync_action(
        idempotency_key=x_idempotency_key,
        action_type=request.action,
        version=request.version,
        payload=request.data
    )

    if result["status"] == "conflict":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=result["detail"])
    elif result["status"] == "error":
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result["detail"])

    return {
        "notes_synced": 1 if result["action_applied"] == "notes" else 0,
        "progress_synced": 1 if result["action_applied"] == "progress" else 0,
        "quizzes_synced": 1 if result["action_applied"] == "quiz" else 0,
        "failed_actions": 0
    }