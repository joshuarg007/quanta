import { useState, useRef, useEffect } from 'react';
import { useCircuitStore, useGates, useNumQubits } from '../../stores/circuitStore';
import { GATE_INFO, type Gate } from '../../types/quantum';
import './CircuitBuilder.css';

// Tooltip component with delayed appearance
function GateTooltip({ gate, show }: { gate: Gate; show: boolean }) {
  if (!show) return null;

  const info = GATE_INFO[gate.type];

  return (
    <div className="gate-tooltip">
      <div className="gate-tooltip-header">
        <span className="gate-tooltip-symbol" style={{ backgroundColor: info.color }}>
          {info.symbol}
        </span>
        <span className="gate-tooltip-name">{info.name}</span>
      </div>
      <p className="gate-tooltip-description">{info.description}</p>
    </div>
  );
}

export function CircuitBuilder() {
  const numQubits = useNumQubits();
  const gates = useGates();
  const { removeGate, selectedGate, addGate } = useCircuitStore();

  // Tooltip state
  const [tooltipGateId, setTooltipGateId] = useState<string | null>(null);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleGateMouseEnter = (gateId: string) => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltipGateId(gateId);
    }, 2500); // 2.5 seconds
  };

  const handleGateMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setTooltipGateId(null);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Calculate the number of time steps needed
  const maxStep = gates.length > 0 ? Math.max(...gates.map((g) => g.step)) + 1 : 0;
  const numSteps = Math.max(maxStep + 2, 8); // At least 8 columns, plus room to add

  // Get gate at specific position
  const getGateAt = (qubit: number, step: number): Gate | undefined => {
    return gates.find((g) => g.qubit === qubit && g.step === step);
  };

  // Handle cell click to add gate
  const handleCellClick = (qubit: number, step: number) => {
    const existingGate = getGateAt(qubit, step);

    if (existingGate) {
      // If there's already a gate, remove it
      removeGate(existingGate.id);
    } else if (selectedGate) {
      // Add the selected gate
      addGate({
        type: selectedGate,
        qubit,
        step,
      });
    }
  };

  return (
    <div className="circuit-builder">
      <div className="circuit-grid">
        {/* Circuit wires and gates */}
        <div className="circuit-wires">
          {Array.from({ length: numQubits }, (_, qubitIndex) => (
            <div key={qubitIndex} className="circuit-row">
              {/* Qubit label inline with the row */}
              <div className="qubit-label">
                q<sub>{qubitIndex}</sub> |0⟩
              </div>
              <div className="wire" />
              {Array.from({ length: numSteps }, (_, stepIndex) => {
                const gate = getGateAt(qubitIndex, stepIndex);
                return (
                  <div
                    key={stepIndex}
                    className={`circuit-cell ${selectedGate ? 'clickable' : ''} ${gate ? 'has-gate' : ''}`}
                    onClick={() => handleCellClick(qubitIndex, stepIndex)}
                  >
                    {gate && (
                      <div
                        className="gate-wrapper"
                        onMouseEnter={() => handleGateMouseEnter(gate.id)}
                        onMouseLeave={handleGateMouseLeave}
                      >
                        <div
                          className="gate"
                          style={{ backgroundColor: GATE_INFO[gate.type].color }}
                        >
                          {GATE_INFO[gate.type].symbol}
                        </div>
                        <GateTooltip gate={gate} show={tooltipGateId === gate.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Step numbers */}
        <div className="step-labels">
          <div className="step-label-spacer" />
          {Array.from({ length: numSteps }, (_, i) => (
            <div key={i} className="step-label">
              {i}
            </div>
          ))}
        </div>
      </div>

      {selectedGate && (
        <div className="circuit-hint">
          Click on a cell to place <strong>{GATE_INFO[selectedGate].name}</strong> gate
        </div>
      )}
    </div>
  );
}
