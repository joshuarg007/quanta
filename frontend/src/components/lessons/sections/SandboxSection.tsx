import { Link } from 'react-router-dom';
import { useCircuitStore } from '../../../stores/circuitStore';
import './sections.css';

interface SandboxContent {
  title: string;
  description: string;
  suggestedExperiments?: string[];
  preloadCircuit?: {
    numQubits: number;
    gates: Array<{
      type: string;
      qubit: number;
      controlQubit?: number;
      step: number;
      parameter?: number;
    }>;
  };
}

export function SandboxSection({ content }: { content: SandboxContent }) {
  const { setCircuit } = useCircuitStore();

  const handleOpenSandbox = () => {
    if (content.preloadCircuit) {
      setCircuit({
        id: `lesson-${Date.now()}`,
        name: 'Lesson Circuit',
        numQubits: content.preloadCircuit.numQubits,
        gates: content.preloadCircuit.gates.map((g, i) => ({
          id: `gate-${i}`,
          type: g.type as any,
          qubit: g.qubit,
          controlQubit: g.controlQubit,
          step: g.step,
          parameter: g.parameter
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="section section-sandbox">
      <div className="sandbox-icon">⚗️</div>
      <h2>{content.title}</h2>
      <p className="sandbox-description">{content.description}</p>

      {content.suggestedExperiments && (
        <div className="suggested-experiments">
          <h4>Try these experiments:</h4>
          <ul>
            {content.suggestedExperiments.map((exp, i) => (
              <li key={i}>{exp}</li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to="/sandbox"
        className="btn btn-primary btn-large"
        onClick={handleOpenSandbox}
      >
        Open Quantum Sandbox →
      </Link>
    </div>
  );
}
