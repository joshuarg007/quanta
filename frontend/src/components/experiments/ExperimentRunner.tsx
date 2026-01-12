// ExperimentRunner - Detail and execution view for experiments
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExperimentById } from '../../data/experimentTemplates';
import type { ExperimentSection, ExperimentTemplate, Reference } from '../../data/experimentTemplates';
import './ExperimentRunner.css';

interface RunResult {
  measurements: Record<string, number>;
  totalShots: number;
  executionTime: number;
}

// Helper to get icon for reference type
function getRefIcon(type: Reference['type']): string {
  switch (type) {
    case 'paper': return '📄';
    case 'tutorial': return '📖';
    case 'video': return '🎥';
    case 'documentation': return '📋';
  }
}

export default function ExperimentRunner() {
  const { experimentId } = useParams<{ experimentId: string }>();
  const experiment = experimentId ? getExperimentById(experimentId) : undefined;

  const [activeSection, setActiveSection] = useState(0);
  const [parameters, setParameters] = useState<Record<string, number | string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  // Initialize parameters from experiment config
  useMemo(() => {
    if (experiment) {
      const defaults: Record<string, number | string> = {};
      experiment.config.parameters.forEach((param) => {
        defaults[param.name] = param.default;
      });
      setParameters(defaults);
    }
  }, [experiment]);

  if (!experiment) {
    return (
      <div className="experiment-not-found">
        <h2>Experiment Not Found</h2>
        <p>The requested experiment could not be found.</p>
        <Link to="/experiments" className="back-link">
          ← Back to Experiments
        </Link>
      </div>
    );
  }

  const handleRunExperiment = async () => {
    setIsRunning(true);
    setRunResult(null);

    // Simulate experiment execution
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock results based on experiment type
    const shots = Number(parameters.shots) || experiment.config.default_shots;
    const mockResults = generateMockResults(experiment, shots);

    setRunResult(mockResults);
    setIsRunning(false);

    // Move to analysis section
    setActiveSection(experiment.sections.length - 1);
  };

  const updateParameter = (name: string, value: number | string) => {
    setParameters((prev) => ({ ...prev, [name]: value }));
  };

  const getDifficultyColor = () => {
    switch (experiment.difficulty) {
      case 'beginner':
        return 'var(--color-success)';
      case 'intermediate':
        return 'var(--color-warning, #f59e0b)';
      case 'advanced':
        return 'var(--color-error)';
    }
  };

  return (
    <div className="experiment-runner">
      <div className="runner-header">
        <Link to="/experiments" className="back-link">
          ← Back to Experiments
        </Link>

        <div className="header-content">
          <div className="header-badges">
            <span
              className="difficulty-badge"
              style={{ background: getDifficultyColor() }}
            >
              {experiment.difficulty}
            </span>
            {experiment.driftFocus && (
              <span className="drift-badge">DRIFT</span>
            )}
            <span className="duration-badge">~{experiment.duration} min</span>
          </div>

          <h1>{experiment.name}</h1>
          <p className="subtitle">{experiment.subtitle}</p>
          <p className="hypothesis">
            <strong>Hypothesis:</strong> {experiment.hypothesis}
          </p>
        </div>
      </div>

      {/* Learning Objectives & Prerequisites Panel */}
      <div className="experiment-intro-panel">
        <div className="intro-section objectives">
          <h3>What You'll Learn</h3>
          <ul>
            {experiment.learningObjectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </div>

        <div className="intro-section prerequisites">
          <h3>Prerequisites</h3>
          <ul>
            {experiment.prerequisites.map((prereq, i) => (
              <li key={i}>{prereq}</li>
            ))}
          </ul>
        </div>

        <div className="intro-section references">
          <h3>References & Further Reading</h3>
          <ul className="references-list">
            {experiment.references.map((ref, i) => (
              <li key={i}>
                <a href={ref.url} target="_blank" rel="noopener noreferrer" className="reference-link">
                  <span className="ref-type-icon">{getRefIcon(ref.type)}</span>
                  <span className="ref-title">{ref.title}</span>
                  {ref.authors && <span className="ref-authors">{ref.authors}</span>}
                  {ref.year && <span className="ref-year">({ref.year})</span>}
                  <span className="external-icon">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="runner-content">
        <div className="sections-nav">
          {experiment.sections.map((section, index) => (
            <button
              key={index}
              className={`section-tab ${activeSection === index ? 'active' : ''}`}
              onClick={() => setActiveSection(index)}
            >
              <span className="section-number">{index + 1}</span>
              <span className="section-label">{section.title}</span>
            </button>
          ))}
        </div>

        <div className="section-content">
          <SectionRenderer
            section={experiment.sections[activeSection]}
            experiment={experiment}
            parameters={parameters}
            onUpdateParameter={updateParameter}
            onRun={handleRunExperiment}
            isRunning={isRunning}
            runResult={runResult}
          />
        </div>

        <div className="section-navigation">
          <button
            className="nav-btn prev"
            disabled={activeSection === 0}
            onClick={() => setActiveSection((prev) => prev - 1)}
          >
            ← Previous
          </button>
          <span className="section-indicator">
            {activeSection + 1} / {experiment.sections.length}
          </span>
          <button
            className="nav-btn next"
            disabled={activeSection === experiment.sections.length - 1}
            onClick={() => setActiveSection((prev) => prev + 1)}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

interface SectionRendererProps {
  section: ExperimentSection;
  experiment: ExperimentTemplate;
  parameters: Record<string, number | string>;
  onUpdateParameter: (name: string, value: number | string) => void;
  onRun: () => void;
  isRunning: boolean;
  runResult: RunResult | null;
}

function SectionRenderer({
  section,
  experiment,
  parameters,
  onUpdateParameter,
  onRun,
  isRunning,
  runResult,
}: SectionRendererProps) {
  switch (section.type) {
    case 'overview':
      return (
        <div className="section-overview">
          <h2>{section.title}</h2>
          <div className="overview-content">
            {section.content.split('\n\n').map((para, i) => {
              // Handle bold titles like **In this experiment, you will:**
              if (para.startsWith('**') && para.includes('**')) {
                const boldPattern = /\*\*([^*]+)\*\*/g;
                const parts = para.split(boldPattern);
                return (
                  <p key={i}>
                    {parts.map((part, j) =>
                      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                    )}
                  </p>
                );
              }
              // Handle numbered lists
              if (/^\d+\./.test(para)) {
                const items = para.split('\n').filter(line => /^\d+\./.test(line));
                return (
                  <ol key={i} className="overview-steps">
                    {items.map((item, j) => (
                      <li key={j}>{item.replace(/^\d+\.\s*/, '')}</li>
                    ))}
                  </ol>
                );
              }
              return <p key={i}>{para}</p>;
            })}
          </div>
        </div>
      );

    case 'theory':
      return (
        <div className="section-theory">
          <h2>{section.title}</h2>
          <div className="theory-content">
            {section.content.split('\n\n').map((para, i) => {
              if (para.startsWith('**') && para.includes(':**')) {
                const [title, ...rest] = para.split(':**');
                return (
                  <div key={i} className="theory-block">
                    <h4>{title.replace(/\*\*/g, '')}</h4>
                    <p>{rest.join(':**')}</p>
                  </div>
                );
              }
              return <p key={i}>{para}</p>;
            })}
          </div>
        </div>
      );

    case 'setup':
      return (
        <div className="section-setup">
          <h2>{section.title}</h2>
          <p className="setup-intro">{section.content}</p>

          <div className="parameters-grid">
            {experiment.config.parameters.map((param) => (
              <div key={param.name} className="parameter-item">
                <label>{param.label}</label>
                {param.type === 'select' && param.options ? (
                  <select
                    value={parameters[param.name]}
                    onChange={(e) =>
                      onUpdateParameter(
                        param.name,
                        isNaN(Number(e.target.value))
                          ? e.target.value
                          : Number(e.target.value)
                      )
                    }
                  >
                    {param.options.map((opt) => (
                      <option key={String(opt.value)} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={parameters[param.name]}
                    onChange={(e) =>
                      onUpdateParameter(param.name, Number(e.target.value))
                    }
                    min={param.min}
                    max={param.max}
                    step={param.step}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="config-summary">
            <h4>Configuration Summary</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span>Qubits:</span>
                <span>{experiment.config.num_qubits}</span>
              </div>
              {Object.entries(parameters).map(([key, value]) => (
                <div key={key} className="summary-item">
                  <span>{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'circuit':
      return (
        <div className="section-circuit">
          <h2>{section.title}</h2>
          <p>{section.content}</p>

          <div className="circuit-preview">
            <div className="circuit-placeholder">
              <span className="circuit-icon">&#x29BF;</span>
              <span>Circuit Visualization</span>
              <span className="circuit-info">
                {experiment.config.num_qubits} qubits
              </span>
            </div>
          </div>
        </div>
      );

    case 'run':
      return (
        <div className="section-run">
          <h2>{section.title}</h2>
          <p>{section.content}</p>

          <div className="run-panel">
            <div className="run-info">
              <div className="run-stat">
                <span className="stat-label">Qubits</span>
                <span className="stat-value">{experiment.config.num_qubits}</span>
              </div>
              <div className="run-stat">
                <span className="stat-label">Shots</span>
                <span className="stat-value">
                  {parameters.shots || experiment.config.default_shots}
                </span>
              </div>
              <div className="run-stat">
                <span className="stat-label">Est. Time</span>
                <span className="stat-value">~2s</span>
              </div>
            </div>

            <button
              className="run-btn"
              onClick={onRun}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <span className="spinner" />
                  Running...
                </>
              ) : (
                <>
                  <span>&#x25B6;</span>
                  Run Experiment
                </>
              )}
            </button>
          </div>

          {runResult && (
            <div className="run-complete">
              <span className="complete-icon">&#x2713;</span>
              <span>Experiment complete! View results in the Analysis section.</span>
            </div>
          )}
        </div>
      );

    case 'analysis':
      return (
        <div className="section-analysis">
          <h2>{section.title}</h2>

          {!runResult ? (
            <div className="no-results">
              <span className="no-results-icon">&#x1F4CA;</span>
              <p>No results yet. Run the experiment first.</p>
              <button onClick={() => {}}>Go to Run Section</button>
            </div>
          ) : (
            <div className="results-container">
              <div className="results-summary">
                <h4>Measurement Results</h4>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-label">Total Shots</span>
                    <span className="stat-value">{runResult.totalShots}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Execution Time</span>
                    <span className="stat-value">{runResult.executionTime}ms</span>
                  </div>
                </div>
              </div>

              <div className="histogram">
                <h4>Measurement Histogram</h4>
                <div className="histogram-bars">
                  {Object.entries(runResult.measurements)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([state, count]) => (
                      <div key={state} className="histogram-bar">
                        <div
                          className="bar"
                          style={{
                            height: `${(count / runResult.totalShots) * 100}%`,
                          }}
                        />
                        <span className="bar-label">{state}</span>
                        <span className="bar-value">
                          {((count / runResult.totalShots) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="analysis-text">
                <h4>Interpretation</h4>
                <div className="interpretation">
                  {section.content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}

function generateMockResults(
  experiment: ExperimentTemplate,
  shots: number
): RunResult {
  const measurements: Record<string, number> = {};
  const numQubits = experiment.config.num_qubits;

  // Generate experiment-appropriate mock results
  if (experiment.id === 'ghz-state') {
    // GHZ: mostly |000...0⟩ and |111...1⟩
    const zeros = '0'.repeat(numQubits);
    const ones = '1'.repeat(numQubits);
    measurements[zeros] = Math.floor(shots * 0.48);
    measurements[ones] = Math.floor(shots * 0.48);
    measurements['0'.repeat(numQubits - 1) + '1'] = Math.floor(shots * 0.02);
    measurements['1'.repeat(numQubits - 1) + '0'] = Math.floor(shots * 0.02);
  } else if (experiment.id === 'chsh-bell-test') {
    // Bell test: correlated outcomes
    measurements['00'] = Math.floor(shots * 0.42);
    measurements['11'] = Math.floor(shots * 0.42);
    measurements['01'] = Math.floor(shots * 0.08);
    measurements['10'] = Math.floor(shots * 0.08);
  } else {
    // Generic distribution
    const numStates = Math.min(Math.pow(2, numQubits), 8);
    for (let i = 0; i < numStates; i++) {
      const state = i.toString(2).padStart(numQubits, '0');
      measurements[state] = Math.floor(shots / numStates + (Math.random() - 0.5) * shots * 0.1);
    }
  }

  return {
    measurements,
    totalShots: shots,
    executionTime: Math.floor(500 + Math.random() * 1500),
  };
}
