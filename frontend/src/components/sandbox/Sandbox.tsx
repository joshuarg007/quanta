import { CircuitBuilder } from '../circuit/CircuitBuilder';
import { StateVisualizer } from '../visualizer/StateVisualizer';
import { GatePalette } from '../circuit/GatePalette';
import { CircuitControls } from '../circuit/CircuitControls';
import { CodeEditor } from '../circuit/CodeEditor';
import { TimeMachine } from '../timemachine/TimeMachine';
import { AITutor } from '../tutor/AITutor';
import { CollabPanel } from '../collab/CollabPanel';
import { useCircuitStore } from '../../stores/circuitStore';
import { useCollabStore } from '../../stores/collabStore';
import './Sandbox.css';

export function Sandbox() {
  const { circuit, simulationResult, isSimulating } = useCircuitStore();
  const { isConnected, roomId } = useCollabStore();

  return (
    <div className="sandbox">
      <div className="sandbox-header">
        <h1>
          Quantum Sandbox
          {isConnected && (
            <span className="collab-badge">
              Live Session: {roomId}
            </span>
          )}
        </h1>
        <p>Build, simulate, and visualize quantum circuits</p>
      </div>

      <div className="sandbox-layout">
        {/* Left panel - Gate palette */}
        <aside className="sandbox-sidebar">
          <GatePalette />
        </aside>

        {/* Main area - Circuit and visualization */}
        <div className="sandbox-main">
          {/* Circuit builder */}
          <section className="sandbox-circuit">
            <div className="section-header">
              <h2>Circuit: {circuit.name}</h2>
              <CircuitControls />
            </div>
            <CircuitBuilder />
          </section>

          {/* Time Machine */}
          <section className="sandbox-timemachine">
            <TimeMachine />
          </section>

          {/* State visualization */}
          <section className="sandbox-visualization">
            <div className="section-header">
              <h2>Quantum State</h2>
              {isSimulating && <span className="simulating-badge">Simulating...</span>}
            </div>
            <StateVisualizer result={simulationResult} numQubits={circuit.numQubits} />
          </section>
        </div>

        {/* Right panel - Code view */}
        <aside className="sandbox-code">
          <div className="section-header">
            <h2>Qiskit Code</h2>
          </div>
          <CodeEditor />
        </aside>
      </div>

      {/* Floating AI Tutor */}
      <AITutor />

      {/* Floating Collaboration Panel */}
      <CollabPanel />
    </div>
  );
}
