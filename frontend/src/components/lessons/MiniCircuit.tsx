import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCircuitStore } from '../../stores/circuitStore';
import type { Gate, GateType } from '../../types/quantum';
import './MiniCircuit.css';

interface MiniCircuitProps {
  numQubits: number;
  gates: Array<{
    type: string;
    qubit: number;
    controlQubit?: number;
    step: number;
    parameter?: number;
  }>;
  readOnly?: boolean;
}

export function MiniCircuit({ numQubits, gates: initialGates, readOnly = false }: MiniCircuitProps) {
  const [localGates, setLocalGates] = useState<Gate[]>([]);
  const [simulationResult, setSimulationResult] = useState<Record<string, number> | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const { setCircuit } = useCircuitStore();

  // Convert initial gates to Gate type
  useEffect(() => {
    const converted = initialGates.map((g, i) => ({
      id: `gate-${i}`,
      type: g.type as GateType,
      qubit: g.qubit,
      controlQubit: g.controlQubit,
      step: g.step,
      parameter: g.parameter
    }));
    setLocalGates(converted);
  }, [initialGates]);

  // Calculate grid dimensions
  const maxStep = Math.max(0, ...localGates.map(g => g.step)) + 2;
  const steps = Array.from({ length: Math.max(maxStep, 4) }, (_, i) => i);
  const qubits = Array.from({ length: numQubits }, (_, i) => i);

  // Simple mock simulation
  const runSimulation = async () => {
    setIsSimulating(true);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock results based on gates
    const results: Record<string, number> = {};
    const numStates = Math.pow(2, numQubits);

    // Check for Hadamard gates (creates superposition)
    const hasHadamard = localGates.some(g => g.type === 'H');
    // Check for CNOT creating entanglement
    const hasCNOT = localGates.some(g => g.type === 'CNOT');
    // Check for X gate (flip)
    const xGates = localGates.filter(g => g.type === 'X');

    if (hasHadamard && hasCNOT && numQubits >= 2) {
      // Bell state - only 00 and 11
      results['0'.repeat(numQubits)] = 512;
      results['1'.repeat(numQubits)] = 512;
    } else if (hasHadamard) {
      // Superposition - roughly equal distribution
      const perState = Math.floor(1024 / numStates);
      for (let i = 0; i < numStates; i++) {
        const state = i.toString(2).padStart(numQubits, '0');
        results[state] = perState + Math.floor(Math.random() * 50) - 25;
      }
    } else {
      // Start with all zeros
      let state = 0;
      // Apply X gates
      for (const xGate of xGates) {
        state ^= (1 << (numQubits - 1 - xGate.qubit));
      }
      const stateStr = state.toString(2).padStart(numQubits, '0');
      results[stateStr] = 1024;
    }

    setSimulationResult(results);
    setIsSimulating(false);
  };

  // Open in sandbox
  const openInSandbox = () => {
    setCircuit({
      id: `lesson-${Date.now()}`,
      name: 'Lesson Circuit',
      numQubits,
      gates: localGates,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  // Get gate at position
  const getGateAt = (qubit: number, step: number) => {
    return localGates.find(g => g.qubit === qubit && g.step === step);
  };

  // Check if position has control
  const hasControlAt = (qubit: number, step: number) => {
    return localGates.some(g => g.controlQubit === qubit && g.step === step);
  };

  // Gate colors
  const gateColors: Record<string, string> = {
    H: '#6366f1',
    X: '#ef4444',
    Y: '#f59e0b',
    Z: '#22c55e',
    S: '#8b5cf6',
    T: '#a855f7',
    RX: '#ec4899',
    RY: '#f472b6',
    RZ: '#14b8a6',
    CNOT: '#3b82f6',
    CZ: '#06b6d4',
    SWAP: '#f97316',
    MEASURE: '#64748b'
  };

  return (
    <div className="mini-circuit">
      <div className="mini-circuit-grid">
        {/* Qubit labels */}
        <div className="qubit-labels">
          {qubits.map(q => (
            <div key={q} className="qubit-label">q{q}</div>
          ))}
        </div>

        {/* Circuit grid */}
        <div className="circuit-area">
          {qubits.map(qubit => (
            <div key={qubit} className="qubit-wire">
              <div className="wire-line" />
              {steps.map(step => {
                const gate = getGateAt(qubit, step);
                const isControl = hasControlAt(qubit, step);

                return (
                  <div key={step} className="gate-slot">
                    {gate && (
                      <div
                        className="gate-box"
                        style={{ backgroundColor: gateColors[gate.type] || '#6366f1' }}
                        title={gate.parameter ? `${gate.type}(${gate.parameter.toFixed(2)})` : gate.type}
                      >
                        {gate.type}
                      </div>
                    )}
                    {isControl && (
                      <div className="control-dot" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Draw control lines */}
          {localGates
            .filter(g => g.controlQubit !== undefined)
            .map((gate, i) => {
              const startQ = Math.min(gate.qubit, gate.controlQubit!);
              const endQ = Math.max(gate.qubit, gate.controlQubit!);
              const height = (endQ - startQ) * 48; // 48px per qubit
              const top = startQ * 48 + 24; // Center of qubit row
              const left = (gate.step + 1) * 56 + 20; // Center of step

              return (
                <div
                  key={`control-line-${i}`}
                  className="control-line"
                  style={{
                    height: `${height}px`,
                    top: `${top}px`,
                    left: `${left}px`
                  }}
                />
              );
            })}
        </div>
      </div>

      {/* Controls */}
      <div className="mini-circuit-controls">
        <button
          className="btn btn-primary btn-small"
          onClick={runSimulation}
          disabled={isSimulating}
        >
          {isSimulating ? 'Simulating...' : 'Run Circuit'}
        </button>
        {!readOnly && (
          <Link to="/sandbox" onClick={openInSandbox} className="btn btn-secondary btn-small">
            Open in Sandbox
          </Link>
        )}
      </div>

      {/* Results */}
      {simulationResult && (
        <div className="mini-results">
          <h4>Results (1024 shots)</h4>
          <div className="result-bars">
            {Object.entries(simulationResult)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([state, count]) => {
                const probability = count / 1024;
                return (
                  <div key={state} className="result-row">
                    <span className="result-state">|{state}⟩</span>
                    <div className="result-bar-container">
                      <div
                        className="result-bar-fill"
                        style={{ width: `${probability * 100}%` }}
                      />
                    </div>
                    <span className="result-count">{count} ({(probability * 100).toFixed(1)}%)</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
