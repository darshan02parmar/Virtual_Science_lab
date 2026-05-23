import os
import sqlite3
from datetime import datetime, timezone
from typing import Optional

from app.services import gamification_service, notes_service, progress_service

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "gamification.db")

EXPERIMENT_DETAILS = {
    "human-body": {
        "title": "Human Body Anatomy",
        "subject": "biology",
        "objective": "To identify major human body systems and understand how organs coordinate to support life processes.",
        "procedure": "Open the anatomy experiment, inspect the labelled body systems, record key organ functions, and connect observations with the theory notes.",
    },
    "mitochondria": {
        "title": "Mitochondria",
        "subject": "biology",
        "objective": "To study the structure of mitochondria and explain their role in cellular energy production.",
        "procedure": "Observe the mitochondrial model, identify membranes and cristae, and note how structure supports ATP production.",
    },
    "eye": {
        "title": "Eye Anatomy",
        "subject": "biology",
        "objective": "To understand the main parts of the human eye and how they help form vision.",
        "procedure": "Explore the eye model, identify the cornea, lens, iris, retina, and optic nerve, then record functional observations.",
    },
    "kidney": {
        "title": "Kidney Anatomy",
        "subject": "biology",
        "objective": "To examine kidney structure and understand filtration of blood to form urine.",
        "procedure": "Inspect the kidney model, identify cortex, medulla, pelvis, and nephron-related structures, then summarize filtration flow.",
    },
    "chemistry-equipment": {
        "title": "Chemistry Equipment",
        "subject": "chemistry",
        "objective": "To recognize common laboratory equipment and understand appropriate uses for measurement, heating, and handling.",
        "procedure": "Review each apparatus, identify its name and purpose, and record safe handling observations.",
    },
    "volcano-experiment": {
        "title": "Volcano Experiment",
        "subject": "chemistry",
        "objective": "To observe gas formation during a chemical reaction using a volcano model.",
        "procedure": "Run the volcano reaction simulation, observe bubbling and eruption behavior, and relate it to carbon dioxide production.",
    },
    "condenser": {
        "title": "Condenser",
        "subject": "chemistry",
        "objective": "To understand how a condenser cools vapor and converts it back into liquid during distillation.",
        "procedure": "Observe vapor and coolant flow paths, identify inlet and outlet direction, and record how cooling causes condensation.",
    },
    "acid-base-neutralization": {
        "title": "Acid Base Neutralization",
        "subject": "chemistry",
        "objective": "To observe neutralization between hydrochloric acid and sodium hydroxide, producing salt and water.",
        "procedure": "Mix acid and base carefully with indicator, observe color or temperature change, and connect the result to H+ and OH- ion combination.",
    },
    "velocity-acceleration": {
        "title": "Velocity & Acceleration",
        "subject": "physics",
        "objective": "To understand the relationship between velocity, acceleration, and change in motion over time.",
        "procedure": "Run the motion experiment, observe changes in speed and direction, and record how acceleration affects velocity.",
    },
    "magnetic-field-wires": {
        "title": "Magnetic Field (Two Wires)",
        "subject": "physics",
        "objective": "To observe magnetic interaction between two current-carrying parallel wires.",
        "procedure": "Set current directions in the simulation, compare attraction and repulsion, and note how current direction changes force.",
    },
    "thumb-rule": {
        "title": "Right-Hand Thumb Rule",
        "subject": "physics",
        "objective": "To apply the right-hand thumb rule for predicting magnetic field direction around a conductor.",
        "procedure": "Orient the thumb with current direction, observe curled finger direction, and compare predictions with the model.",
    },
    "magnetic-field-direction": {
        "title": "Magnetic Field Direction",
        "subject": "physics",
        "objective": "To map magnetic field direction around a straight current-carrying conductor.",
        "procedure": "Change current direction and distance from conductor, observe field direction and strength, and record patterns.",
    },
}


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS lab_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            experiment_id TEXT NOT NULL,
            title TEXT NOT NULL,
            subject TEXT NOT NULL,
            objective TEXT NOT NULL,
            procedure TEXT NOT NULL,
            observations TEXT NOT NULL,
            results TEXT NOT NULL,
            conclusions TEXT NOT NULL,
            quiz_performance TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'draft',
            generated_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def row_to_report(row):
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "experiment_id": row["experiment_id"],
        "title": row["title"],
        "subject": row["subject"],
        "objective": row["objective"],
        "procedure": row["procedure"],
        "observations": row["observations"],
        "results": row["results"],
        "conclusions": row["conclusions"],
        "quiz_performance": row["quiz_performance"],
        "status": row["status"],
        "generated_at": row["generated_at"],
        "updated_at": row["updated_at"],
    }


def get_experiment_detail(experiment_id: str):
    return EXPERIMENT_DETAILS.get(
        experiment_id,
        {
            "title": experiment_id.replace("-", " ").title(),
            "subject": "science",
            "objective": "To complete the virtual experiment and document observations, results, and conclusions.",
            "procedure": "Perform the virtual experiment, record observations, complete the quiz, and summarize learning outcomes.",
        },
    )


def build_quiz_performance(user_id: str, experiment_id: str):
    attempts = gamification_service.get_quiz_attempts(user_id, experiment_id)
    if not attempts:
        return "Quiz not attempted yet."

    latest = attempts[0]
    best = max(attempts, key=lambda item: item["score"])
    return (
        f"Latest score: {latest['score']}/{latest['total_questions']} ({latest['percentage']}%). "
        f"Best score: {best['score']}/{best['total_questions']}. "
        f"Total attempts: {len(attempts)}."
    )


def build_results(user_id: str, experiment_id: str, notes):
    progress = progress_service.get_user_experiment_progress(user_id)
    matching = next((item for item in progress if item["experiment_id"] == experiment_id), None)
    completion = "Completed" if matching and matching["completed"] else "Not marked complete"
    quiz_summary = build_quiz_performance(user_id, experiment_id)
    learning = notes.get("learnings") if notes else ""
    if learning:
        return f"{completion}. Key learning: {learning}\n\n{quiz_summary}"
    return f"{completion}.\n\n{quiz_summary}"


def create_report(user_id: str, experiment_id: str):
    init_db()
    detail = get_experiment_detail(experiment_id)
    notes = notes_service.get_user_experiment_notes(user_id, experiment_id) or {}
    now = datetime.now(timezone.utc).isoformat()

    payload = {
        "user_id": user_id,
        "experiment_id": experiment_id,
        "title": detail["title"],
        "subject": detail["subject"],
        "objective": detail["objective"],
        "procedure": detail["procedure"],
        "observations": notes.get("observations") or "No observations recorded yet.",
        "results": build_results(user_id, experiment_id, notes),
        "conclusions": notes.get("conclusions") or "Conclusion draft pending student review.",
        "quiz_performance": build_quiz_performance(user_id, experiment_id),
        "status": "draft",
        "generated_at": now,
        "updated_at": now,
    }

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO lab_reports (
            user_id, experiment_id, title, subject, objective, procedure,
            observations, results, conclusions, quiz_performance, status,
            generated_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload["user_id"],
            payload["experiment_id"],
            payload["title"],
            payload["subject"],
            payload["objective"],
            payload["procedure"],
            payload["observations"],
            payload["results"],
            payload["conclusions"],
            payload["quiz_performance"],
            payload["status"],
            payload["generated_at"],
            payload["updated_at"],
        ),
    )
    report_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return get_report(user_id, report_id)


def get_reports(user_id: str):
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT * FROM lab_reports
        WHERE user_id = ?
        ORDER BY updated_at DESC
        """,
        (user_id,),
    )
    rows = cursor.fetchall()
    conn.close()
    return [row_to_report(row) for row in rows]


def get_report(user_id: str, report_id: int):
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT * FROM lab_reports
        WHERE user_id = ? AND id = ?
        """,
        (user_id, report_id),
    )
    row = cursor.fetchone()
    conn.close()
    return row_to_report(row) if row else None


def update_report(report_id: int, payload: dict):
    init_db()
    allowed_fields = [
        "title",
        "objective",
        "procedure",
        "observations",
        "results",
        "conclusions",
        "quiz_performance",
        "status",
    ]
    updates = {key: value for key, value in payload.items() if key in allowed_fields and value is not None}
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    set_clause = ", ".join(f"{key} = ?" for key in updates)
    values = list(updates.values()) + [report_id]

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(f"UPDATE lab_reports SET {set_clause} WHERE id = ?", values)
    conn.commit()
    cursor.execute("SELECT user_id FROM lab_reports WHERE id = ?", (report_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None
    return get_report(row["user_id"], report_id)


def to_markdown(report):
    return "\n".join(
        [
            f"# {report['title']}",
            "",
            f"**Subject:** {report['subject'].title()}",
            f"**Experiment ID:** {report['experiment_id']}",
            f"**Generated At:** {report['generated_at']}",
            f"**Status:** {report['status'].title()}",
            "",
            "## Objective",
            report["objective"],
            "",
            "## Procedure",
            report["procedure"],
            "",
            "## Observations",
            report["observations"],
            "",
            "## Results",
            report["results"],
            "",
            "## Conclusions",
            report["conclusions"],
            "",
            "## Quiz Performance",
            report["quiz_performance"],
            "",
        ]
    )


def export_markdown(user_id: str, report_id: int) -> Optional[str]:
    report = get_report(user_id, report_id)
    if not report:
        return None
    return to_markdown(report)
