from fastapi import APIRouter
from app.models.schemas import QueryRequest, QueryResponse
from app.services.logic import process_query

router = APIRouter(prefix="/api")

@router.post("/ask", response_model=QueryResponse)
def ask_question(data: QueryRequest):
    answer = process_query(data.question)
    return {"answer": answer}
# ---------------- BIOLOGY ----------------

@router.get("/biology/experiments")
def get_biology_experiments():
    return {
        "experiments": [
            {
                "id": 1,
                "title": "Human Body Anatomy",
                "description": "Explore full human body systems in 3D",
                "slug": "human-body"
            },
            {
                "id": 2,
                "title": "Mitochondria",
                "description": "Study the powerhouse of the cell",
                "slug": "mitochondria"
            },
            {
                "id": 3,
                "title": "Eye Anatomy",
                "description": "Understand structure and function of the eye",
                "slug": "eye"
            },
            {
                "id": 4,
                "title": "Kidney Anatomy",
                "description": "Learn how kidneys filter blood",
                "slug": "kidney"
            }
        ]
    }
# ---------------- CHEMISTRY ----------------
@router.get("/chemistry/experiments")
def get_chemistry_experiments():
    return {
        "experiments": [
            {
                "id": 1,
                "title": "Chemistry Equipment",
                "description": "Learn about laboratory apparatus",
                "slug": "chemistry-equipment"
            },
            {
                "id": 2,
                "title": "Volcano Experiment",
                "description": "Visualize a chemical reaction",
                "slug": "volcano-experiment"
            },
            {
                "id": 3,
                "title": "Condenser",
                "description": "Understand distillation apparatus",
                "slug": "condenser"
            },
            {
                "id": 4,
                "title": "Acid Base Neutralization",
                "description": "Observe how acids and bases react to form salt and water",
                "slug": "acid-base-neutralization"
            },
            {
                "id": 5,
                "title": "Acid-Base Titration",
                "description": "Simulation of an acid-base titration process",
                "slug": "titration-experiment"
            }
        ]
    }


# ---------------- PHYSICS ----------------
@router.get("/physics/experiments")
def get_physics_experiments():
    return {
        "experiments": [
            {
                "id": 1,
                "title": "Velocity & Acceleration",
                "description": "Understand motion concepts",
                "slug": "velocity-acceleration"
            },
            {
                "id": 2,
                "title": "Magnetic Field (Two Wires)",
                "description": "Interaction of magnetic fields",
                "slug": "magnetic-field-wires"
            },
            {
                "id": 3,
                "title": "Right-Hand Thumb Rule",
                "description": "Direction of magnetic field",
                "slug": "thumb-rule"
            },
            {
                "id": 4,
                "title": "Magnetic Field Direction",
                "description": "Field around straight conductor",
                "slug": "magnetic-field-direction"
            }
        ]
    }

