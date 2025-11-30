// Circuit state management with Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Gate, GateType, QuantumCircuit, SimulationResult } from '../types/quantum';

interface CircuitState {
  // Current circuit
  circuit: QuantumCircuit;

  // Simulation results
  simulationResult: SimulationResult | null;
  isSimulating: boolean;

  // UI state
  selectedGate: GateType | null;
  hoveredStep: number | null;

  // Actions
  setNumQubits: (n: number) => void;
  addGate: (gate: Omit<Gate, 'id'>) => void;
  removeGate: (gateId: string) => void;
  updateGate: (gateId: string, updates: Partial<Gate>) => void;
  clearCircuit: () => void;
  loadCircuit: (circuit: QuantumCircuit) => void;

  setSelectedGate: (gate: GateType | null) => void;
  setHoveredStep: (step: number | null) => void;

  setSimulationResult: (result: SimulationResult | null) => void;
  setIsSimulating: (isSimulating: boolean) => void;

  // Circuit metadata
  setCircuitName: (name: string) => void;
  setCircuitDescription: (description: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const createEmptyCircuit = (): QuantumCircuit => ({
  id: generateId(),
  name: 'Untitled Circuit',
  description: '',
  numQubits: 4,
  gates: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useCircuitStore = create<CircuitState>()(
  persist(
    (set, get) => ({
      // Initial state
      circuit: createEmptyCircuit(),
      simulationResult: null,
      isSimulating: false,
      selectedGate: null,
      hoveredStep: null,

      // Qubit management
      setNumQubits: (n: number) => {
        const clampedN = Math.max(1, Math.min(16, n));
        set((state) => ({
          circuit: {
            ...state.circuit,
            numQubits: clampedN,
            // Remove gates that reference qubits beyond the new limit
            gates: state.circuit.gates.filter(
              (g) =>
                g.qubit < clampedN &&
                (g.controlQubit === undefined || g.controlQubit < clampedN) &&
                (g.controlQubit2 === undefined || g.controlQubit2 < clampedN)
            ),
            updatedAt: new Date().toISOString(),
          },
          simulationResult: null, // Clear results when circuit changes
        }));
      },

      // Gate management
      addGate: (gate) => {
        const newGate: Gate = { ...gate, id: generateId() };
        set((state) => ({
          circuit: {
            ...state.circuit,
            gates: [...state.circuit.gates, newGate],
            updatedAt: new Date().toISOString(),
          },
          simulationResult: null,
        }));
      },

      removeGate: (gateId) => {
        set((state) => ({
          circuit: {
            ...state.circuit,
            gates: state.circuit.gates.filter((g) => g.id !== gateId),
            updatedAt: new Date().toISOString(),
          },
          simulationResult: null,
        }));
      },

      updateGate: (gateId, updates) => {
        set((state) => ({
          circuit: {
            ...state.circuit,
            gates: state.circuit.gates.map((g) =>
              g.id === gateId ? { ...g, ...updates } : g
            ),
            updatedAt: new Date().toISOString(),
          },
          simulationResult: null,
        }));
      },

      clearCircuit: () => {
        set({
          circuit: createEmptyCircuit(),
          simulationResult: null,
        });
      },

      loadCircuit: (circuit) => {
        set({
          circuit,
          simulationResult: null,
        });
      },

      // UI state
      setSelectedGate: (gate) => set({ selectedGate: gate }),
      setHoveredStep: (step) => set({ hoveredStep: step }),

      // Simulation
      setSimulationResult: (result) => set({ simulationResult: result }),
      setIsSimulating: (isSimulating) => set({ isSimulating }),

      // Metadata
      setCircuitName: (name) => {
        set((state) => ({
          circuit: {
            ...state.circuit,
            name,
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      setCircuitDescription: (description) => {
        set((state) => ({
          circuit: {
            ...state.circuit,
            description,
            updatedAt: new Date().toISOString(),
          },
        }));
      },
    }),
    {
      name: 'quanta-circuit',
      partialize: (state) => ({ circuit: state.circuit }),
    }
  )
);

// Selector hooks for common patterns
export const useCircuit = () => useCircuitStore((state) => state.circuit);
export const useGates = () => useCircuitStore((state) => state.circuit.gates);
export const useNumQubits = () => useCircuitStore((state) => state.circuit.numQubits);
export const useSimulationResult = () => useCircuitStore((state) => state.simulationResult);
