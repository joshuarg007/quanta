import { useCircuitStore, useGates, useNumQubits } from '../../stores/circuitStore';
import { GATE_INFO, type Gate } from '../../types/quantum';
import './CircuitBuilder.css';

export function CircuitBuilder() {
  const numQubits = useNumQubits();
  const gates = useGates();
  const { removeGate, selectedGate, addGate } = useCircuitStore();

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
        {/* Qubit labels */}
        <div className="qubit-labels">
          {Array.from({ length: numQubits }, (_, i) => (
            <div key={i} className="qubit-label">
              q<sub>{i}</sub> |0⟩
            </div>
          ))}
        </div>

        {/* Circuit wires and gates */}
        <div className="circuit-wires">
          {Array.from({ length: numQubits }, (_, qubitIndex) => (
            <div key={qubitIndex} className="circuit-row">
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
                        className="gate"
                        style={{ backgroundColor: GATE_INFO[gate.type].color }}
                        title={GATE_INFO[gate.type].name}
                      >
                        {GATE_INFO[gate.type].symbol}
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
