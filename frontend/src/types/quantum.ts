// Quantum computing type definitions for QUANTA

// Supported quantum gates
export type GateType =
  | 'H'      // Hadamard
  | 'X'      // Pauli-X (NOT)
  | 'Y'      // Pauli-Y
  | 'Z'      // Pauli-Z
  | 'S'      // Phase gate
  | 'T'      // T gate
  | 'RX'     // Rotation X
  | 'RY'     // Rotation Y
  | 'RZ'     // Rotation Z
  | 'CNOT'   // Controlled-NOT
  | 'CZ'     // Controlled-Z
  | 'SWAP'   // Swap
  | 'TOFFOLI' // Toffoli (CCX)
  | 'MEASURE'; // Measurement

// A gate placed on the circuit
export interface Gate {
  id: string;
  type: GateType;
  qubit: number;           // Target qubit
  controlQubit?: number;   // For controlled gates
  controlQubit2?: number;  // For Toffoli
  parameter?: number;      // For rotation gates (in radians)
  step: number;            // Time step in circuit
}

// Circuit definition
export interface QuantumCircuit {
  id: string;
  name: string;
  description?: string;
  numQubits: number;
  gates: Gate[];
  createdAt: string;
  updatedAt: string;
}

// Complex number representation
export interface Complex {
  real: number;
  imag: number;
}

// Quantum state (state vector)
export interface QuantumState {
  numQubits: number;
  amplitudes: Complex[];  // 2^n complex amplitudes
  probabilities: number[]; // |amplitude|^2 for each basis state
}

// Simulation result
export interface SimulationResult {
  circuitId: string;
  finalState: QuantumState;
  measurements?: Record<string, number>; // basis state -> count
  stateHistory?: QuantumState[]; // State after each step (for visualization)
  executionTime: number; // milliseconds
}

// Bloch sphere representation (for single qubit visualization)
export interface BlochCoordinates {
  x: number; // <X> expectation
  y: number; // <Y> expectation
  z: number; // <Z> expectation
  theta: number; // polar angle
  phi: number;   // azimuthal angle
}

// Gate metadata for UI
export interface GateInfo {
  type: GateType;
  name: string;
  description: string;
  numQubits: 1 | 2 | 3;
  hasParameter: boolean;
  symbol: string;
  color: string;
}

// Gate definitions
export const GATE_INFO: Record<GateType, GateInfo> = {
  H: {
    type: 'H',
    name: 'Hadamard',
    description: 'Creates superposition. Maps |0⟩ to (|0⟩+|1⟩)/√2',
    numQubits: 1,
    hasParameter: false,
    symbol: 'H',
    color: '#3b82f6',
  },
  X: {
    type: 'X',
    name: 'Pauli-X',
    description: 'Quantum NOT gate. Flips |0⟩ ↔ |1⟩',
    numQubits: 1,
    hasParameter: false,
    symbol: 'X',
    color: '#ef4444',
  },
  Y: {
    type: 'Y',
    name: 'Pauli-Y',
    description: 'Rotation around Y-axis by π',
    numQubits: 1,
    hasParameter: false,
    symbol: 'Y',
    color: '#22c55e',
  },
  Z: {
    type: 'Z',
    name: 'Pauli-Z',
    description: 'Phase flip. Maps |1⟩ to -|1⟩',
    numQubits: 1,
    hasParameter: false,
    symbol: 'Z',
    color: '#a855f7',
  },
  S: {
    type: 'S',
    name: 'S Gate',
    description: 'Phase gate (π/2 rotation around Z)',
    numQubits: 1,
    hasParameter: false,
    symbol: 'S',
    color: '#f97316',
  },
  T: {
    type: 'T',
    name: 'T Gate',
    description: 'π/8 gate (π/4 rotation around Z)',
    numQubits: 1,
    hasParameter: false,
    symbol: 'T',
    color: '#eab308',
  },
  RX: {
    type: 'RX',
    name: 'Rotation X',
    description: 'Rotation around X-axis by θ radians',
    numQubits: 1,
    hasParameter: true,
    symbol: 'Rx',
    color: '#ec4899',
  },
  RY: {
    type: 'RY',
    name: 'Rotation Y',
    description: 'Rotation around Y-axis by θ radians',
    numQubits: 1,
    hasParameter: true,
    symbol: 'Ry',
    color: '#14b8a6',
  },
  RZ: {
    type: 'RZ',
    name: 'Rotation Z',
    description: 'Rotation around Z-axis by θ radians',
    numQubits: 1,
    hasParameter: true,
    symbol: 'Rz',
    color: '#8b5cf6',
  },
  CNOT: {
    type: 'CNOT',
    name: 'CNOT',
    description: 'Controlled-NOT. Flips target if control is |1⟩',
    numQubits: 2,
    hasParameter: false,
    symbol: '⊕',
    color: '#06b6d4',
  },
  CZ: {
    type: 'CZ',
    name: 'Controlled-Z',
    description: 'Applies Z to target if control is |1⟩',
    numQubits: 2,
    hasParameter: false,
    symbol: 'CZ',
    color: '#6366f1',
  },
  SWAP: {
    type: 'SWAP',
    name: 'SWAP',
    description: 'Swaps the states of two qubits',
    numQubits: 2,
    hasParameter: false,
    symbol: '×',
    color: '#84cc16',
  },
  TOFFOLI: {
    type: 'TOFFOLI',
    name: 'Toffoli',
    description: 'CCX gate. Flips target if both controls are |1⟩',
    numQubits: 3,
    hasParameter: false,
    symbol: 'CCX',
    color: '#f43f5e',
  },
  MEASURE: {
    type: 'MEASURE',
    name: 'Measure',
    description: 'Measures qubit in computational basis',
    numQubits: 1,
    hasParameter: false,
    symbol: 'M',
    color: '#64748b',
  },
};
