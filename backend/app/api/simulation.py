"""
Simulation API endpoints.

Cost Control: Simulation runs are limited per organization per month.
- check_simulation_limit() before running
- increment_simulation_count() after successful run
- Monthly counter resets automatically
"""
import time
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.simulation.engine import QuantumSimulator
from app.config import settings
from app.db.database import get_db
from app.db.models import User, Organization
from app.core.security import get_current_user, get_current_approved_user
from app.core.plans import (
    check_simulation_limit,
    increment_simulation_count,
    LimitExceededError,
)

router = APIRouter()


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class Gate(BaseModel):
    """Gate in a quantum circuit."""
    id: str
    type: str
    qubit: int
    controlQubit: Optional[int] = None
    controlQubit2: Optional[int] = None
    parameter: Optional[float] = None
    step: int


class Circuit(BaseModel):
    """Quantum circuit definition."""
    id: str
    name: str
    description: Optional[str] = None
    numQubits: int
    gates: List[Gate]


class SimulationRequest(BaseModel):
    """Request to simulate a circuit."""
    circuit: Circuit
    shots: int = 1024


class Complex(BaseModel):
    """Complex number representation."""
    real: float
    imag: float


class QuantumState(BaseModel):
    """Quantum state representation."""
    numQubits: int
    amplitudes: List[Complex]
    probabilities: List[float]


class SimulationResult(BaseModel):
    """Result of a simulation."""
    circuitId: str
    finalState: QuantumState
    measurements: Optional[dict] = None
    stateHistory: Optional[List[QuantumState]] = None
    executionTime: float


# Initialize simulator
simulator = QuantumSimulator(max_qubits=settings.max_qubits)


# =============================================================================
# HELPER: Check limits and increment count
# =============================================================================

def _check_and_increment_simulation(user: Optional[User], db: Session) -> Optional[Organization]:
    """
    Check simulation limit for user's org and prepare to increment.

    Returns org if authenticated (for incrementing after success).
    For unauthenticated users, a stricter global limit could be applied here.

    Cost Control: This is where we enforce the hard limit.
    """
    if not user:
        # Unauthenticated - could implement IP-based rate limiting here
        # For now, allow limited anonymous simulations (handled by rate limiting middleware)
        return None

    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not org:
        raise HTTPException(status_code=500, detail="Organization not found")

    # COST CONTROL: Check limit BEFORE running simulation
    try:
        check_simulation_limit(org)
    except LimitExceededError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=e.message,
        )

    return org


def _increment_simulation_count(org: Optional[Organization], db: Session) -> None:
    """Increment simulation count after successful run."""
    if org:
        increment_simulation_count(db, org)


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.post("/simulate", response_model=SimulationResult)
def simulate_circuit(
    request: SimulationRequest,
    user: Optional[User] = Depends(get_current_user),  # Optional auth
    db: Session = Depends(get_db),
):
    """
    Run a full circuit simulation with measurement.

    Cost Control: Counts against monthly simulation limit.
    """
    if request.circuit.numQubits > settings.max_qubits:
        raise HTTPException(
            status_code=400,
            detail=f"Circuit exceeds maximum qubit limit ({settings.max_qubits})"
        )

    # COST CONTROL: Check limit before running
    org = _check_and_increment_simulation(user, db)

    start_time = time.time()

    try:
        result = simulator.simulate(
            num_qubits=request.circuit.numQubits,
            gates=request.circuit.gates,
            shots=request.shots,
        )
        execution_time = (time.time() - start_time) * 1000  # ms

        # COST CONTROL: Increment count AFTER successful simulation
        _increment_simulation_count(org, db)

        return SimulationResult(
            circuitId=request.circuit.id,
            finalState=QuantumState(
                numQubits=request.circuit.numQubits,
                amplitudes=[Complex(real=a.real, imag=a.imag) for a in result["statevector"]],
                probabilities=result["probabilities"],
            ),
            measurements=result.get("measurements"),
            executionTime=execution_time,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/simulate/statevector", response_model=SimulationResult)
def simulate_statevector(
    request: SimulationRequest,
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the statevector without measurement.

    Cost Control: Counts against monthly simulation limit.
    """
    if request.circuit.numQubits > settings.max_qubits:
        raise HTTPException(
            status_code=400,
            detail=f"Circuit exceeds maximum qubit limit ({settings.max_qubits})"
        )

    # COST CONTROL: Check limit before running
    org = _check_and_increment_simulation(user, db)

    start_time = time.time()

    try:
        result = simulator.get_statevector(
            num_qubits=request.circuit.numQubits,
            gates=request.circuit.gates,
        )
        execution_time = (time.time() - start_time) * 1000

        # COST CONTROL: Increment count AFTER successful simulation
        _increment_simulation_count(org, db)

        return SimulationResult(
            circuitId=request.circuit.id,
            finalState=QuantumState(
                numQubits=request.circuit.numQubits,
                amplitudes=[Complex(real=a.real, imag=a.imag) for a in result["statevector"]],
                probabilities=result["probabilities"],
            ),
            executionTime=execution_time,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/simulate/steps", response_model=SimulationResult)
def simulate_steps(
    request: SimulationRequest,
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Simulate circuit step-by-step for visualization.

    Cost Control: Counts against monthly simulation limit.
    """
    if request.circuit.numQubits > settings.max_qubits:
        raise HTTPException(
            status_code=400,
            detail=f"Circuit exceeds maximum qubit limit ({settings.max_qubits})"
        )

    # COST CONTROL: Check limit before running
    org = _check_and_increment_simulation(user, db)

    start_time = time.time()

    try:
        result = simulator.simulate_steps(
            num_qubits=request.circuit.numQubits,
            gates=request.circuit.gates,
        )
        execution_time = (time.time() - start_time) * 1000

        # Convert state history
        state_history = [
            QuantumState(
                numQubits=request.circuit.numQubits,
                amplitudes=[Complex(real=a.real, imag=a.imag) for a in state["statevector"]],
                probabilities=state["probabilities"],
            )
            for state in result["history"]
        ]

        # COST CONTROL: Increment count AFTER successful simulation
        _increment_simulation_count(org, db)

        return SimulationResult(
            circuitId=request.circuit.id,
            finalState=state_history[-1] if state_history else QuantumState(
                numQubits=request.circuit.numQubits,
                amplitudes=[Complex(real=1.0, imag=0.0)] + [Complex(real=0.0, imag=0.0)] * (2**request.circuit.numQubits - 1),
                probabilities=[1.0] + [0.0] * (2**request.circuit.numQubits - 1),
            ),
            stateHistory=state_history,
            executionTime=execution_time,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# USAGE INFO ENDPOINT
# =============================================================================

@router.get("/simulate/usage")
def get_simulation_usage(
    user: User = Depends(get_current_approved_user),
    db: Session = Depends(get_db),
):
    """
    Get current simulation usage stats for the user's organization.
    """
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not org:
        raise HTTPException(status_code=500, detail="Organization not found")

    limit = org.simulation_runs_limit
    current = org.simulation_runs_this_month

    return {
        "current": current,
        "limit": limit if limit != -1 else "unlimited",
        "remaining": (limit - current) if limit > 0 else "unlimited",
        "percent_used": (current / limit * 100) if limit > 0 else 0,
        "resets_at": org.usage_month_reset.isoformat() if org.usage_month_reset else None,
    }
