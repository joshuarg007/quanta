"""Simulation API endpoints."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import time

from app.simulation.engine import QuantumSimulator
from app.config import settings

router = APIRouter()


# Request/Response models
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


@router.post("/simulate", response_model=SimulationResult)
async def simulate_circuit(request: SimulationRequest):
    """Run a full circuit simulation with measurement."""
    if request.circuit.numQubits > settings.max_qubits:
        raise HTTPException(
            status_code=400,
            detail=f"Circuit exceeds maximum qubit limit ({settings.max_qubits})"
        )

    start_time = time.time()

    try:
        result = simulator.simulate(
            num_qubits=request.circuit.numQubits,
            gates=request.circuit.gates,
            shots=request.shots,
        )
        execution_time = (time.time() - start_time) * 1000  # ms

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
async def simulate_statevector(request: SimulationRequest):
    """Get the statevector without measurement."""
    if request.circuit.numQubits > settings.max_qubits:
        raise HTTPException(
            status_code=400,
            detail=f"Circuit exceeds maximum qubit limit ({settings.max_qubits})"
        )

    start_time = time.time()

    try:
        result = simulator.get_statevector(
            num_qubits=request.circuit.numQubits,
            gates=request.circuit.gates,
        )
        execution_time = (time.time() - start_time) * 1000

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
async def simulate_steps(request: SimulationRequest):
    """Simulate circuit step-by-step for visualization."""
    if request.circuit.numQubits > settings.max_qubits:
        raise HTTPException(
            status_code=400,
            detail=f"Circuit exceeds maximum qubit limit ({settings.max_qubits})"
        )

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
