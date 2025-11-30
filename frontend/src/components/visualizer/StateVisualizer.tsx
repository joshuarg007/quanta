import type { SimulationResult } from '../../types/quantum';
import './StateVisualizer.css';

interface StateVisualizerProps {
  result: SimulationResult | null;
  numQubits: number;
}

export function StateVisualizer({ result, numQubits }: StateVisualizerProps) {
  if (!result) {
    return (
      <div className="state-visualizer empty">
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <p>Add gates to your circuit and click <strong>Simulate</strong> to see the quantum state</p>
        </div>
      </div>
    );
  }

  const { finalState } = result;
  const numStates = Math.pow(2, numQubits);

  // Get top states by probability (for display)
  const statesWithProbs = finalState.probabilities
    .map((prob, index) => ({
      basisState: index.toString(2).padStart(numQubits, '0'),
      probability: prob,
      amplitude: finalState.amplitudes[index],
    }))
    .filter((s) => s.probability > 0.001) // Filter out near-zero
    .sort((a, b) => b.probability - a.probability);

  const maxProb = Math.max(...statesWithProbs.map((s) => s.probability));

  return (
    <div className="state-visualizer">
      {/* Probability distribution */}
      <div className="probability-section">
        <h4>Probability Distribution</h4>
        <div className="probability-bars">
          {statesWithProbs.slice(0, 16).map((state) => (
            <div key={state.basisState} className="prob-bar-container">
              <div className="prob-label">|{state.basisState}⟩</div>
              <div className="prob-bar-wrapper">
                <div
                  className="prob-bar"
                  style={{
                    width: `${(state.probability / maxProb) * 100}%`,
                    opacity: 0.5 + (state.probability / maxProb) * 0.5,
                  }}
                />
              </div>
              <div className="prob-value">{(state.probability * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
        {statesWithProbs.length > 16 && (
          <p className="truncated-notice">
            Showing top 16 of {statesWithProbs.length} non-zero states
          </p>
        )}
      </div>

      {/* State vector (for small circuits) */}
      {numQubits <= 4 && (
        <div className="statevector-section">
          <h4>State Vector</h4>
          <div className="statevector">
            {finalState.amplitudes.map((amp, index) => {
              const basisState = index.toString(2).padStart(numQubits, '0');
              const magnitude = Math.sqrt(amp.real * amp.real + amp.imag * amp.imag);
              if (magnitude < 0.001) return null;

              return (
                <span key={index} className="amplitude-term">
                  {index > 0 && ' + '}
                  <span className="amplitude-value">
                    ({amp.real.toFixed(3)} {amp.imag >= 0 ? '+' : ''} {amp.imag.toFixed(3)}i)
                  </span>
                  <span className="basis-state">|{basisState}⟩</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Execution info */}
      <div className="execution-info">
        <span>Execution time: {result.executionTime.toFixed(2)}ms</span>
        <span>States: {numStates}</span>
        <span>Non-zero: {statesWithProbs.length}</span>
      </div>
    </div>
  );
}
