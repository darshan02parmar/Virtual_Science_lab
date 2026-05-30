from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import NotebookEntryUpsertRequest, NotebookEntryResponse, NotebookVersionResponse
from app.services import notebook_service

router = APIRouter(prefix="/api/notebook", tags=["notebook"])

@router.get("/{user_id}", response_model=List[NotebookEntryResponse])
def get_all_notebook_entries(user_id: str):
    try:
        return notebook_service.get_notebook_entries(user_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.get("/{user_id}/{experiment_id}", response_model=NotebookEntryResponse)
def get_notebook_entry(user_id: str, experiment_id: str):
    try:
        entry = notebook_service.get_notebook_entry(user_id, experiment_id)
        if not entry:
            # Return empty skeleton so frontend doesn't crash
            return NotebookEntryResponse(
                user_id=user_id,
                experiment_id=experiment_id,
                subject="",
                title="",
                version=1,
                created_at="",
                updated_at="",
                tags=[]
            )
        return entry
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.get("/{user_id}/{experiment_id}/versions", response_model=List[NotebookVersionResponse])
def get_notebook_versions(user_id: str, experiment_id: str):
    try:
        return notebook_service.get_notebook_versions(user_id, experiment_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.post("/upsert", response_model=NotebookEntryResponse)
def upsert_notebook_entry(payload: NotebookEntryUpsertRequest):
    try:
        return notebook_service.upsert_notebook_entry(
            user_id=payload.user_id,
            experiment_id=payload.experiment_id,
            subject=payload.subject,
            title=payload.title,
            objective=payload.objective,
            procedure_summary=payload.procedure_summary,
            observations=payload.observations,
            results=payload.results,
            conclusions=payload.conclusions,
            reflection=payload.reflection,
            tags=payload.tags,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
