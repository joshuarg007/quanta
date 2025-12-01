// Quantum Time Machine - Step through circuit execution like magic
import { useEffect, useRef, useCallback } from 'react';
import { useCircuitStore } from '../../stores/circuitStore';
import './TimeMachine.css';

export function TimeMachine() {
  const {
    simulationResult,
    timelineStep,
    isPlaying,
    playbackSpeed,
    maxStep,
    setTimelineStep,
    stepForward,
    stepBackward,
    setIsPlaying,
    setPlaybackSpeed,
    resetTimeline,
    circuit,
  } = useCircuitStore();

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && maxStep > 0) {
      playIntervalRef.current = setInterval(() => {
        const store = useCircuitStore.getState();
        if (store.timelineStep >= store.maxStep) {
          setIsPlaying(false);
        } else {
          stepForward();
        }
      }, playbackSpeed);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, maxStep, stepForward, setIsPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (maxStep > 0) setIsPlaying(!isPlaying);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        case 'Home':
          e.preventDefault();
          resetTimeline();
          break;
        case 'End':
          e.preventDefault();
          setTimelineStep(maxStep);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, maxStep, setIsPlaying, stepForward, stepBackward, resetTimeline, setTimelineStep]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTimelineStep(parseInt(e.target.value, 10));
  }, [setTimelineStep]);

  const togglePlay = useCallback(() => {
    if (timelineStep >= maxStep) {
      resetTimeline();
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  }, [timelineStep, maxStep, isPlaying, setIsPlaying, resetTimeline]);

  // Get gates at each step for the timeline visualization
  const getGatesAtStep = (step: number) => {
    if (step === 0) return [];
    // Group gates by step and return gates up to this step
    const sortedGates = [...circuit.gates].sort((a, b) => a.step - b.step);
    const uniqueSteps = [...new Set(sortedGates.map(g => g.step))].sort((a, b) => a - b);
    const targetStep = uniqueSteps[step - 1];
    return sortedGates.filter(g => g.step === targetStep);
  };

  // No simulation yet
  if (!simulationResult || !simulationResult.stateHistory) {
    return (
      <div className="time-machine empty">
        <div className="tm-icon">&#x23F1;</div>
        <p>Simulate to unlock the Time Machine</p>
      </div>
    );
  }

  const currentState = simulationResult.stateHistory[timelineStep] || simulationResult.stateHistory[0];
  const progress = maxStep > 0 ? (timelineStep / maxStep) * 100 : 0;

  return (
    <div className="time-machine">
      <div className="tm-header">
        <h3>
          <span className="tm-icon">&#x23F1;</span>
          Quantum Time Machine
        </h3>
        <div className="tm-step-display">
          Step {timelineStep} / {maxStep}
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="tm-timeline">
        <div className="tm-track">
          <div
            className="tm-progress"
            style={{ width: `${progress}%` }}
          />
          {/* Step markers */}
          {Array.from({ length: maxStep + 1 }).map((_, i) => (
            <div
              key={i}
              className={`tm-marker ${i === timelineStep ? 'active' : ''} ${i < timelineStep ? 'past' : ''}`}
              style={{ left: `${(i / maxStep) * 100}%` }}
              onClick={() => setTimelineStep(i)}
              title={i === 0 ? 'Initial state |0...0⟩' : `Step ${i}`}
            />
          ))}
        </div>

        {/* Slider */}
        <input
          type="range"
          className="tm-slider"
          min={0}
          max={maxStep}
          value={timelineStep}
          onChange={handleSliderChange}
        />
      </div>

      {/* Controls */}
      <div className="tm-controls">
        <button
          className="tm-btn"
          onClick={resetTimeline}
          title="Reset to beginning (Home)"
        >
          &#x23EE;
        </button>
        <button
          className="tm-btn"
          onClick={stepBackward}
          disabled={timelineStep === 0}
          title="Step backward (←)"
        >
          &#x23EA;
        </button>
        <button
          className="tm-btn tm-play"
          onClick={togglePlay}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          className="tm-btn"
          onClick={stepForward}
          disabled={timelineStep >= maxStep}
          title="Step forward (→)"
        >
          &#x23E9;
        </button>
        <button
          className="tm-btn"
          onClick={() => setTimelineStep(maxStep)}
          title="Jump to end (End)"
        >
          &#x23ED;
        </button>

        {/* Speed control */}
        <div className="tm-speed">
          <label>Speed:</label>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseInt(e.target.value, 10))}
          >
            <option value={1000}>0.5x</option>
            <option value={500}>1x</option>
            <option value={250}>2x</option>
            <option value={100}>5x</option>
          </select>
        </div>
      </div>

      {/* Current state info */}
      <div className="tm-state-info">
        {timelineStep === 0 ? (
          <div className="tm-state-label">
            <span className="state-icon">&#x1F7E2;</span>
            Initial State: |{'0'.repeat(circuit.numQubits)}⟩
          </div>
        ) : (
          <div className="tm-state-label">
            <span className="state-icon">&#x26A1;</span>
            After: {getGatesAtStep(timelineStep).map(g => g.type).join(', ') || 'Gate(s)'}
          </div>
        )}

        {/* Mini probability preview */}
        <div className="tm-mini-probs">
          {currentState.probabilities
            .map((p, i) => ({ prob: p, state: i.toString(2).padStart(circuit.numQubits, '0') }))
            .filter(s => s.prob > 0.01)
            .slice(0, 4)
            .map((s, i) => (
              <span key={i} className="tm-prob-chip">
                |{s.state}⟩: {(s.prob * 100).toFixed(0)}%
              </span>
            ))}
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="tm-hints">
        <span>Space: Play/Pause</span>
        <span>←/→: Step</span>
        <span>Home/End: Jump</span>
      </div>
    </div>
  );
}
