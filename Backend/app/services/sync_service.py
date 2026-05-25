from typing import List, Dict, Any
from datetime import datetime
from app.services import notes_service, progress_service, gamification_service

def sync_offline_actions(actions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Process a list of offline sync actions in chronological order.
    
    Action format:
    {
        "id": str,
        "type": "notes" | "progress" | "quiz",
        "payload": dict,
        "timestamp": str (ISO 8601 UTC)
    }
    """
    # Sort actions by their client-side timestamp to apply them in correct chronological order
    def get_timestamp(act):
        return act.get("timestamp") or ""
    
    sorted_actions = sorted(actions, key=get_timestamp)
    
    results = {
        "notes_synced": 0,
        "progress_synced": 0,
        "quizzes_synced": 0,
        "failed_actions": 0,
        "errors": []
    }
    
    for action in sorted_actions:
        action_type = action.get("type")
        payload = action.get("payload", {})
        timestamp = action.get("timestamp")
        
        try:
            if action_type == "notes":
                user_id = payload.get("user_id")
                experiment_id = payload.get("experiment_id")
                observations = payload.get("observations")
                conclusions = payload.get("conclusions")
                learnings = payload.get("learnings")
                notes = payload.get("notes")
                client_updated_at = payload.get("updated_at") or timestamp
                
                # Retrieve existing note to check conflict (Last-Write-Wins)
                existing = notes_service.get_user_experiment_notes(user_id, experiment_id)
                
                if existing and existing.get("updated_at"):
                    # Check if database note is newer
                    if existing["updated_at"] > client_updated_at:
                        # Database is newer, skip syncing client note to prevent overwriting newer changes
                        continue
                
                # Upsert note with client timestamp
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
                user_id = payload.get("user_id")
                experiment_id = payload.get("experiment_id")
                subject = payload.get("subject")
                title = payload.get("title")
                completed = payload.get("completed", True)
                score = payload.get("score")
                
                progress_service.upsert_experiment_progress(
                    user_id=user_id,
                    experiment_id=experiment_id,
                    subject=subject.lower() if subject else "",
                    title=title,
                    completed=completed,
                    score=score
                )
                results["progress_synced"] += 1
                
            elif action_type == "quiz":
                user_id = payload.get("user_id")
                experiment_id = payload.get("experiment_id")
                score = payload.get("score")
                total_questions = payload.get("total_questions", 5)
                subject = payload.get("subject")
                selected_answers = payload.get("selected_answers", [])
                attempted_at = payload.get("attempted_at") or timestamp
                
                # Check for duplicate attempt (exact timestamp match) to prevent double XP / badges
                existing_attempts = gamification_service.get_quiz_attempts(user_id, experiment_id)
                is_duplicate = any(att.get("attempted_at") == attempted_at for att in existing_attempts)
                
                if not is_duplicate:
                    gamification_service.complete_quiz(
                        user_id=user_id,
                        experiment_id=experiment_id,
                        score=score,
                        total_questions=total_questions,
                        subject=subject.lower() if subject else "",
                        selected_answers=selected_answers,
                        attempted_at=attempted_at
                    )
                    results["quizzes_synced"] += 1
                else:
                    # Silently ignore duplicate
                    pass
                    
            else:
                results["failed_actions"] += 1
                results["errors"].append(f"Unknown action type: {action_type}")
                
        except Exception as e:
            results["failed_actions"] += 1
            results["errors"].append(f"Error syncing action {action_type}: {str(e)}")
            
    return results
