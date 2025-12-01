import { useState } from 'react';
import { MiniCircuit } from '../MiniCircuit';
import './sections.css';

interface ExerciseContent {
  title: string;
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  objectives?: string[];
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
  solution?: {
    numQubits: number;
    gates: Array<{
      type: string;
      qubit: number;
      controlQubit?: number;
      step: number;
      parameter?: number;
    }>;
  };
  hints?: string[];
  successMessage?: string;
}

const difficultyColors = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444'
};

export function ExerciseSection({ content, onComplete }: { content: ExerciseContent; onComplete?: () => void }) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);

  const showNextHint = () => {
    if (content.hints && currentHint < content.hints.length - 1) {
      setCurrentHint(currentHint + 1);
    }
    setShowHint(true);
  };

  return (
    <div className="section section-exercise">
      <div className="exercise-header">
        <h2>{content.title}</h2>
        {content.difficulty && (
          <span
            className="exercise-difficulty"
            style={{ backgroundColor: difficultyColors[content.difficulty] }}
          >
            {content.difficulty}
          </span>
        )}
      </div>

      <p className="exercise-description">{content.description}</p>

      {content.objectives && (
        <div className="exercise-objectives">
          <h4>Objectives:</h4>
          <ul>
            {content.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="exercise-workspace">
        <MiniCircuit
          numQubits={content.template.numQubits}
          gates={content.template.gates}
          readOnly={false}
        />
      </div>

      <div className="exercise-actions">
        {content.hints && content.hints.length > 0 && (
          <button
            className="btn btn-secondary btn-small"
            onClick={showNextHint}
          >
            {showHint ? `Hint ${currentHint + 1}/${content.hints.length}` : 'Get Hint'}
          </button>
        )}
        {content.solution && (
          <button
            className="btn btn-secondary btn-small"
            onClick={() => {
              setShowSolution(!showSolution);
              if (!showSolution && onComplete) onComplete();
            }}
          >
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </button>
        )}
      </div>

      {showHint && content.hints && (
        <div className="hint-box">
          <strong>Hint {currentHint + 1}:</strong> {content.hints[currentHint]}
        </div>
      )}

      {showSolution && content.solution && (
        <div className="solution-box">
          <strong>Solution:</strong>
          {content.successMessage && (
            <p className="success-message">{content.successMessage}</p>
          )}
          <MiniCircuit
            numQubits={content.solution.numQubits}
            gates={content.solution.gates}
            readOnly={true}
          />
        </div>
      )}
    </div>
  );
}
