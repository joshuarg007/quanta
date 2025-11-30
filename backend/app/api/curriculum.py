"""Curriculum API endpoints."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter()

# Lesson data (will be loaded from database/files in production)
LESSONS = [
    {
        "id": "qubits",
        "title": "What is a Qubit?",
        "description": "Understanding the quantum bit - the fundamental unit of quantum information",
        "category": "fundamentals",
        "difficulty": "beginner",
        "estimatedMinutes": 15,
        "prerequisites": [],
    },
    {
        "id": "superposition",
        "title": "Superposition",
        "description": "Being in multiple states at once - the power of quantum parallelism",
        "category": "fundamentals",
        "difficulty": "beginner",
        "estimatedMinutes": 20,
        "prerequisites": ["qubits"],
    },
    {
        "id": "measurement",
        "title": "Measurement",
        "description": "Observing quantum states and the collapse of superposition",
        "category": "fundamentals",
        "difficulty": "beginner",
        "estimatedMinutes": 15,
        "prerequisites": ["superposition"],
    },
    {
        "id": "entanglement",
        "title": "Entanglement",
        "description": "Spooky action at a distance - correlated quantum states",
        "category": "fundamentals",
        "difficulty": "intermediate",
        "estimatedMinutes": 25,
        "prerequisites": ["measurement"],
    },
    {
        "id": "pauli-gates",
        "title": "Pauli Gates (X, Y, Z)",
        "description": "Rotations around the Bloch sphere axes",
        "category": "gates",
        "difficulty": "beginner",
        "estimatedMinutes": 20,
        "prerequisites": ["qubits"],
    },
    {
        "id": "hadamard",
        "title": "The Hadamard Gate",
        "description": "Creating superposition with the H gate",
        "category": "gates",
        "difficulty": "beginner",
        "estimatedMinutes": 15,
        "prerequisites": ["pauli-gates", "superposition"],
    },
    {
        "id": "cnot",
        "title": "CNOT and Entanglement",
        "description": "Two-qubit operations and creating entanglement",
        "category": "gates",
        "difficulty": "intermediate",
        "estimatedMinutes": 25,
        "prerequisites": ["hadamard", "entanglement"],
    },
    {
        "id": "grover",
        "title": "Grover's Search Algorithm",
        "description": "Quadratic speedup for unstructured search",
        "category": "algorithms",
        "difficulty": "advanced",
        "estimatedMinutes": 45,
        "prerequisites": ["cnot"],
    },
]

# In-memory progress storage
user_progress: Dict[str, Dict[str, bool]] = {}


class Lesson(BaseModel):
    id: str
    title: str
    description: str
    category: str
    difficulty: str
    estimatedMinutes: int
    prerequisites: List[str]


class LessonSection(BaseModel):
    type: str  # 'text', 'circuit', 'exercise', 'quiz'
    content: Any


class LessonContent(BaseModel):
    id: str
    sections: List[LessonSection]


@router.get("/curriculum/lessons", response_model=List[Lesson])
async def list_lessons():
    """Get all available lessons."""
    return LESSONS


@router.get("/curriculum/lessons/{lesson_id}", response_model=LessonContent)
async def get_lesson(lesson_id: str):
    """Get lesson content."""
    lesson = next((l for l in LESSONS if l["id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Return placeholder content (will be loaded from files/database)
    return LessonContent(
        id=lesson_id,
        sections=[
            LessonSection(
                type="text",
                content={
                    "title": lesson["title"],
                    "body": f"Content for {lesson['title']} coming soon...",
                }
            ),
            LessonSection(
                type="circuit",
                content={
                    "description": "Try building a circuit with the concepts from this lesson",
                    "template": {"numQubits": 2, "gates": []},
                }
            ),
        ]
    )


@router.get("/curriculum/progress")
async def get_progress(user_id: str = "anonymous"):
    """Get user's lesson progress."""
    return user_progress.get(user_id, {})


@router.post("/curriculum/progress/{lesson_id}/complete")
async def mark_complete(lesson_id: str, user_id: str = "anonymous"):
    """Mark a lesson as complete."""
    lesson = next((l for l in LESSONS if l["id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if user_id not in user_progress:
        user_progress[user_id] = {}
    user_progress[user_id][lesson_id] = True

    return {"status": "completed", "lessonId": lesson_id}
