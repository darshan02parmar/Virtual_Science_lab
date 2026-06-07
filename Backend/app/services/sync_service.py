from typing import Dict, Any, Optional
import logging
from app.services import notes_service, progress_service, gamification_service

logger = logging.getLogger("uvicorn.error")

def process_single_sync_action(idempotency_key: str, action_type: str, version: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Processes a single offline sync action using specific domain services.
    Applies Optimistic Concurrency Control (OCC) and handles duplicate prevention.
    """
    try:
        # 📌 1. Process Notes Mutations
        if action_type == "notes":
            user_id = payload.get("user_id")
            experiment_id = payload.get("experiment_id")
            client_updated_at = payload.get("updated_at")
            
            # Retrieve existing state to check conflict via OCC/Timestamp evaluation
            existing = notes_service.get_user_experiment_notes(user_id, experiment_id)
            if existing:
                # Fallback check: Use explicit document version or timestamp to verify freshness
                current_version = existing.get("version") or existing.get("__v", 1)
                if current_version >= version:
                    logger.warning(f"[OCC Conflict] Stale notes version {version} rejected for user {user_id}.")
                    return {"status": "conflict", "detail": "Stale version state rejected."}
            
            notes_service.upsert_user_experiment_notes(
                user_id=user_id,
                experiment_id=experiment_id,
                observations=payload.get("observations"),
                conclusions=payload.get("conclusions"),
                learnings=payload.get("learnings"),
                notes=payload.get("notes"),
                updated_at=client_updated_at
            )
            return {
                "status": "success", 
                "action_applied": "notes", 
                "document_id": f"{user_id}_{experiment_id}", 
                "applied_version": version + 1
            }

        # 📌 2. Process Progress Mutations
        elif action_type == "progress":
            user_id = payload.get("user_id")
            experiment_id = payload.get("experiment_id")
            subject = payload.get("subject")
            
            progress_service.upsert_experiment_progress(
                user_id=user_id,
                experiment_id=experiment_id,
                subject=subject.lower() if subject else "",
                title=payload.get("title"),
                completed=payload.get("completed", True),
                score=payload.get("score")
            )
            return {
                "status": "success", 
                "action_applied": "progress", 
                "document_id": f"{user_id}_{experiment_id}", 
                "applied_version": version + 1
            }

        # 📌 3. Process Quiz Attempt Mutations
        elif action_type in ["quiz", "quiz_attempts"]:
            user_id = payload.get("user_id")
            experiment_id = payload.get("experiment_id")
            attempted_at = payload.get("attempted_at")
            
            # Check for duplicate attempt to prevent double XP allocation
            existing_attempts = gamification_service.get_quiz_attempts(user_id, experiment_id)
            is_duplicate = any(att.get("attempted_at") == attempted_at for att in existing_attempts)
            
            if not is_duplicate:
                gamification_service.complete_quiz(
                    user_id=user_id,
                    experiment_id=experiment_id,
                    score=payload.get("score"),
                    total_questions=payload.get("total_questions", 5),
                    subject=payload.get("subject").lower() if payload.get("subject") else "",
                    selected_answers=payload.get("selected_answers", []),
                    attempted_at=attempted_at
                )
            return {
                "status": "success", 
                "action_applied": "quiz", 
                "document_id": f"{user_id}_{experiment_id}", 
                "applied_version": version + 1
            }

        else:
            return {"status": "error", "detail": f"Unknown action type: {action_type}"}

    except Exception as e:
        logger.error(f"Error handling isolated sync action {action_type}: {str(e)}")
        return {"status": "error", "detail": str(e)}