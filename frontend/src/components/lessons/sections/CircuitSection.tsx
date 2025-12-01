import { MiniCircuit } from '../MiniCircuit';
import './sections.css';

interface CircuitContent {
  title?: string;
  description: string;
  template: {
    numQubits: number;
    gates: Array<{
      type: string;
      qubit: number;
      controlQubit?: number;
      step: number;
      parameter?: number;
    }>;
  };
  expectedOutput?: string;
  hints?: string[];
}

export function CircuitSection({ content }: { content: CircuitContent }) {
  return (
    <div className="section section-circuit">
      {content.title && <h2>{content.title}</h2>}
      <p className="circuit-description">{content.description}</p>

      <MiniCircuit
        numQubits={content.template.numQubits}
        gates={content.template.gates}
        readOnly={false}
      />

      {content.expectedOutput && (
        <div className="expected-output">
          <strong>Expected:</strong> {content.expectedOutput}
        </div>
      )}

      {content.hints && content.hints.length > 0 && (
        <div className="circuit-hints">
          <details>
            <summary>Hints</summary>
            <ul>
              {content.hints.map((hint, i) => (
                <li key={i}>{hint}</li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}
