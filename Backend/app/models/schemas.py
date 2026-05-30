from typing import Optional

from pydantic import BaseModel


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    answer: str


class ExperimentNotesUpsertRequest(BaseModel):
    user_id: str
    experiment_id: str
    observations: Optional[str] = None
    conclusions: Optional[str] = None
    learnings: Optional[str] = None
    notes: Optional[str] = None


class ExperimentNotesResponse(BaseModel):
    user_id: str
    experiment_id: str
    observations: Optional[str] = None
    conclusions: Optional[str] = None
    learnings: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class LabReportGenerateRequest(BaseModel):
    user_id: str = "default-student"
    experiment_id: str


class LabReportUpdateRequest(BaseModel):
    title: Optional[str] = None
    objective: Optional[str] = None
    procedure: Optional[str] = None
    observations: Optional[str] = None
    results: Optional[str] = None
    conclusions: Optional[str] = None
    quiz_performance: Optional[str] = None
    status: Optional[str] = "draft"


class LabReportResponse(BaseModel):
    id: int
    user_id: str
    experiment_id: str
    title: str
    subject: str
    objective: str
    procedure: str
    observations: str
    results: str
    conclusions: str
    quiz_performance: str
    status: str
    generated_at: str
    updated_at: str

class ExperimentHistoryRecord(BaseModel):
    user_id: str
    experiment_name: str
    subject: str
    score: int
    timestamp: str  # ISO Format

from typing import List

class NotebookEntryUpsertRequest(BaseModel):
    user_id: str
    experiment_id: str
    subject: str
    title: str
    objective: Optional[str] = None
    procedure_summary: Optional[str] = None
    observations: Optional[str] = None
    results: Optional[str] = None
    conclusions: Optional[str] = None
    reflection: Optional[str] = None
    tags: Optional[List[str]] = None

class NotebookEntryResponse(BaseModel):
    user_id: str
    experiment_id: str
    subject: str
    title: str
    objective: Optional[str] = None
    procedure_summary: Optional[str] = None
    observations: Optional[str] = None
    results: Optional[str] = None
    conclusions: Optional[str] = None
    reflection: Optional[str] = None
    tags: List[str] = []
    version: int
    created_at: str
    updated_at: str

class NotebookVersionResponse(BaseModel):
    version: int
    updated_at: str
    objective: Optional[str] = None
    procedure_summary: Optional[str] = None
    observations: Optional[str] = None
    results: Optional[str] = None
    conclusions: Optional[str] = None
    reflection: Optional[str] = None
    tags: List[str] = []