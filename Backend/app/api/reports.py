from typing import List

from fastapi import APIRouter, HTTPException, Response

from app.models.schemas import (
    LabReportGenerateRequest,
    LabReportResponse,
    LabReportUpdateRequest,
)
from app.services import reports_service

reports_service.init_db()

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("/generate", response_model=LabReportResponse)
def generate_report(payload: LabReportGenerateRequest):
    try:
        return reports_service.create_report(payload.user_id, payload.experiment_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(exc)}")


@router.get("/{user_id}", response_model=List[LabReportResponse])
def get_reports(user_id: str):
    try:
        return reports_service.get_reports(user_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Report history load error: {str(exc)}")


@router.get("/{user_id}/{report_id}", response_model=LabReportResponse)
def get_report(user_id: str, report_id: int):
    report = reports_service.get_report(user_id, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post("/{report_id}/update", response_model=LabReportResponse)
def update_report(report_id: int, payload: LabReportUpdateRequest):
    report = reports_service.update_report(report_id, payload.dict())
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/{user_id}/{report_id}/export/md")
def export_markdown(user_id: str, report_id: int):
    markdown = reports_service.export_markdown(user_id, report_id)
    if markdown is None:
        raise HTTPException(status_code=404, detail="Report not found")

    return Response(
        content=markdown,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="lab-report-{report_id}.md"'},
    )
