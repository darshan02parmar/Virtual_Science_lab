import bleach
from typing import Optional, List, Any, Annotated
from pydantic import BaseModel, Field, BeforeValidator

# -------------------------------------------------------------------------
# 🔒 HIGH-PERFORMANCE SECURITY VALIDATION ENGINE
# -------------------------------------------------------------------------

def global_nosql_guard(v: Any) -> Any:
    """
    Recursively scans incoming input structures. If any key matches a MongoDB 
    operator structure (starts with '$'), it triggers a ValueError to immediately 
    surface a clean HTTP 422 Unprocessable Entity error.
    """
    if isinstance(v, dict):
        for k, val in v.items():
            if isinstance(k, str) and k.startswith("$"):
                raise ValueError(f"Malicious NoSQL Operator structure prohibited: '{k}'")
            global_nosql_guard(val)
    elif isinstance(v, list):
        for item in v:
            global_nosql_guard(item)
    return v

def secure_string_processor(v: Any) -> Any:
    """
    Unified sanitization agent checking for operator injection and running 
    bleach to strip script/iframe tags execution lanes entirely.
    """
    # 1. Intercept nested objects trying to bypass string constraints
    if isinstance(v, dict) or isinstance(v, list):
        global_nosql_guard(v)
        
    # 2. Enforce Anti-XSS Protection on standard strings
    if isinstance(v, str):
        return bleach.clean(v, tags=[], attributes={}, strip=True)
        
    return v

# Reusable security type alias for all input schema structures
SanitizedStr = Annotated[str, BeforeValidator(secure_string_processor)]

# -------------------------------------------------------------------------
# 📋 HARDENED PYDANTIC SCHEMAS
# -------------------------------------------------------------------------

class QueryRequest(BaseModel):
    question: SanitizedStr


class QueryResponse(BaseModel):
    answer: str


class ExperimentNotesUpsertRequest(BaseModel):
    user_id: SanitizedStr
    experiment_id: SanitizedStr
    observations: Optional[SanitizedStr] = Field(default=None, max_length=10000)
    conclusions: Optional[SanitizedStr] = Field(default=None, max_length=10000)
    learnings: Optional[SanitizedStr] = Field(default=None, max_length=10000)
    notes: Optional[SanitizedStr] = Field(default=None, max_length=10000)


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
    user_id: SanitizedStr = "default-student"
    experiment_id: SanitizedStr


class LabReportUpdateRequest(BaseModel):
    title: Optional[SanitizedStr] = None
    objective: Optional[SanitizedStr] = None
    procedure: Optional[SanitizedStr] = None
    observations: Optional[SanitizedStr] = None
    results: Optional[SanitizedStr] = None
    conclusions: Optional[SanitizedStr] = None
    quiz_performance: Optional[SanitizedStr] = None
    status: Optional[SanitizedStr] = "draft"


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
    user_id: SanitizedStr
    experiment_name: SanitizedStr
    subject: SanitizedStr
    score: int
    timestamp: SanitizedStr  # ISO Format


class NotebookEntryUpsertRequest(BaseModel):
    user_id: SanitizedStr
    experiment_id: SanitizedStr
    subject: SanitizedStr
    title: SanitizedStr
    objective: Optional[SanitizedStr] = None
    procedure_summary: Optional[SanitizedStr] = None
    observations: Optional[SanitizedStr] = None
    results: Optional[SanitizedStr] = None
    conclusions: Optional[SanitizedStr] = None
    reflection: Optional[SanitizedStr] = None
    tags: Optional[List[SanitizedStr]] = None


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


class PredictionResponse(BaseModel):
    experiment_id: str
    expected_difficulty: int
    estimated_time_minutes: int
    success_probability: int
    readiness_level: str
    reasons: List[str]
    recommendations: List[str]
    tags: List[str] = []


class AssistantHelpRequest(BaseModel):
    experiment_title: SanitizedStr
    current_step: Optional[SanitizedStr] = None
    user_question: SanitizedStr
    student_notes: Optional[SanitizedStr] = None


class AssistantHintRequest(BaseModel):
    experiment_title: SanitizedStr
    current_step: SanitizedStr
    student_notes: Optional[SanitizedStr] = None


class AssistantNotesAnalyzeRequest(BaseModel):
    experiment_title: SanitizedStr
    student_notes: SanitizedStr


class AssistantSummaryRequest(BaseModel):
    experiment_title: SanitizedStr
    student_notes: SanitizedStr


class AssistantResponse(BaseModel):
    answer: str