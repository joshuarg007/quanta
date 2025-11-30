"""Circuit storage API endpoints (placeholder for future database integration)."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

router = APIRouter()

# In-memory storage (will be replaced with database)
circuits_db: Dict[str, dict] = {}


class Gate(BaseModel):
    id: str
    type: str
    qubit: int
    controlQubit: Optional[int] = None
    controlQubit2: Optional[int] = None
    parameter: Optional[float] = None
    step: int


class Circuit(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    numQubits: int
    gates: List[Gate]
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


@router.post("/circuits", response_model=Circuit)
async def save_circuit(circuit: Circuit):
    """Save a circuit."""
    now = datetime.utcnow().isoformat()
    circuit_data = circuit.model_dump()
    circuit_data["createdAt"] = circuit_data.get("createdAt") or now
    circuit_data["updatedAt"] = now
    circuits_db[circuit.id] = circuit_data
    return circuit_data


@router.get("/circuits", response_model=List[Circuit])
async def list_circuits():
    """List all saved circuits."""
    return list(circuits_db.values())


@router.get("/circuits/{circuit_id}", response_model=Circuit)
async def get_circuit(circuit_id: str):
    """Get a specific circuit."""
    if circuit_id not in circuits_db:
        raise HTTPException(status_code=404, detail="Circuit not found")
    return circuits_db[circuit_id]


@router.delete("/circuits/{circuit_id}")
async def delete_circuit(circuit_id: str):
    """Delete a circuit."""
    if circuit_id not in circuits_db:
        raise HTTPException(status_code=404, detail="Circuit not found")
    del circuits_db[circuit_id]
    return {"status": "deleted"}


@router.post("/circuits/{circuit_id}/share")
async def share_circuit(circuit_id: str):
    """Generate a share link for a circuit."""
    if circuit_id not in circuits_db:
        raise HTTPException(status_code=404, detail="Circuit not found")
    # In production, this would generate a unique share token
    return {"shareUrl": f"/shared/{circuit_id}"}
