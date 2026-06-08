import bleach
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.services import notes_service, progress_service, gamification_service

logger = logging.getLogger("uvicorn.error")

# -------------------------------------------------------------------------
# 🔒 HIGH-SPEED SYNC LAYER SANITIZATION UTILITIES
# -------------------------------------------------------------------------

def _deep_nosql_operator_block(data: Any) -> None:
    """
    Recursively audits dict payloads inside sync matrices.
    Throws ValueError instantly if a MongoDB command operator block ($) is passed.
    """
    if isinstance(data, dict):
        for k, v in data.items():
            if isinstance(k, str) and k.startswith("$"):
                raise ValueError(f"Prohibited injection operator key vector: {k}")
            _deep_nosql_operator_block(v)
    elif isinstance(data, list):
        for item in data:
            _deep_nosql_operator_block(item)

def _sanitize_primitive_string(val: Any) -> str:
    """
    Forces casting to plain primitive string, running clean layers 
    to neutralize stored script/iframe triggers.
    """
    if val is None:
        return ""
    str_val = str(val)
    return bleach.clean(str_val, tags=[], attributes={}, strip=True)

# -------------------------------------------------------------------------
# 🔄 SECURED SINGLE ACTION ENGINE (Main Branch Refactor - Secured)
# -------------------------------------------------------------------------

def process_single_sync_action(idempotency_key: str, action_type: str, version: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Processes a single offline sync action using specific domain services.
    Applies Optimistic Concurrency Control (OCC) and handles duplicate prevention.
    Protected against NoSQL Injection and Cross-Site Scripting.
    """
    try:
        safe_action_type = _sanitize_primitive_string(action_type)
        if not isinstance(payload, dict):
            return {"status": "error", "detail": "Invalid payload topology"}

        # NoSQL Injection Scanner Check
        _deep_nosql_operator_block(payload)

        # 📌 1. Process Notes Mutations
        if safe_action_type == "notes":
            user_id = _sanitize_primitive_string(payload.get("user_id"))
            experiment_id = _sanitize_primitive_string(payload.get("experiment_id"))
            client_updated_at = _sanitize_primitive_string(payload.get("updated_at"))
            
            existing = notes_service.get_user_experiment_notes(user_id, experiment_id)
            if existing:
                current_version = existing.get("version") or existing.get("__v", 1)
                if int(current_version) >= int(version):
                    logger.warning(f"[OCC Conflict] Stale notes version {version} rejected for user {user_id}.")
                    return {"status": "conflict", "detail": "Stale version state rejected."}
            
            notes_service.upsert_user_experiment_notes(
                user_id=user_id,
                experiment_id=experiment_id,
                observations=_sanitize_primitive_string(payload.get("observations")) if payload.get("observations") is not None else None,
                conclusions=_sanitize_primitive_string(payload.get("conclusions")) if payload.get("conclusions") is not None else None,
                learnings=_sanitize_primitive_string(payload.get("learnings")) if payload.get("learnings") is not None else None,
                notes=_sanitize_primitive_string(payload.get("notes")) if payload.get("notes") is not None else None,
                updated_at=client_updated_at
            )
            return {
                "status": "success", 
                "action_applied": "notes", 
                "document_id": f"{user_id}_{experiment_id}", 
                "applied_version": version + 1
            }

        # 📌 2. Process Progress Mutations
        elif safe_action_type == "progress":
            user_id = _sanitize_primitive_string(payload.get("user_id"))
            experiment_id = _sanitize_primitive_string(payload.get("experiment_id"))
            subject_raw = _sanitize_primitive_string(payload.get("subject"))
            title = _sanitize_primitive_string(payload.get("title"))
            completed = bool(payload.get("completed", True))
            score = payload.get("score")
            safe_score = int(score) if score is not None else None
            
            progress_service.upsert_experiment_progress(
                user_id=user_id,
                experiment_id=experiment_id,
                subject=subject_raw.lower(),
                title=title,
                completed=completed,
                score=safe_score
            )
            return {
                "status": "success", 
                "action_applied": "progress", 
                "document_id": f"{user_id}_{experiment_id}", 
                "applied_version": version + 1
            }

        # 📌 3. Process Quiz Attempt Mutations
        elif safe_action_type in ["quiz", "quiz_attempts"]:
            user_id = _sanitize_primitive_string(payload.get("user_id"))
            experiment_id = _sanitize_primitive_string(payload.get("experiment_id"))
            attempted_at = _sanitize_primitive_string(payload.get("attempted_at"))
            score = int(payload.get("score", 0))
            total_questions = int(payload.get("total_questions", 5))
            subject_raw = _sanitize_primitive_string(payload.get("subject"))
            
            raw_answers = payload.get("selected_answers", [])
            selected_answers = [_sanitize_primitive_string(ans) for ans in raw_answers] if isinstance(raw_answers, list) else []
            
            existing_attempts = gamification_service.get_quiz_attempts(user_id, experiment_id)
            is_duplicate = any(str(att.get("attempted_at")) == attempted_at for att in existing_attempts)
            
            if not is_duplicate:
                gamification_service.complete_quiz(
                    user_id=user_id,
                    experiment_id=experiment_id,
                    score=score,
                    total_questions=total_questions,
                    subject=subject_raw.lower(),
                    selected_answers=selected_answers,
                    attempted_at=attempted_at
                )
            return {
                "status": "success", 
                "action_applied": "quiz", 
                "document_id": f"{user_id}_{experiment_id}", 
                "applied_version": version + 1
            }

        else:
            return {"status": "error", "detail": f"Unknown action type: {safe_action_type}"}

    except Exception as e:
        logger.error(f"Error handling isolated sync action {action_type}: {str(e)}")
        return {"status": "error", "detail": str(e)}

# -------------------------------------------------------------------------
# 🔄 SECURED OFFLINE BATCH PIPELINE (Validation Branch Compatibility)
# -------------------------------------------------------------------------

def sync_offline_actions(actions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Process a list of offline sync actions in chronological order.
    Fully protected against NoSQL Injection and Cross-Site Scripting payloads.
    """
    def get_timestamp(act):
        return str(act.get("timestamp") or "")
    
    if not isinstance(actions, list):
        return {"notes_synced": 0, "progress_synced": 0, "quizzes_synced": 0, "failed_actions": 1, "errors": ["Invalid actions root topology"]}

    sorted_actions = sorted(actions, key=get_timestamp)
    
    results = {
        "notes_synced": 0,
        "progress_synced": 0,
        "quizzes_synced": 0,
        "failed_actions": 0,
        "errors": []
    }
    
    for action in sorted_actions:
        if not isinstance(action, dict):
            results["failed_actions"] += 1
            continue
            
        action_type = _sanitize_primitive_string(action.get("type"))
        payload = action.get("payload", {})
        timestamp = _sanitize_primitive_string(action.get("timestamp"))
        
        try:
            _deep_nosql_operator_block(payload)
            
            if action_type == "notes":
                user_id = _sanitize_primitive_string(payload.get("user_id"))
                experiment_id = _sanitize_primitive_string(payload.get("experiment_id"))
                observations = _sanitize_primitive_string(payload.get("observations")) if payload.get("observations") is not None else None
                conclusions = _sanitize_primitive_string(payload.get("conclusions")) if payload.get("conclusions") is not None else None
                learnings = _sanitize_primitive_string(payload.get("learnings")) if payload.get("learnings") is not None else None
                notes = _sanitize_primitive_string(payload.get("notes")) if payload.get("notes") is not None else None
                client_updated_at = _sanitize_primitive_string(payload.get("updated_at") or timestamp)
                
                existing = notes_service.get_user_experiment_notes(user_id, experiment_id)
                
                if existing and existing.get("updated_at"):
                    if str(existing["updated_at"]) > client_updated_at:
                        continue
                
                notes_service.upsert_user_experiment_notes(
                    user_id=user_id,
                    experiment_id=experiment_id,
                    observations=observations,
                    conclusions=conclusions,
                    learnings=learnings,
                    notes=notes,
                    updated_at=client_updated_at
                )
                results["notes_synced"] += 1
                
            elif action_type == "progress":
                user_id = _sanitize_primitive_string(payload.get("user_id"))
                experiment_id = _sanitize_primitive_string(payload.get("experiment_id"))
                subject_raw = _sanitize_primitive_string(payload.get("subject"))
                title = _sanitize_primitive_string(payload.get("title"))
                completed = bool(payload.get("completed", True))
                score = payload.get("score")
                safe_score = int(score) if score is not None else None
                
                progress_service.upsert_experiment_progress(
                    user_id=user_id,
                    experiment_id=experiment_id,
                    subject=subject_raw.lower(),
                    title=title,
                    completed=completed,
                    score=safe_score
                )
                results["progress_synced"] += 1
                
            elif action_type == "quiz":
                user_id = _sanitize_primitive_string(payload.get("user_id"))
                experiment_id = _sanitize_primitive_string(payload.get("experiment_id"))
                score = int(payload.get("score", 0))
                total_questions = int(payload.get("total_questions", 5))
                subject_raw = _sanitize_primitive_string(payload.get("subject"))
                attempted_at = _sanitize_primitive_string(payload.get("attempted_at") or timestamp)
                
                raw_answers = payload.get("selected_answers", [])
                selected_answers = [_sanitize_primitive_string(ans) for ans in raw_answers] if isinstance(raw_answers, list) else []
                
                existing_attempts = gamification_service.get_quiz_attempts(user_id, experiment_id)
                is_duplicate = any(str(att.get("attempted_at")) == attempted_at for att in existing_attempts)
                
                if not is_duplicate:
                    gamification_service.complete_quiz(
                        user_id=user_id,
                        experiment_id=experiment_id,
                        score=score,
                        total_questions=total_questions,
                        subject=subject_raw.lower(),
                        selected_answers=selected_answers,
                        attempted_at=attempted_at
                    )
                    results["quizzes_synced"] += 1
                    
            else:
                results["failed_actions"] += 1
                results["errors"].append(f"Unknown action type: {action_type}")
                
        except Exception as e:
            results["failed_actions"] += 1
            results["errors"].append(f"Error syncing action {action_type}: {str(e)}")
            
    return results