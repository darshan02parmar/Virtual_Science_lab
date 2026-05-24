"""
gamification_service.py — MongoDB version (replaces sqlite3)

Collections used (all inside the 'virtual_science_lab' database):
  - user_gamification : one document per user_id
      {
          user_id: str,
          xp: int,
          completed_quizzes: { experiment_id: best_score },
          unlocked_badges: [str]
      }
  - quiz_attempts : one document per submission (append-only history)
      {
          user_id: str,
          experiment_id: str,
          subject: str,
          selected_answers: [any],
          score: int,
          total_questions: int,
          percentage: int,
          attempted_at: str   # ISO-8601 UTC
      }
"""

from datetime import datetime, timezone
from pymongo import MongoClient, ASCENDING

from app.core.config import MONGODB_URI

# ---------------------------------------------------------------------------
# Connection singleton (reused across warm serverless invocations)
# ---------------------------------------------------------------------------
_client: MongoClient = None
_db = None

def _get_db():
    global _client, _db
    if _client is None:
        _client = MongoClient(MONGODB_URI)
        _db = _client["virtual_science_lab"]
        _db["user_gamification"].create_index(
            [("user_id", ASCENDING)], unique=True
        )
        _db["quiz_attempts"].create_index(
            [("user_id", ASCENDING), ("experiment_id", ASCENDING)]
        )
    return _db

# ---------------------------------------------------------------------------
# Experiment / badge configuration  — updated to include acid-base-neutralization
# ---------------------------------------------------------------------------
EXPERIMENTS_BY_SUBJECT = {
    "biology":   ["human-body", "mitochondria", "eye", "kidney"],
    "chemistry": ["chemistry-equipment", "volcano-experiment", "condenser", "acid-base-neutralization"],
    "physics":   ["velocity-acceleration", "magnetic-field-wires", "thumb-rule", "magnetic-field-direction"],
}

ALL_EXPERIMENTS = [exp for exps in EXPERIMENTS_BY_SUBJECT.values() for exp in exps]

BADGE_DEFINITIONS = [
    {"id": "Junior Biologist",  "subject": "biology",   "threshold": 1,  "type": "any_perfect"},
    {"id": "Biology Pro",       "subject": "biology",   "threshold": 4,  "type": "all_perfect"},
    {"id": "Junior Chemist",    "subject": "chemistry", "threshold": 1,  "type": "any_perfect"},
    {"id": "Chemistry Pro",     "subject": "chemistry", "threshold": 4,  "type": "all_perfect"},
    {"id": "Junior Physicist",  "subject": "physics",   "threshold": 1,  "type": "any_perfect"},
    {"id": "Physics Pro",       "subject": "physics",   "threshold": 4,  "type": "all_perfect"},
    {"id": "Science Champion",  "subject": "all",       "threshold": 12, "type": "grand_perfect"},
    {"id": "Explorer",          "subject": "weekly",    "threshold": 1,  "type": "weekly_perfect"},
]

# ---------------------------------------------------------------------------
# init_db — called on import from api/gamification.py, safe to call many times
# ---------------------------------------------------------------------------
def init_db():
    _get_db()

# ---------------------------------------------------------------------------
# user_gamification helpers
# ---------------------------------------------------------------------------
def get_user_progress(user_id: str) -> dict:
    db = _get_db()
    doc = db["user_gamification"].find_one({"user_id": user_id})
    if doc is None:
        doc = {"user_id": user_id, "xp": 0, "completed_quizzes": {}, "unlocked_badges": []}
        db["user_gamification"].insert_one(doc)
    return {
        "user_id":            doc["user_id"],
        "xp":                 doc["xp"],
        "completed_quizzes":  doc.get("completed_quizzes", {}),
        "unlocked_badges":    doc.get("unlocked_badges", []),
    }


def update_user_progress(user_id: str, xp: int, completed_quizzes: dict, unlocked_badges: list) -> None:
    db = _get_db()
    db["user_gamification"].update_one(
        {"user_id": user_id},
        {"$set": {"xp": xp, "completed_quizzes": completed_quizzes, "unlocked_badges": unlocked_badges}},
        upsert=True,
    )

# ---------------------------------------------------------------------------
# quiz_attempts helpers  (mirrors the original sqlite3 quiz_attempts table)
# ---------------------------------------------------------------------------
def save_quiz_attempt(
    user_id: str,
    experiment_id: str,
    subject: str,
    selected_answers: list,
    score: int,
    total_questions: int,
) -> dict:
    """Persist every quiz submission so students can review improvement over time."""
    db = _get_db()
    attempted_at = datetime.now(timezone.utc).isoformat()
    percentage = round((score / total_questions) * 100) if total_questions else 0

    doc = {
        "user_id":          user_id,
        "experiment_id":    experiment_id,
        "subject":          subject,
        "selected_answers": selected_answers,
        "score":            score,
        "total_questions":  total_questions,
        "percentage":       percentage,
        "attempted_at":     attempted_at,
    }
    result = db["quiz_attempts"].insert_one(doc)

    return {**doc, "id": str(result.inserted_id)}


def get_quiz_attempts(user_id: str, experiment_id: str = None) -> list:
    db = _get_db()
    query = {"user_id": user_id}
    if experiment_id:
        query["experiment_id"] = experiment_id

    cursor = db["quiz_attempts"].find(query).sort("attempted_at", -1)
    results = []
    for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        results.append(doc)
    return results

# ---------------------------------------------------------------------------
# Main business logic
# ---------------------------------------------------------------------------
def complete_quiz(
    user_id: str,
    experiment_id: str,
    score: int,
    total_questions: int,
    subject: str,
    selected_answers: list = None,
) -> dict:
    """
    Submit a quiz score.
    - 50 XP flat + 10 XP per correct answer on first attempt.
    - 150 XP flat + 10 XP per correct answer for weekly-challenge first attempt.
    - On improvement: 10 XP per extra correct answer only.
    - Evaluates badge unlocks after every submission.
    - Saves full attempt history to quiz_attempts collection.
    """
    selected_answers = selected_answers or []
    attempt = save_quiz_attempt(user_id, experiment_id, subject, selected_answers, score, total_questions)

    progress          = get_user_progress(user_id)
    current_xp        = progress["xp"]
    completed_quizzes = progress["completed_quizzes"]
    unlocked_badges   = progress["unlocked_badges"]

    previous_score    = completed_quizzes.get(experiment_id, -1)
    xp_earned         = 0
    new_score_recorded = False

    if previous_score == -1:
        xp_earned += 150 if experiment_id == "weekly-challenge" else 50
        xp_earned += score * 10
        completed_quizzes[experiment_id] = score
        new_score_recorded = True
    elif score > previous_score:
        xp_earned += (score - previous_score) * 10
        completed_quizzes[experiment_id] = score
        new_score_recorded = True

    updated_xp     = current_xp + xp_earned
    newly_unlocked = []

    for badge in BADGE_DEFINITIONS:
        badge_id = badge["id"]
        if badge_id in unlocked_badges:
            continue

        unlocked = False

        if badge["type"] == "any_perfect":
            subject_exps = EXPERIMENTS_BY_SUBJECT[badge["subject"]]
            unlocked = any(completed_quizzes.get(e, 0) == 5 for e in subject_exps)

        elif badge["type"] == "all_perfect":
            subject_exps = EXPERIMENTS_BY_SUBJECT[badge["subject"]]
            unlocked = all(completed_quizzes.get(e, 0) == 5 for e in subject_exps)

        elif badge["type"] == "grand_perfect":
            unlocked = all(completed_quizzes.get(e, 0) == 5 for e in ALL_EXPERIMENTS)

        elif badge["type"] == "weekly_perfect":
            unlocked = completed_quizzes.get("weekly-challenge", 0) >= 4

        if unlocked:
            unlocked_badges.append(badge_id)
            newly_unlocked.append(badge_id)

    if xp_earned > 0 or newly_unlocked or new_score_recorded:
        update_user_progress(user_id, updated_xp, completed_quizzes, unlocked_badges)

    return {
        "xp_earned":         xp_earned,
        "new_badges":        newly_unlocked,
        "total_xp":          updated_xp,
        "completed_quizzes": completed_quizzes,
        "unlocked_badges":   unlocked_badges,
        "attempt":           attempt,
        "quiz_attempts":     get_quiz_attempts(user_id),
    }