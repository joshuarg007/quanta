"""
Circuit storage API endpoints.

Cost Control: Circuit count is limited per organization.
- check_circuit_limit() before creating
- increment_circuit_count() after creating
- decrement_circuit_count() after deleting
"""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Circuit as CircuitModel, User, Organization
from app.core.security import get_current_user_required, get_current_approved_user
from app.core.plans import (
    check_circuit_limit,
    increment_circuit_count,
    decrement_circuit_count,
    LimitExceededError,
)

router = APIRouter()


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class GateSchema(BaseModel):
    id: str
    type: str
    qubit: int
    controlQubit: Optional[int] = None
    controlQubit2: Optional[int] = None
    parameter: Optional[float] = None
    step: int


class CircuitCreate(BaseModel):
    name: str
    description: Optional[str] = None
    numQubits: int
    gates: List[GateSchema]


class CircuitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    numQubits: Optional[int] = None
    gates: Optional[List[GateSchema]] = None
    is_public: Optional[bool] = None
    is_org_shared: Optional[bool] = None


class CircuitResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    num_qubits: int
    gates: List[dict]
    is_public: bool
    is_org_shared: bool
    user_id: int
    organization_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.post("/circuits", response_model=CircuitResponse, status_code=status.HTTP_201_CREATED)
def create_circuit(
    data: CircuitCreate,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """
    Create a new circuit.

    Cost Control: Enforces circuit limit per organization.
    Raises 429 if limit exceeded.
    """
    # Get organization
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not org:
        raise HTTPException(status_code=500, detail="Organization not found")

    # COST CONTROL: Check circuit limit BEFORE creating
    try:
        check_circuit_limit(org)
    except LimitExceededError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=e.message,
        )

    # Create circuit
    circuit = CircuitModel(
        name=data.name,
        description=data.description,
        num_qubits=data.numQubits,
        gates=[g.model_dump() for g in data.gates],
        user_id=user.id,
        organization_id=user.organization_id,
    )
    db.add(circuit)

    # COST CONTROL: Increment count
    increment_circuit_count(db, org)

    db.commit()
    db.refresh(circuit)

    return CircuitResponse(
        id=circuit.id,
        name=circuit.name,
        description=circuit.description,
        num_qubits=circuit.num_qubits,
        gates=circuit.gates,
        is_public=circuit.is_public,
        is_org_shared=circuit.is_org_shared,
        user_id=circuit.user_id,
        organization_id=circuit.organization_id,
        created_at=circuit.created_at,
        updated_at=circuit.updated_at,
    )


@router.get("/circuits", response_model=List[CircuitResponse])
def list_circuits(
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """
    List circuits accessible to the user.

    Returns:
    - User's own circuits
    - Org-shared circuits (if in same org)
    - Public circuits
    """
    # Get user's circuits + org-shared + public
    circuits = db.query(CircuitModel).filter(
        (CircuitModel.user_id == user.id) |
        ((CircuitModel.organization_id == user.organization_id) & (CircuitModel.is_org_shared == True)) |
        (CircuitModel.is_public == True)
    ).order_by(CircuitModel.updated_at.desc()).all()

    return [
        CircuitResponse(
            id=c.id,
            name=c.name,
            description=c.description,
            num_qubits=c.num_qubits,
            gates=c.gates,
            is_public=c.is_public,
            is_org_shared=c.is_org_shared,
            user_id=c.user_id,
            organization_id=c.organization_id,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in circuits
    ]


@router.get("/circuits/mine", response_model=List[CircuitResponse])
def list_my_circuits(
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """List only the current user's circuits."""
    circuits = db.query(CircuitModel).filter(
        CircuitModel.user_id == user.id
    ).order_by(CircuitModel.updated_at.desc()).all()

    return [
        CircuitResponse(
            id=c.id,
            name=c.name,
            description=c.description,
            num_qubits=c.num_qubits,
            gates=c.gates,
            is_public=c.is_public,
            is_org_shared=c.is_org_shared,
            user_id=c.user_id,
            organization_id=c.organization_id,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in circuits
    ]


@router.get("/circuits/{circuit_id}", response_model=CircuitResponse)
def get_circuit(
    circuit_id: int,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """Get a specific circuit (if accessible)."""
    circuit = db.query(CircuitModel).filter(CircuitModel.id == circuit_id).first()

    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit not found")

    # Check access: owner, org-shared, or public
    has_access = (
        circuit.user_id == user.id or
        (circuit.organization_id == user.organization_id and circuit.is_org_shared) or
        circuit.is_public
    )

    if not has_access:
        raise HTTPException(status_code=403, detail="Access denied")

    return CircuitResponse(
        id=circuit.id,
        name=circuit.name,
        description=circuit.description,
        num_qubits=circuit.num_qubits,
        gates=circuit.gates,
        is_public=circuit.is_public,
        is_org_shared=circuit.is_org_shared,
        user_id=circuit.user_id,
        organization_id=circuit.organization_id,
        created_at=circuit.created_at,
        updated_at=circuit.updated_at,
    )


@router.put("/circuits/{circuit_id}", response_model=CircuitResponse)
def update_circuit(
    circuit_id: int,
    data: CircuitUpdate,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """Update a circuit (owner only)."""
    circuit = db.query(CircuitModel).filter(
        CircuitModel.id == circuit_id,
        CircuitModel.user_id == user.id,  # Must be owner
    ).first()

    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit not found or access denied")

    # Update fields
    if data.name is not None:
        circuit.name = data.name
    if data.description is not None:
        circuit.description = data.description
    if data.numQubits is not None:
        circuit.num_qubits = data.numQubits
    if data.gates is not None:
        circuit.gates = [g.model_dump() for g in data.gates]
    if data.is_public is not None:
        circuit.is_public = data.is_public
    if data.is_org_shared is not None:
        circuit.is_org_shared = data.is_org_shared

    circuit.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(circuit)

    return CircuitResponse(
        id=circuit.id,
        name=circuit.name,
        description=circuit.description,
        num_qubits=circuit.num_qubits,
        gates=circuit.gates,
        is_public=circuit.is_public,
        is_org_shared=circuit.is_org_shared,
        user_id=circuit.user_id,
        organization_id=circuit.organization_id,
        created_at=circuit.created_at,
        updated_at=circuit.updated_at,
    )


@router.delete("/circuits/{circuit_id}")
def delete_circuit(
    circuit_id: int,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """
    Delete a circuit (owner only).

    Cost Control: Decrements circuit count for organization.
    """
    circuit = db.query(CircuitModel).filter(
        CircuitModel.id == circuit_id,
        CircuitModel.user_id == user.id,  # Must be owner
    ).first()

    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit not found or access denied")

    # Get organization for count update
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()

    db.delete(circuit)

    # COST CONTROL: Decrement count
    if org:
        decrement_circuit_count(db, org)

    db.commit()

    return {"status": "deleted", "id": circuit_id}


@router.post("/circuits/{circuit_id}/share")
def toggle_circuit_sharing(
    circuit_id: int,
    is_public: bool = False,
    is_org_shared: bool = False,
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """Toggle sharing settings for a circuit (owner only)."""
    circuit = db.query(CircuitModel).filter(
        CircuitModel.id == circuit_id,
        CircuitModel.user_id == user.id,
    ).first()

    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit not found or access denied")

    circuit.is_public = is_public
    circuit.is_org_shared = is_org_shared
    circuit.updated_at = datetime.utcnow()
    db.commit()

    return {
        "id": circuit_id,
        "is_public": circuit.is_public,
        "is_org_shared": circuit.is_org_shared,
    }
