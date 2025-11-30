import { useCircuitStore } from '../../stores/circuitStore';
import { simulationApi } from '../../api/client';
import './CircuitControls.css';

export function CircuitControls() {
  const {
    circuit,
    setNumQubits,
    clearCircuit,
    setSimulationResult,
    setIsSimulating,
    isSimulating,
  } = useCircuitStore();

  const handleSimulate = async () => {
    if (circuit.gates.length === 0) return;

    setIsSimulating(true);
    try {
      const result = await simulationApi.simulateSteps(circuit);
      setSimulationResult(result);
    } catch (error) {
      console.error('Simulation failed:', error);
      // For now, generate mock result for development
      setSimulationResult(generateMockResult(circuit.numQubits));
    } finally {
      setIsSimulating(false);
    }
  };

  // Mock result generator for development without backend
  const generateMockResult = (numQubits: number) => {
    const numStates = Math.pow(2, numQubits);
    const amplitudes = Array.from({ length: numStates }, () => ({
      real: (Math.random() - 0.5) * 0.5,
      imag: (Math.random() - 0.5) * 0.5,
    }));

    // Normalize
    const norm = Math.sqrt(
      amplitudes.reduce((sum, a) => sum + a.real * a.real + a.imag * a.imag, 0)
    );
    amplitudes.forEach((a) => {
      a.real /= norm;
      a.imag /= norm;
    });

    return {
      circuitId: circuit.id,
      finalState: {
        numQubits,
        amplitudes,
        probabilities: amplitudes.map((a) => a.real * a.real + a.imag * a.imag),
      },
      executionTime: Math.random() * 100,
    };
  };

  return (
    <div className="circuit-controls">
      <div className="qubit-control">
        <label>Qubits:</label>
        <button
          onClick={() => setNumQubits(circuit.numQubits - 1)}
          disabled={circuit.numQubits <= 1}
        >
          −
        </button>
        <span className="qubit-count">{circuit.numQubits}</span>
        <button
          onClick={() => setNumQubits(circuit.numQubits + 1)}
          disabled={circuit.numQubits >= 16}
        >
          +
        </button>
      </div>

      <div className="action-buttons">
        <button
          className="btn-simulate"
          onClick={handleSimulate}
          disabled={isSimulating || circuit.gates.length === 0}
        >
          {isSimulating ? 'Simulating...' : '▶ Simulate'}
        </button>

        <button className="btn-clear" onClick={clearCircuit}>
          Clear
        </button>
      </div>
    </div>
  );
}
