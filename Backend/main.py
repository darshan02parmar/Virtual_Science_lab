from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.chatbot import router as chatbot_router   # ← NEW
from app.api.gamification import router as gamification_router
from app.api.progress import router as progress_router
from app.api.notes import router as notes_router
from app.api.reports import router as reports_router
from app.api.recommendations import router as recommendations_router
from app.api.sync import router as sync_router


app = FastAPI(
    title="Virtual Science Lab Backend",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "https://virtual-science-lab-pearl.vercel.app",
    "https://virtual-science-lab-nu.vercel.app",   # ← add this
    "http://localhost:5173"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(chatbot_router)   # ← NEW  (mounts at /api/chatbot/ask)
app.include_router(gamification_router)
app.include_router(progress_router)
app.include_router(notes_router)
app.include_router(reports_router)
app.include_router(recommendations_router)
app.include_router(sync_router)


@app.get("/")
def root():
    return {"status": "Backend is running 🚀"}

