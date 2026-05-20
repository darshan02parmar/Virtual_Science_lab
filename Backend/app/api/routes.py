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
                "title": "Human Heart Anatomy",
                "description": "Study chambers, valves, and blood flow in the human heart"
            },
            {
                "id": 2,
                "title": "Plant Cell Structure",
                "description": "Explore nucleus, chloroplast, and cell wall in 3D"
            },
            {
                "id": 3,
                "title": "Respiratory System",
                "description": "Understand lungs, trachea, and breathing mechanism"
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

