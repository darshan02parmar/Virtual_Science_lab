import os
import sqlite3
from datetime import datetime, timezone
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "gamification.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS experiment_progress (
            user_id TEXT NOT NULL,
            experiment_id TEXT NOT NULL,
            subject TEXT NOT NULL,
            title TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            completion_date TEXT,
            score INTEGER,
            PRIMARY KEY (user_id, experiment_id)
        )
        """
    )
    conn.commit()
    conn.close()


def get_user_experiment_progress(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT user_id, experiment_id, subject, title, completed, completion_date, score
        FROM experiment_progress
        WHERE user_id = ?
        ORDER BY completion_date DESC
        """,
        (user_id,),
    )
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "user_id": row["user_id"],
            "experiment_id": row["experiment_id"],
            "subject": row["subject"],
            "title": row["title"],
            "completed": bool(row["completed"]),
            "completion_date": row["completion_date"],
            "score": row["score"],
        }
        for row in rows
    ]


def upsert_experiment_progress(
    user_id: str,
    experiment_id: str,
    subject: str,
    title: str,
    completed: bool,
    score: Optional[int] = None,
):
    completion_date = datetime.now(timezone.utc).isoformat() if completed else None

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO experiment_progress (
            user_id, experiment_id, subject, title, completed, completion_date, score
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, experiment_id) DO UPDATE SET
            subject = excluded.subject,
            title = excluded.title,
            completed = excluded.completed,
            completion_date = CASE
                WHEN excluded.completed = 1 THEN COALESCE(experiment_progress.completion_date, excluded.completion_date)
                ELSE NULL
            END,
            score = COALESCE(excluded.score, experiment_progress.score)
        """,
        (
            user_id,
            experiment_id,
            subject,
            title,
            1 if completed else 0,
            completion_date,
            score,
        ),
    )
    conn.commit()
    conn.close()

    return get_user_experiment_progress(user_id)
