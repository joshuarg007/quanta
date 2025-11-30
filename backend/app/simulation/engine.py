"""
QUANTA Quantum Simulation Engine
Powered by Qiskit
"""
from typing import List, Dict, Any, Optional
import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector


class QuantumSimulator:
    """Quantum circuit simulator using Qiskit."""

    def __init__(self, max_qubits: int = 16):
        self.max_qubits = max_qubits
        self.statevector_sim = AerSimulator(method='statevector')
        self.qasm_sim = AerSimulator(method='automatic')

    def _build_circuit(self, num_qubits: int, gates: List[Any]) -> QuantumCircuit:
        """Build a Qiskit circuit from gate list."""
        qc = QuantumCircuit(num_qubits, num_qubits)

        # Sort gates by step
        sorted_gates = sorted(gates, key=lambda g: g.step if hasattr(g, 'step') else g.get('step', 0))

        for gate in sorted_gates:
            # Handle both Pydantic models and dicts
            gate_type = gate.type if hasattr(gate, 'type') else gate.get('type')
            qubit = gate.qubit if hasattr(gate, 'qubit') else gate.get('qubit')
            control = gate.controlQubit if hasattr(gate, 'controlQubit') else gate.get('controlQubit')
            control2 = gate.controlQubit2 if hasattr(gate, 'controlQubit2') else gate.get('controlQubit2')
            param = gate.parameter if hasattr(gate, 'parameter') else gate.get('parameter')

            self._apply_gate(qc, gate_type, qubit, control, control2, param)

        return qc

    def _apply_gate(
        self,
        qc: QuantumCircuit,
        gate_type: str,
        qubit: int,
        control: Optional[int],
        control2: Optional[int],
        param: Optional[float],
    ):
        """Apply a gate to the circuit."""
        if gate_type == 'H':
            qc.h(qubit)
        elif gate_type == 'X':
            qc.x(qubit)
        elif gate_type == 'Y':
            qc.y(qubit)
        elif gate_type == 'Z':
            qc.z(qubit)
        elif gate_type == 'S':
            qc.s(qubit)
        elif gate_type == 'T':
            qc.t(qubit)
        elif gate_type == 'RX':
            qc.rx(param or np.pi / 4, qubit)
        elif gate_type == 'RY':
            qc.ry(param or np.pi / 4, qubit)
        elif gate_type == 'RZ':
            qc.rz(param or np.pi / 4, qubit)
        elif gate_type == 'CNOT':
            if control is not None:
                qc.cx(control, qubit)
            else:
                # Default: use previous qubit as control
                qc.cx(max(0, qubit - 1), qubit)
        elif gate_type == 'CZ':
            if control is not None:
                qc.cz(control, qubit)
            else:
                qc.cz(max(0, qubit - 1), qubit)
        elif gate_type == 'SWAP':
            target = control if control is not None else min(qubit + 1, qc.num_qubits - 1)
            qc.swap(qubit, target)
        elif gate_type == 'TOFFOLI':
            c1 = control if control is not None else 0
            c2 = control2 if control2 is not None else 1
            qc.ccx(c1, c2, qubit)
        elif gate_type == 'MEASURE':
            qc.measure(qubit, qubit)

    def get_statevector(self, num_qubits: int, gates: List[Any]) -> Dict[str, Any]:
        """Get the statevector after applying gates (no measurement)."""
        qc = self._build_circuit(num_qubits, gates)

        # Use Statevector for exact simulation
        sv = Statevector.from_instruction(qc)
        amplitudes = sv.data

        # Calculate probabilities
        probabilities = np.abs(amplitudes) ** 2

        return {
            "statevector": amplitudes.tolist(),
            "probabilities": probabilities.tolist(),
        }

    def simulate(
        self,
        num_qubits: int,
        gates: List[Any],
        shots: int = 1024,
    ) -> Dict[str, Any]:
        """Run full simulation with measurement."""
        qc = self._build_circuit(num_qubits, gates)

        # Get statevector first (before measurement)
        sv_result = self.get_statevector(num_qubits, gates)

        # Add measurement to all qubits
        qc_measure = qc.copy()
        qc_measure.measure_all()

        # Run measurement simulation
        job = self.qasm_sim.run(qc_measure, shots=shots)
        result = job.result()
        counts = result.get_counts()

        return {
            "statevector": sv_result["statevector"],
            "probabilities": sv_result["probabilities"],
            "measurements": counts,
        }

    def simulate_steps(self, num_qubits: int, gates: List[Any]) -> Dict[str, Any]:
        """Simulate circuit step-by-step, recording state after each step."""
        history = []

        # Initial state |00...0>
        initial_sv = Statevector.from_int(0, 2**num_qubits)
        history.append({
            "statevector": initial_sv.data.tolist(),
            "probabilities": (np.abs(initial_sv.data) ** 2).tolist(),
        })

        # Group gates by step
        sorted_gates = sorted(gates, key=lambda g: g.step if hasattr(g, 'step') else g.get('step', 0))
        steps: Dict[int, List[Any]] = {}
        for gate in sorted_gates:
            step = gate.step if hasattr(gate, 'step') else gate.get('step', 0)
            if step not in steps:
                steps[step] = []
            steps[step].append(gate)

        # Build and simulate incrementally
        current_gates = []
        for step in sorted(steps.keys()):
            current_gates.extend(steps[step])
            state = self.get_statevector(num_qubits, current_gates)
            history.append(state)

        return {"history": history}
