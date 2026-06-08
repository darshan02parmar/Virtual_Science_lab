from typing import List, Dict, Any
from app.services import progress_service, gamification_service

EXPERIMENT_CATALOG = [
  {
    "id": "human-body",
    "title": "Human Body Anatomy",
    "subject": "biology",
    "difficulty": "Beginner",
    "prerequisites": [],
  },
  {
    "id": "mitochondria",
    "title": "Mitochondria",
    "subject": "biology",
    "difficulty": "Intermediate",
    "prerequisites": ["human-body"],
  },
  {
    "id": "eye",
    "title": "Eye Anatomy",
    "subject": "biology",
    "difficulty": "Intermediate",
    "prerequisites": ["human-body"],
  },
  {
    "id": "kidney",
    "title": "Kidney Anatomy",
    "subject": "biology",
    "difficulty": "Advanced",
    "prerequisites": ["human-body", "eye"],
  },
  {
    "id": "chemistry-equipment",
    "title": "Chemistry Equipment",
    "subject": "chemistry",
    "difficulty": "Beginner",
    "prerequisites": [],
  },
  {
    "id": "volcano-experiment",
    "title": "Volcano Experiment",
    "subject": "chemistry",
    "difficulty": "Beginner",
    "prerequisites": ["chemistry-equipment"],
  },
  {
    "id": "condenser",
    "title": "Condenser",
    "subject": "chemistry",
    "difficulty": "Intermediate",
    "prerequisites": ["chemistry-equipment"],
  },
  {
    "id": "acid-base-neutralization",
    "title": "Acid Base Neutralization",
    "subject": "chemistry",
    "difficulty": "Advanced",
    "prerequisites": ["volcano-experiment"],
  },
  {
    "id": "titration-experiment",
    "title": "Acid-Base Titration",
    "subject": "chemistry",
    "difficulty": "Advanced",
    "prerequisites": ["acid-base-neutralization"],
  },
  {
    "id": "velocity-acceleration",
    "title": "Velocity & Acceleration",
    "subject": "physics",
    "difficulty": "Beginner",
    "prerequisites": [],
  },
  {
    "id": "magnetic-field-wires",
    "title": "Magnetic Field (Two Wires)",
    "subject": "physics",
    "difficulty": "Intermediate",
    "prerequisites": ["thumb-rule"],
  },
  {
    "id": "thumb-rule",
    "title": "Right-Hand Thumb Rule",
    "subject": "physics",
    "difficulty": "Beginner",
    "prerequisites": ["velocity-acceleration"],
  },
  {
    "id": "magnetic-field-direction",
    "title": "Magnetic Field Direction",
    "subject": "physics",
    "difficulty": "Advanced",
    "prerequisites": ["magnetic-field-wires"],
  },
  {
    "id": "solar-system",
    "title": "Solar System",
    "subject": "physics",
    "difficulty": "Beginner",
    "prerequisites": [],
  }
]

def generate_prediction(user_id: str, experiment_id: str) -> Dict[str, Any]:
    exp = next((e for e in EXPERIMENT_CATALOG if e["id"] == experiment_id), None)
    if not exp:
        raise ValueError("Experiment not found")

    # Fetch user data
    try:
        progress_records = progress_service.get_user_experiment_progress(user_id)
        completed_ids = {r["experiment_id"] for r in progress_records if r.get("completed")}
    except Exception:
        completed_ids = set()

    try:
        quiz_attempts = gamification_service.get_quiz_attempts(user_id)
    except Exception:
        quiz_attempts = []

    # 1. Subject Mastery (35%)
    # Ratio of completed experiments in the same subject
    subject_exps = [e for e in EXPERIMENT_CATALOG if e["subject"] == exp["subject"]]
    completed_in_subject = [e for e in subject_exps if e["id"] in completed_ids]
    subject_mastery_ratio = len(completed_in_subject) / len(subject_exps) if subject_exps else 0
    mastery_score = subject_mastery_ratio * 35

    # 2. Quiz Performance (25%)
    # Average score in the same subject
    subject_quiz_scores = [a["percentage"] for a in quiz_attempts if any(e["id"] == a["experiment_id"] and e["subject"] == exp["subject"] for e in EXPERIMENT_CATALOG)]
    avg_quiz = sum(subject_quiz_scores) / len(subject_quiz_scores) if subject_quiz_scores else 50 # Default to 50% if no quizzes
    quiz_score = (avg_quiz / 100) * 25

    # 3. Completed Prerequisites (20%)
    prereqs = exp["prerequisites"]
    if prereqs:
        completed_prereqs = [p for p in prereqs if p in completed_ids]
        prereq_ratio = len(completed_prereqs) / len(prereqs)
        prereq_score = prereq_ratio * 20
    else:
        prereq_score = 20 # Free points if no prerequisites

    # 4. Learning Streak / Consistency (20%)
    # Let's approximate this by the number of total completed experiments
    total_completed = len(completed_ids)
    consistency_ratio = min(total_completed / 10, 1.0) # Max out at 10 experiments
    consistency_score = consistency_ratio * 20

    # Base difficulty penalty
    base_penalty = 0
    if exp["difficulty"] == "Intermediate":
        base_penalty = 15
    elif exp["difficulty"] == "Advanced":
        base_penalty = 30

    success_probability = int(mastery_score + quiz_score + prereq_score + consistency_score - base_penalty)
    success_probability = max(5, min(success_probability, 99)) # Clamp between 5 and 99

    # Expected Difficulty (1-5 stars)
    if success_probability > 85:
        expected_difficulty = 1
        readiness_level = "High"
    elif success_probability > 70:
        expected_difficulty = 2
        readiness_level = "High"
    elif success_probability > 50:
        expected_difficulty = 3
        readiness_level = "Medium"
    elif success_probability > 30:
        expected_difficulty = 4
        readiness_level = "Low"
    else:
        expected_difficulty = 5
        readiness_level = "Low"

    estimated_time = 15
    if exp["difficulty"] == "Intermediate":
        estimated_time = 25
    elif exp["difficulty"] == "Advanced":
        estimated_time = 40

    # Reasons & Recommendations
    reasons = []
    recommendations = []

    if prereqs:
        if prereq_score == 20:
            reasons.append("Completed all prerequisite experiments.")
        else:
            missing = [p for p in prereqs if p not in completed_ids]
            reasons.append(f"Missing {len(missing)} prerequisite(s).")
            for m in missing:
                m_title = next((e["title"] for e in EXPERIMENT_CATALOG if e["id"] == m), m)
                recommendations.append(f"Complete {m_title} first.")
    
    if subject_mastery_ratio > 0.7:
        reasons.append(f"High mastery in {exp['subject'].capitalize()}.")
    elif subject_mastery_ratio < 0.3:
        reasons.append(f"Low mastery in {exp['subject'].capitalize()}.")
        recommendations.append(f"Try easier {exp['subject']} experiments.")

    if avg_quiz > 80:
        reasons.append("Strong quiz performance in this subject.")
    elif avg_quiz < 60 and subject_quiz_scores:
        reasons.append("Recent quiz scores have been low.")
        recommendations.append("Review basic concepts before starting.")

    if not reasons:
        reasons.append("Ready to learn something new!")

    return {
        "experiment_id": experiment_id,
        "expected_difficulty": expected_difficulty,
        "estimated_time_minutes": estimated_time,
        "success_probability": success_probability,
        "readiness_level": readiness_level,
        "reasons": reasons,
        "recommendations": recommendations
    }

def get_all_predictions(user_id: str) -> List[Dict[str, Any]]:
    return [generate_prediction(user_id, exp["id"]) for exp in EXPERIMENT_CATALOG]
