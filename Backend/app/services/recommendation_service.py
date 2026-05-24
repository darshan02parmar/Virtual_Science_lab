from typing import List, Dict
from app.services import progress_service, gamification_service

EXPERIMENT_CATALOG = [
    {"id": "human-body", "subject": "biology", "difficulty": "Beginner", "title": "Human Body Anatomy"},
    {"id": "mitochondria", "subject": "biology", "difficulty": "Intermediate", "title": "Mitochondria"},
    {"id": "eye", "subject": "biology", "difficulty": "Intermediate", "title": "Eye Anatomy"},
    {"id": "kidney", "subject": "biology", "difficulty": "Advanced", "title": "Kidney Anatomy"},
    {"id": "chemistry-equipment", "subject": "chemistry", "difficulty": "Beginner", "title": "Chemistry Equipment"},
    {"id": "volcano-experiment", "subject": "chemistry", "difficulty": "Beginner", "title": "Volcano Experiment"},
    {"id": "condenser", "subject": "chemistry", "difficulty": "Intermediate", "title": "Condenser"},
    {"id": "acid-base-neutralization", "subject": "chemistry", "difficulty": "Advanced", "title": "Acid Base Neutralization"},
    {"id": "velocity-acceleration", "subject": "physics", "difficulty": "Beginner", "title": "Velocity & Acceleration"},
    {"id": "magnetic-field-wires", "subject": "physics", "difficulty": "Intermediate", "title": "Magnetic Field (Two Wires)"},
    {"id": "thumb-rule", "subject": "physics", "difficulty": "Beginner", "title": "Right-Hand Thumb Rule"},
    {"id": "magnetic-field-direction", "subject": "physics", "difficulty": "Advanced", "title": "Magnetic Field Direction"},
]

def get_recommendations(user_id: str) -> List[Dict]:
    recommendations = []
    
    # 1. Fetch user data
    try:
        progress_records = progress_service.get_user_experiment_progress(user_id)
        completed_ids = {r["experiment_id"] for r in progress_records if r.get("completed")}
    except Exception:
        progress_records = []
        completed_ids = set()

    try:
        quiz_attempts = gamification_service.get_quiz_attempts(user_id)
    except Exception:
        quiz_attempts = []
        
    # Get latest attempt per experiment
    latest_attempts = {}
    for attempt in quiz_attempts:
        # Assuming attempts are ordered or we can just track by ID and date
        # (gamification_service might return them chronological)
        latest_attempts[attempt["experiment_id"]] = attempt

    # 2. Rule: Smart Retry (Low Quiz Scores)
    for exp_id, attempt in latest_attempts.items():
        if attempt["percentage"] < 60:
            catalog_exp = next((e for e in EXPERIMENT_CATALOG if e["id"] == exp_id), None)
            if catalog_exp:
                recommendations.append({
                    "experiment_id": exp_id,
                    "title": catalog_exp["title"],
                    "subject": catalog_exp["subject"],
                    "difficulty": catalog_exp["difficulty"],
                    "reason": "Smart Retry",
                    "description": f"You scored {attempt['percentage']}% on the quiz. Let's try again to improve!",
                    "priority": 3
                })

    # 3. Rule: Learning Path (Progression in active subjects)
    # Find most active subjects
    subject_counts = {"biology": 0, "chemistry": 0, "physics": 0}
    for exp_id in completed_ids:
        cat_exp = next((e for e in EXPERIMENT_CATALOG if e["id"] == exp_id), None)
        if cat_exp:
            subject_counts[cat_exp["subject"]] += 1
            
    active_subjects = sorted(subject_counts.items(), key=lambda x: x[1], reverse=True)
    
    for subject, count in active_subjects:
        if count > 0: # User has started this subject
            # Find next difficulty
            subject_exps = [e for e in EXPERIMENT_CATALOG if e["subject"] == subject]
            completed_in_subject = [e for e in subject_exps if e["id"] in completed_ids]
            
            # Check if all beginners are done
            beginners = [e for e in subject_exps if e["difficulty"] == "Beginner"]
            intermediates = [e for e in subject_exps if e["difficulty"] == "Intermediate"]
            advanced = [e for e in subject_exps if e["difficulty"] == "Advanced"]
            
            next_exp = None
            if not all(e["id"] in completed_ids for e in beginners):
                next_exp = next((e for e in beginners if e["id"] not in completed_ids), None)
            elif not all(e["id"] in completed_ids for e in intermediates):
                next_exp = next((e for e in intermediates if e["id"] not in completed_ids), None)
            elif not all(e["id"] in completed_ids for e in advanced):
                next_exp = next((e for e in advanced if e["id"] not in completed_ids), None)
                
            if next_exp:
                # Don't add if already added (e.g. via Smart Retry)
                if not any(r["experiment_id"] == next_exp["id"] for r in recommendations):
                    recommendations.append({
                        "experiment_id": next_exp["id"],
                        "title": next_exp["title"],
                        "subject": next_exp["subject"],
                        "difficulty": next_exp["difficulty"],
                        "reason": "Recommended Next",
                        "description": f"Continue your learning path in {subject.capitalize()}.",
                        "priority": 2
                    })
                break # Just recommend one path progression

    # 4. Rule: Weak Subjects (No engagement)
    for subject, count in active_subjects:
        if count == 0:
            subject_exps = [e for e in EXPERIMENT_CATALOG if e["subject"] == subject and e["difficulty"] == "Beginner"]
            if subject_exps:
                next_exp = subject_exps[0]
                if not any(r["experiment_id"] == next_exp["id"] for r in recommendations):
                    recommendations.append({
                        "experiment_id": next_exp["id"],
                        "title": next_exp["title"],
                        "subject": next_exp["subject"],
                        "difficulty": next_exp["difficulty"],
                        "reason": "Explore New Subject",
                        "description": f"You haven't explored {subject.capitalize()} yet. Start here!",
                        "priority": 1
                    })
                break

    # If completely empty, recommend any beginner
    if not recommendations:
        for exp in EXPERIMENT_CATALOG:
            if exp["difficulty"] == "Beginner" and exp["id"] not in completed_ids:
                recommendations.append({
                    "experiment_id": exp["id"],
                    "title": exp["title"],
                    "subject": exp["subject"],
                    "difficulty": exp["difficulty"],
                    "reason": "Getting Started",
                    "description": "Start your science journey with this beginner experiment.",
                    "priority": 2
                })
                break
                
    # Sort by priority
    recommendations.sort(key=lambda x: x["priority"], reverse=True)
    return recommendations[:3] # Return top 3
