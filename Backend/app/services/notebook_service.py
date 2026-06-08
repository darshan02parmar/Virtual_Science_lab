from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from pymongo import MongoClient, ASCENDING
from app.core.config import MONGODB_URI

_client: MongoClient = None
_db = None

def _get_db():
    global _client, _db
    if _client is None:
        _client = MongoClient(MONGODB_URI)
        _db = _client["virtual_science_lab"]
        _db["experiment_notebooks"].create_index(
            [("user_id", ASCENDING), ("experiment_id", ASCENDING)],
            unique=True,
        )
        _db["notebook_versions"].create_index(
            [("user_id", ASCENDING), ("experiment_id", ASCENDING), ("version", ASCENDING)],
            unique=True,
        )
    return _db

def _serialize(doc) -> Dict[str, Any]:
    if not doc:
        return None
    doc.pop("_id", None)
    return doc

def get_notebook_entries(user_id: str) -> List[Dict[str, Any]]:
    db = _get_db()
    # Defense-in-Depth: Absolute type casting to isolate the find query context
    safe_user_id = str(user_id)
    cursor = db["experiment_notebooks"].find({"user_id": safe_user_id}).sort("updated_at", -1)
    return [_serialize(doc) for doc in cursor]

def get_notebook_entry(user_id: str, experiment_id: str) -> Optional[Dict[str, Any]]:
    db = _get_db()
    safe_user_id = str(user_id)
    safe_experiment_id = str(experiment_id)
    
    doc = db["experiment_notebooks"].find_one({"user_id": safe_user_id, "experiment_id": safe_experiment_id})
    return _serialize(doc)

def get_notebook_versions(user_id: str, experiment_id: str) -> List[Dict[str, Any]]:
    db = _get_db()
    safe_user_id = str(user_id)
    safe_experiment_id = str(experiment_id)
    
    cursor = db["notebook_versions"].find({"user_id": safe_user_id, "experiment_id": safe_experiment_id}).sort("version", -1)
    return [_serialize(doc) for doc in cursor]

def upsert_notebook_entry(
    user_id: str,
    experiment_id: str,
    subject: str,
    title: str,
    objective: Optional[str] = None,
    procedure_summary: Optional[str] = None,
    observations: Optional[str] = None,
    results: Optional[str] = None,
    conclusions: Optional[str] = None,
    reflection: Optional[str] = None,
    tags: Optional[List[str]] = None,
) -> Dict[str, Any]:
    db = _get_db()
    now = datetime.now(timezone.utc).isoformat()
    
    # 1. Structural Primitive Protection for Query Selectors
    safe_user_id = str(user_id)
    safe_experiment_id = str(experiment_id)

    # 2. Hardening and Sanity Mapping for List Elements (tags Array Protection)
    safe_tags = [str(tag) for tag in tags] if tags is not None else []

    existing = db["experiment_notebooks"].find_one({"user_id": safe_user_id, "experiment_id": safe_experiment_id})
    
    version = 1
    created_at = now
    
    if existing:
        version = int(existing.get("version", 1)) + 1
        created_at = str(existing.get("created_at", now))
        
        # Save previous version securely to notebook_versions
        old_version_doc = existing.copy()
        old_version_doc.pop("_id", None)
        db["notebook_versions"].insert_one(old_version_doc)

    # 3. Complete Primitive Schema Mapping before MongoDB transmission
    new_data = {
        "user_id": safe_user_id,
        "experiment_id": safe_experiment_id,
        "subject": str(subject),
        "title": str(title),
        "objective": str(objective) if objective is not None else None,
        "procedure_summary": str(procedure_summary) if procedure_summary is not None else None,
        "observations": str(observations) if observations is not None else None,
        "results": str(results) if results is not None else None,
        "conclusions": str(conclusions) if conclusions is not None else None,
        "reflection": str(reflection) if reflection is not None else None,
        "tags": safe_tags,
        "version": version,
        "created_at": created_at,
        "updated_at": now,
    }

    db["experiment_notebooks"].update_one(
        {"user_id": safe_user_id, "experiment_id": safe_experiment_id},
        {"$set": new_data},
        upsert=True,
    )
    
    return new_data