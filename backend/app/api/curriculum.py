"""Curriculum API endpoints."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from ..curriculum.content import get_lesson_content, LESSON_CONTENT

router = APIRouter()

# In-memory progress storage (will be database in production)
user_progress: Dict[str, Dict[str, Any]] = {}


class LessonMeta(BaseModel):
    id: str
    title: str
    track: str
    description: str
    difficulty: str
    duration: int
    prerequisites: List[str]


class LessonSection(BaseModel):
    type: str  # 'text', 'circuit', 'exercise', 'quiz'
    content: Dict[str, Any]


class LessonFull(BaseModel):
    id: str
    title: str
    track: str
    sections: List[LessonSection]


class ProgressUpdate(BaseModel):
    sectionIndex: int
    completed: bool
    quizAnswer: Optional[int] = None
    quizCorrect: Optional[bool] = None


# Lesson metadata for listing
LESSON_META = {
    "qubits": {
        "id": "qubits",
        "title": "What is a Qubit?",
        "track": "fundamentals",
        "description": "Understanding the quantum bit - the fundamental unit of quantum information",
        "difficulty": "beginner",
        "duration": 15,
        "prerequisites": []
    },
    "superposition": {
        "id": "superposition",
        "title": "Superposition",
        "track": "fundamentals",
        "description": "Being in multiple states at once - the power of quantum parallelism",
        "difficulty": "beginner",
        "duration": 20,
        "prerequisites": ["qubits"]
    },
    "measurement": {
        "id": "measurement",
        "title": "Measurement",
        "track": "fundamentals",
        "description": "Observing quantum states and the collapse of superposition",
        "difficulty": "beginner",
        "duration": 15,
        "prerequisites": ["superposition"]
    },
    "entanglement": {
        "id": "entanglement",
        "title": "Entanglement",
        "track": "fundamentals",
        "description": "Spooky action at a distance - correlated quantum states",
        "difficulty": "intermediate",
        "duration": 25,
        "prerequisites": ["measurement"]
    },
    "pauli-gates": {
        "id": "pauli-gates",
        "title": "Pauli Gates (X, Y, Z)",
        "track": "gates",
        "description": "Rotations around the Bloch sphere axes",
        "difficulty": "beginner",
        "duration": 20,
        "prerequisites": ["qubits"]
    },
    "hadamard": {
        "id": "hadamard",
        "title": "The Hadamard Gate",
        "track": "gates",
        "description": "Creating superposition with the H gate",
        "difficulty": "beginner",
        "duration": 15,
        "prerequisites": ["pauli-gates", "superposition"]
    },
    "cnot": {
        "id": "cnot",
        "title": "CNOT and Entanglement",
        "track": "gates",
        "description": "Two-qubit operations and creating entanglement",
        "difficulty": "intermediate",
        "duration": 25,
        "prerequisites": ["hadamard", "entanglement"]
    },
    "rotation-gates": {
        "id": "rotation-gates",
        "title": "Rotation Gates",
        "track": "gates",
        "description": "Precise control with RX, RY, RZ",
        "difficulty": "intermediate",
        "duration": 30,
        "prerequisites": ["pauli-gates"]
    },
    "deutsch-jozsa": {
        "id": "deutsch-jozsa",
        "title": "Deutsch-Jozsa Algorithm",
        "track": "algorithms",
        "description": "Your first quantum speedup",
        "difficulty": "intermediate",
        "duration": 30,
        "prerequisites": ["cnot"]
    },
    "grover": {
        "id": "grover",
        "title": "Grover's Search Algorithm",
        "track": "algorithms",
        "description": "Quadratic speedup for unstructured search",
        "difficulty": "advanced",
        "duration": 45,
        "prerequisites": ["deutsch-jozsa"]
    }
}


@router.get("/curriculum/lessons")
async def list_lessons() -> List[LessonMeta]:
    """Get all available lessons with metadata."""
    return list(LESSON_META.values())


@router.get("/curriculum/lessons/{lesson_id}")
async def get_lesson(lesson_id: str) -> LessonFull:
    """Get full lesson content."""
    content = get_lesson_content(lesson_id)
    if not content:
        raise HTTPException(status_code=404, detail="Lesson not found")

    return LessonFull(
        id=content["id"],
        title=content["title"],
        track=content["track"],
        sections=[LessonSection(type=s["type"], content=s["content"]) for s in content["sections"]]
    )


@router.get("/curriculum/tracks")
async def get_tracks():
    """Get lessons organized by track."""
    tracks = {
        "fundamentals": {
            "id": "fundamentals",
            "title": "Quantum Fundamentals",
            "description": "Master the building blocks of quantum computing",
            "lessons": []
        },
        "gates": {
            "id": "gates",
            "title": "Quantum Gates",
            "description": "Learn the operations that manipulate qubits",
            "lessons": []
        },
        "algorithms": {
            "id": "algorithms",
            "title": "Quantum Algorithms",
            "description": "Solve problems with quantum advantage",
            "lessons": []
        }
    }

    for lesson in LESSON_META.values():
        track = lesson["track"]
        if track in tracks:
            tracks[track]["lessons"].append(lesson)

    return list(tracks.values())


@router.get("/curriculum/progress")
async def get_progress(user_id: str = "anonymous"):
    """Get user's lesson progress."""
    return user_progress.get(user_id, {})


@router.post("/curriculum/progress/{lesson_id}")
async def update_progress(lesson_id: str, update: ProgressUpdate, user_id: str = "anonymous"):
    """Update progress for a specific lesson section."""
    if lesson_id not in LESSON_META:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if user_id not in user_progress:
        user_progress[user_id] = {}

    if lesson_id not in user_progress[user_id]:
        user_progress[user_id][lesson_id] = {
            "started": True,
            "completed": False,
            "sections": {},
            "quizScores": {}
        }

    progress = user_progress[user_id][lesson_id]
    progress["sections"][str(update.sectionIndex)] = update.completed

    if update.quizAnswer is not None:
        progress["quizScores"][str(update.sectionIndex)] = {
            "answer": update.quizAnswer,
            "correct": update.quizCorrect
        }

    # Check if all sections completed
    content = get_lesson_content(lesson_id)
    if content:
        total_sections = len(content["sections"])
        completed_sections = sum(1 for v in progress["sections"].values() if v)
        progress["completed"] = completed_sections >= total_sections

    return {"status": "updated", "progress": progress}


@router.post("/curriculum/progress/{lesson_id}/complete")
async def mark_complete(lesson_id: str, user_id: str = "anonymous"):
    """Mark a lesson as complete."""
    if lesson_id not in LESSON_META:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if user_id not in user_progress:
        user_progress[user_id] = {}

    user_progress[user_id][lesson_id] = {
        "started": True,
        "completed": True,
        "sections": {},
        "quizScores": {}
    }

    return {"status": "completed", "lessonId": lesson_id}
