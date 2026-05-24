from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.gamification import router as gamification_router
from app.api.progress import router as progress_router
from app.api.notes import router as notes_router
from app.api.recommendations import router as recommendations_router


app = FastAPI(
    title="Virtual Science Lab Backend",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://virtual-science-lab-pearl.vercel.app/",
    "http://localhost:5173"  #for local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(gamification_router)
app.include_router(progress_router)
app.include_router(notes_router)
app.include_router(recommendations_router)


@app.get("/")
def root():
    return {"status": "Backend is running 🚀"}

