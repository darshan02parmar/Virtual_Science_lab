import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

APP_NAME = "Virtual Science Lab Backend"
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# MongoDB connection string — set this in Vercel dashboard:
# Settings → Environment Variables → MONGODB_URI
MONGODB_URI = os.getenv("MONGODB_URI", "")

if not MONGODB_URI:
    raise RuntimeError(
        "MONGODB_URI environment variable is not set. "
        "Add it in Vercel → Settings → Environment Variables."
    )