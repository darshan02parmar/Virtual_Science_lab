"""
notes_service.py — MongoDB version (replaces sqlite3)

Collection: experiment_notes
  {
      user_id:       str,
      experiment_id: str,
      observations:  str | None,
      conclusions:   str | None,
      learnings:     str | None,
      notes:         str | None,
      created_at:    str | None,   # ISO-8601 UTC
      updated_at:    str | None,
  }
  Compound unique index on (user_id, experiment_id)
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any

from pymongo import MongoClient, ASCENDING
from app.core.config import MONGODB_URI

_client: MongoClient = None
_db = None

def _get_db():
    global _client, _db
    if _client is None:
        _client = MongoClient(MONGODB_URI)
        _db = _client["virtual_science_lab"]
        _db["experiment_notes"].create_index(
            [("user_id", ASCENDING), ("experiment_id", ASCENDING)],
            unique=True,
        )
    return _db

def init_db():
    _get_db()

def _serialize(doc) -> Dict[str, Any]:
    doc.pop("_id", None)
    return doc

def get_user_experiment_notes(user_id: str, experiment_id: str) -> Optional[Dict[str, Any]]:
    db = _get_db()
    
    # Defense-in-Depth: Explicitly cast query parameters to primitive string
    # Bypasses any runtime attempt to inject query operator dict structures
    safe_user_id = str(user_id)
    safe_experiment_id = str(experiment_id)
    
    doc = db["experiment_notes"].find_one(
        {"user_id": safe_user_id, "experiment_id": safe_experiment_id}
    )
    if not doc:
        return None
    return _serialize(doc)

def upsert_user_experiment_notes(
    user_id: str,
    experiment_id: str,
    observations: Optional[str] = None,
    conclusions: Optional[str] = None,
    learnings: Optional[str] = None,
    notes: Optional[str] = None,
) -> Dict[str, Any]:
    db = _get_db()
    now = datetime.now(timezone.utc).isoformat()

    # Query Layer Guarding: Force strict primitive isolation
    safe_user_id = str(user_id)
    safe_experiment_id = str(experiment_id)

    existing = db["experiment_notes"].find_one(
        {"user_id": safe_user_id, "experiment_id": safe_experiment_id}
    )
    created_at = existing["created_at"] if existing else now

    # Payload Sanitization Bridge: Strict casting of string content fields
    db["experiment_notes"].update_one(
        {"user_id": safe_user_id, "experiment_id": safe_experiment_id},
        {
            "$set": {
                "user_id":       safe_user_id,
                "experiment_id": safe_experiment_id,
                "observations":  str(observations) if observations is not None else None,
                "conclusions":   str(conclusions) if conclusions is not None else None,
                "learnings":     str(learnings) if learnings is not None else None,
                "notes":         str(notes) if notes is not None else None,
                "created_at":    created_at,
                "updated_at":    now,
            }
        },
        upsert=True,
    )
    return get_user_experiment_notes(safe_user_id, safe_experiment_id)