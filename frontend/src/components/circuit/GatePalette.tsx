import { useCircuitStore } from '../../stores/circuitStore';
import { GATE_INFO, type GateType } from '../../types/quantum';
import './GatePalette.css';

const GATE_CATEGORIES = {
  'Single Qubit': ['H', 'X', 'Y', 'Z', 'S', 'T'] as GateType[],
  'Rotations': ['RX', 'RY', 'RZ'] as GateType[],
  'Multi-Qubit': ['CNOT', 'CZ', 'SWAP', 'TOFFOLI'] as GateType[],
  'Measurement': ['MEASURE'] as GateType[],
};

export function GatePalette() {
  const { selectedGate, setSelectedGate } = useCircuitStore();

  return (
    <div className="gate-palette">
      <h3 className="palette-title">Quantum Gates</h3>

      {Object.entries(GATE_CATEGORIES).map(([category, gateTypes]) => (
        <div key={category} className="gate-category">
          <h4 className="category-title">{category}</h4>
          <div className="gate-grid">
            {gateTypes.map((gateType) => {
              const info = GATE_INFO[gateType];
              const isSelected = selectedGate === gateType;

              return (
                <button
                  key={gateType}
                  className={`gate-button ${isSelected ? 'selected' : ''}`}
                  style={{
                    '--gate-color': info.color,
                    borderColor: isSelected ? info.color : 'transparent',
                  } as React.CSSProperties}
                  onClick={() => setSelectedGate(isSelected ? null : gateType)}
                  title={info.description}
                >
                  <span className="gate-symbol" style={{ color: info.color }}>
                    {info.symbol}
                  </span>
                  <span className="gate-name">{info.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedGate && (
        <div className="selected-gate-info">
          <h4>Selected: {GATE_INFO[selectedGate].name}</h4>
          <p>{GATE_INFO[selectedGate].description}</p>
          <button className="deselect-btn" onClick={() => setSelectedGate(null)}>
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
}
