import { useState, useRef, useEffect } from 'react';
import './sections.css';

interface BlochContent {
  title: string;
  description: string;
  initialState?: { theta: number; phi: number };
  showControls?: boolean;
  annotations?: Array<{
    position: string;
    label: string;
  }>;
}

export function BlochSection({ content }: { content: BlochContent }) {
  const [theta, setTheta] = useState(content.initialState?.theta ?? 0);
  const [phi, setPhi] = useState(content.initialState?.phi ?? 0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawBlochSphere();
  }, [theta, phi]);

  const drawBlochSphere = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw sphere outline
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw equator
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius * 0.3, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.stroke();

    // Draw vertical meridian
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius * 0.3, radius, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw axes
    ctx.strokeStyle = 'rgba(136, 136, 160, 0.5)';
    ctx.lineWidth = 1;

    // Z axis (vertical)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 20);
    ctx.lineTo(centerX, centerY + radius + 20);
    ctx.stroke();

    // X axis
    ctx.beginPath();
    ctx.moveTo(centerX - radius - 20, centerY);
    ctx.lineTo(centerX + radius + 20, centerY);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#e8e8f0';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('|0⟩', centerX, centerY - radius - 25);
    ctx.fillText('|1⟩', centerX, centerY + radius + 35);
    ctx.fillText('|+⟩', centerX + radius + 25, centerY + 5);
    ctx.fillText('|-⟩', centerX - radius - 25, centerY + 5);

    // Draw state vector
    const stateX = radius * Math.sin(theta) * Math.cos(phi);
    const stateY = radius * Math.sin(theta) * Math.sin(phi) * 0.3; // Perspective
    const stateZ = radius * Math.cos(theta);

    const endX = centerX + stateX;
    const endY = centerY - stateZ + stateY;

    // Arrow
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Arrow head
    ctx.beginPath();
    ctx.arc(endX, endY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#22d3ee';
    ctx.fill();

    // State label
    const stateLabel = getStateLabel(theta, phi);
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(stateLabel, endX + 15, endY - 10);
  };

  const getStateLabel = (t: number, p: number) => {
    if (t < 0.1) return '|0⟩';
    if (Math.abs(t - Math.PI) < 0.1) return '|1⟩';
    if (Math.abs(t - Math.PI / 2) < 0.1) {
      if (Math.abs(p) < 0.1) return '|+⟩';
      if (Math.abs(p - Math.PI) < 0.1) return '|-⟩';
    }
    return '|ψ⟩';
  };

  const presetStates = [
    { name: '|0⟩', theta: 0, phi: 0 },
    { name: '|1⟩', theta: Math.PI, phi: 0 },
    { name: '|+⟩', theta: Math.PI / 2, phi: 0 },
    { name: '|-⟩', theta: Math.PI / 2, phi: Math.PI },
  ];

  return (
    <div className="section section-bloch">
      <h2>{content.title}</h2>
      <p className="bloch-description">{content.description}</p>

      <div className="bloch-container">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="bloch-canvas"
        />

        {content.showControls && (
          <div className="bloch-controls">
            <div className="control-group">
              <label>θ (theta): {(theta * 180 / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min="0"
                max={Math.PI}
                step="0.01"
                value={theta}
                onChange={(e) => setTheta(parseFloat(e.target.value))}
              />
            </div>
            <div className="control-group">
              <label>φ (phi): {(phi * 180 / Math.PI).toFixed(0)}°</label>
              <input
                type="range"
                min="0"
                max={2 * Math.PI}
                step="0.01"
                value={phi}
                onChange={(e) => setPhi(parseFloat(e.target.value))}
              />
            </div>
            <div className="preset-buttons">
              {presetStates.map((state) => (
                <button
                  key={state.name}
                  className="btn btn-small btn-secondary"
                  onClick={() => {
                    setTheta(state.theta);
                    setPhi(state.phi);
                  }}
                >
                  {state.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
