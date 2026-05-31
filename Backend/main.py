from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.chatbot import router as chatbot_router
from app.api.gamification import router as gamification_router
from app.api.progress import router as progress_router
from app.api.notes import router as notes_router
from app.api.reports import router as reports_router
from app.api.recommendations import router as recommendations_router
from app.api.sync import router as sync_router
from app.api.careers import router as careers_router
from app.api.notebook import router as notebook_router
from app.api.predictions import router as predictions_router

app = FastAPI(
    title="Virtual Science Lab Backend",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://virtual-science-lab-pearl.vercel.app",
        "https://virtual-science-lab-nu.vercel.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(chatbot_router)
app.include_router(gamification_router)
app.include_router(progress_router)
app.include_router(notes_router)
app.include_router(reports_router)
app.include_router(recommendations_router)
app.include_router(sync_router)
app.include_router(careers_router)
app.include_router(notebook_router)
app.include_router(predictions_router)

@app.get("/")
def root():
    return {"status": "Backend is running 🚀"}