import sys
import os

# Add BOTH the repo root AND the Backend folder to sys.path
# Repo root  → lets Python find the 'Backend' package
# Backend/   → lets Backend/main.py do 'from app.api.routes import router'
repo_root = os.path.join(os.path.dirname(__file__), "..")
backend_dir = os.path.join(repo_root, "Backend")

sys.path.insert(0, os.path.abspath(repo_root))
sys.path.insert(0, os.path.abspath(backend_dir))

from Backend.main import app  # noqa: F401